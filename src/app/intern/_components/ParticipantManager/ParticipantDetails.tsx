"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Participant,
  CourseEnrollment,
  EventRegistration,
  Payment,
} from "@prisma/client";

interface ParticipantWithDetails extends Participant {
  enrollments: Array<
    CourseEnrollment & {
      courseName: string;
      trainerName: string;
    }
  >;
  registrations: Array<
    EventRegistration & {
      eventName: string;
      eventDate: string;
      trainerName: string;
    }
  >;
  payments: Array<
    Payment & {
      courseName?: string;
      eventName?: string;
    }
  >;
  attendanceRate: number;
  totalPaid: number;
  outstandingBalance: number;
}

interface ParticipantDetailsProps {
  participantId: number;
  onEdit?: () => void;
}

export default function ParticipantDetails({
  participantId,
  onEdit,
}: ParticipantDetailsProps) {
  const [participant, setParticipant] = useState<ParticipantWithDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "enrollments" | "payments" | "attendance"
  >("overview");

  const fetchParticipantDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/participants/${participantId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch participant details");
      }
      const data = await response.json();

      // Calculate additional metrics
      const totalPaidFromPayments =
        data.payments?.reduce(
          (sum: number, payment: { status: string; amount: number }) =>
            sum + (payment.status === "completed" ? payment.amount || 0 : 0),
          0
        ) || 0;

      const totalOwed =
        data.enrollments.reduce(
          (sum: number, enrollment: { totalAmount?: number }) =>
            sum + (enrollment.totalAmount || 0),
          0
        ) +
        (data.registrations?.reduce(
          (sum: number, registration: { totalAmount?: number }) =>
            sum + (registration.totalAmount || 0),
          0
        ) || 0);

      const outstandingBalance = totalOwed - totalPaidFromPayments;

      // Calculate attendance rate
      const totalSessions = data.attendance?.length || 0;
      const attendedSessions =
        data.attendance?.filter((a: { attended: boolean }) => a.attended)
          .length || 0;
      const attendanceRate =
        totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

      // Merge participant with additional data
      const participantWithDetails: ParticipantWithDetails = {
        ...data.participant,
        enrollments: data.enrollments || [],
        registrations: data.registrations || [],
        payments: data.payments || [],
        attendanceRate,
        totalPaid: totalPaidFromPayments,
        outstandingBalance,
      };

      setParticipant(participantWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [participantId]);

  useEffect(() => {
    fetchParticipantDetails();
  }, [fetchParticipantDetails]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getStatusBadge = (
    status: string,
    type: "enrollment" | "registration" | "payment"
  ) => {
    const statusColors = {
      enrollment: {
        active: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        completed: "bg-blue-100 text-blue-800",
        waitlist: "bg-yellow-100 text-yellow-800",
      },
      registration: {
        registered: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        attended: "bg-blue-100 text-blue-800",
        no_show: "bg-gray-100 text-gray-800",
      },
      payment: {
        pending: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
        refunded: "bg-gray-100 text-gray-800",
        cancelled: "bg-red-100 text-red-800",
      },
    };

    const colorClass =
      statusColors[type][status as keyof (typeof statusColors)[typeof type]] ||
      "bg-gray-100 text-gray-800";

    return (
      <span
        className={`inline-block px-2 py-1 rounded text-xs font-medium ${colorClass}`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="text-red-600 text-center">
          <p>Fehler beim Laden der Teilnehmerdetails: {error}</p>
          <button
            onClick={fetchParticipantDetails}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-medium text-gray-900">
            {participant.fullName}
          </h2>
          <p className="text-gray-600">{participant.email}</p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Bearbeiten
            </button>
          )}
          <Link
            href={`/intern/participants/${participantId}/edit`}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900 transition-colors"
          >
            Bearbeiten
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Übersicht" },
            { id: "enrollments", label: "Kurse" },
            { id: "payments", label: "Zahlungen" },
            { id: "attendance", label: "Anwesenheit" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {participant.enrollments.length}
              </div>
              <div className="text-sm text-gray-600">Aktive Kurse</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {participant.registrations.length}
              </div>
              <div className="text-sm text-gray-600">Event-Anmeldungen</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(participant.totalPaid)}
              </div>
              <div className="text-sm text-gray-600">Gesamt bezahlt</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {participant.attendanceRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Anwesenheitsrate</div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Persönliche Informationen
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-600">Telefon</dt>
                  <dd className="text-sm font-medium">
                    {participant.phone || "Nicht angegeben"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Geburtsdatum</dt>
                  <dd className="text-sm font-medium">
                    {participant.dateOfBirth
                      ? formatDate(participant.dateOfBirth)
                      : "Nicht angegeben"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Adresse</dt>
                  <dd className="text-sm font-medium">
                    {participant.address ? (
                      <>
                        {participant.address}
                        <br />
                        {participant.postalCode} {participant.city}
                      </>
                    ) : (
                      "Nicht angegeben"
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Notfallkontakt
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-600">Name</dt>
                  <dd className="text-sm font-medium">
                    {participant.emergencyContact || "Nicht angegeben"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Telefon</dt>
                  <dd className="text-sm font-medium">
                    {participant.emergencyPhone || "Nicht angegeben"}
                  </dd>
                </div>
              </dl>

              {participant.medicalNotes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Medizinische Hinweise
                  </h4>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded">
                    {participant.medicalNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "enrollments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Kurs-Anmeldungen ({participant.enrollments.length})
            </h3>
            <Link
              href={`/intern/enrollments/new?participantId=${participantId}`}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900 transition-colors"
            >
              Zu Kurs anmelden
            </Link>
          </div>

          {participant.enrollments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Noch keine Kurs-Anmeldungen vorhanden.
            </div>
          ) : (
            <div className="space-y-3">
              {participant.enrollments.map((enrollment) => (
                <div
                  key={enrollment.enrollmentId}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {enrollment.courseName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Trainer: {enrollment.trainerName}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        {getStatusBadge(
                          enrollment.status || "active",
                          "enrollment"
                        )}
                        <span className="text-sm text-gray-600">
                          Angemeldet:{" "}
                          {formatDate(enrollment.enrollmentDate || "")}
                        </span>
                        {enrollment.totalAmount && (
                          <span className="text-sm text-gray-600">
                            {formatCurrency(enrollment.totalAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/intern/enrollments/${enrollment.enrollmentId}`}
                      className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Zahlungen ({participant.payments.length})
            </h3>
            <Link
              href={`/intern/payments/new?participantId=${participantId}`}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900 transition-colors"
            >
              Zahlung erfassen
            </Link>
          </div>

          {participant.outstandingBalance > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-yellow-800">
                  <strong>
                    Offener Betrag:{" "}
                    {formatCurrency(participant.outstandingBalance)}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {participant.payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Noch keine Zahlungen erfasst.
            </div>
          ) : (
            <div className="space-y-3">
              {participant.payments.map((payment) => (
                <div key={payment.paymentId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </span>
                        {getStatusBadge(payment.status || "pending", "payment")}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {payment.courseName ||
                          payment.eventName ||
                          "Allgemeine Zahlung"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{payment.paymentMethod || "Unbekannt"}</span>
                        <span>
                          {payment.paidAt
                            ? formatDate(payment.paidAt)
                            : formatDate(payment.createdAt || "")}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/intern/payments/${payment.paymentId}`}
                      className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Anwesenheit</h3>
          <div className="text-center py-8 text-gray-500">
            Anwesenheitsdaten werden hier angezeigt.
            <br />
            <Link
              href={`/intern/attendance?participantId=${participantId}`}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Anwesenheit verwalten
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
