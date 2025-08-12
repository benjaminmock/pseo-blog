"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface PaymentDetails {
  paymentId: number;
  participantId: number;
  courseId: number | null;
  eventId: number | null;
  enrollmentId: number | null;
  registrationId: number | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionId: string | null;
  stripePaymentIntentId: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  refundAmount: number | null;
  createdAt: string;
  notes: string | null;
  processedBy: number | null;
  // Participant information
  participantName: string;
  participantEmail: string;
  participantPhone: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  medicalNotes: string | null;
  // Course information (if applicable)
  courseName: string | null;
  courseStartDate: string | null;
  courseEndDate: string | null;
  courseDescription: string | null;
  coursePrice: number | null;
  enrollmentDate: string | null;
  enrollmentStatus: string | null;
  // Event information (if applicable)
  eventName: string | null;
  eventDate: string | null;
  eventDescription: string | null;
  eventPrice: number | null;
  registrationDate: string | null;
  registrationStatus: string | null;
  // Processor information
  processorName: string;
}

export default function PaymentDetailsPage({
  params,
}: {
  params: { paymentId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    amount: 0,
    paymentMethod: "",
    notes: "",
    refundAmount: 0,
  });

  const fetchPaymentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/${params.paymentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch payment details");
      }
      const data = await response.json();
      setPayment(data.payment);
      setEditForm({
        status: data.payment.status || "pending",
        amount: data.payment.amount || 0,
        paymentMethod: data.payment.paymentMethod || "",
        notes: data.payment.notes || "",
        refundAmount: data.payment.refundAmount || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [params.paymentId]);

  useEffect(() => {
    fetchPaymentDetails();
  }, [fetchPaymentDetails]);

  // Redirect if not authenticated or not a teacher
  if (status === "loading") {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "teacher") {
    redirect("/login");
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/payments/${params.paymentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment");
      }

      await fetchPaymentDetails();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sind Sie sicher, dass Sie diese Zahlung löschen möchten?")) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/${params.paymentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete payment");
      }

      router.push("/intern/payments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Nicht verfügbar";
    return new Date(dateStr).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getStatusBadge = (
    status: string,
    type: "payment" | "enrollment" | "registration"
  ) => {
    const statusColors = {
      payment: {
        pending: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
        refunded: "bg-gray-100 text-gray-800",
        cancelled: "bg-red-100 text-red-800",
      },
      enrollment: {
        active: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        completed: "bg-blue-100 text-blue-800",
        waitlist: "bg-yellow-100 text-yellow-800",
      },
      registration: {
        confirmed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        waitlist: "bg-yellow-100 text-yellow-800",
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

  const getPaymentMethodDisplay = (method: string) => {
    const methods: { [key: string]: string } = {
      cash: "Bargeld",
      bank_transfer: "Überweisung",
      card: "Karte",
      paypal: "PayPal",
      stripe: "Stripe",
      sepa: "SEPA",
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-red-600 text-center">
          <p>Fehler beim Laden der Zahlungsdetails: {error}</p>
          <button
            onClick={fetchPaymentDetails}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">Zahlung nicht gefunden.</div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/intern" className="hover:text-gray-700">
              Intern
            </Link>
            <span>›</span>
            <Link href="/intern/payments" className="hover:text-gray-700">
              Zahlungen
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Details</span>
          </nav>
          <h1 className="text-3xl font-light text-gray-900">Zahlungsdetails</h1>
          <p className="text-gray-600 mt-2">
            Detaillierte Informationen zur Zahlung #{payment.paymentId}
          </p>
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                Bearbeiten
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Löschen
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Speichern
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Information */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Zahlungsinformationen
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              {isEditing ? (
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Ausstehend</option>
                  <option value="completed">Abgeschlossen</option>
                  <option value="failed">Fehlgeschlagen</option>
                  <option value="refunded">Erstattet</option>
                  <option value="cancelled">Storniert</option>
                </select>
              ) : (
                <div>{getStatusBadge(payment.status, "payment")}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Betrag
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900 text-lg font-semibold">
                  {formatCurrency(payment.amount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zahlungsmethode
              </label>
              {isEditing ? (
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) =>
                    setEditForm({ ...editForm, paymentMethod: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="cash">Bargeld</option>
                  <option value="bank_transfer">Überweisung</option>
                  <option value="card">Karte</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="sepa">SEPA</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {getPaymentMethodDisplay(payment.paymentMethod)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Erstellt am
              </label>
              <p className="text-gray-900">{formatDate(payment.createdAt)}</p>
            </div>

            {payment.paidAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bezahlt am
                </label>
                <p className="text-gray-900">{formatDate(payment.paidAt)}</p>
              </div>
            )}

            {payment.transactionId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaktions-ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {payment.transactionId}
                </p>
              </div>
            )}

            {payment.refundedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Erstattet am
                </label>
                <p className="text-gray-900">
                  {formatDate(payment.refundedAt)}
                </p>
              </div>
            )}

            {(payment.refundAmount || isEditing) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Erstattungsbetrag
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.refundAmount}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        refundAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {payment.refundAmount
                      ? formatCurrency(payment.refundAmount)
                      : "Keine Erstattung"}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bearbeitet von
              </label>
              <p className="text-gray-900">{payment.processorName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notizen
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">
                  {payment.notes || "Keine Notizen"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Participant Information */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Teilnehmerinformationen
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <p className="text-gray-900">{payment.participantName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <p className="text-gray-900">{payment.participantEmail}</p>
            </div>

            {payment.participantPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <p className="text-gray-900">{payment.participantPhone}</p>
              </div>
            )}

            {payment.emergencyContact && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notfallkontakt
                </label>
                <p className="text-gray-900">{payment.emergencyContact}</p>
                {payment.emergencyPhone && (
                  <p className="text-gray-600 text-sm">
                    {payment.emergencyPhone}
                  </p>
                )}
              </div>
            )}

            {payment.medicalNotes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medizinische Hinweise
                </label>
                <p className="text-gray-900 bg-yellow-50 p-2 rounded">
                  {payment.medicalNotes}
                </p>
              </div>
            )}

            <div className="pt-4">
              <Link
                href={`/intern/participants/${payment.participantId}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Vollständiges Teilnehmerprofil anzeigen →
              </Link>
            </div>
          </div>
        </div>

        {/* Course/Event Information */}
        {(payment.courseName || payment.eventName) && (
          <div className="bg-white rounded-lg p-6 border lg:col-span-2">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              {payment.courseName ? "Kursinformationen" : "Eventinformationen"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {payment.courseName ? "Kursname" : "Eventname"}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {payment.courseName || payment.eventName}
                  </p>
                </div>

                {payment.courseName && payment.courseStartDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Startdatum
                    </label>
                    <p className="text-gray-900">
                      {formatDate(payment.courseStartDate)}
                    </p>
                  </div>
                )}

                {payment.eventName && payment.eventDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eventdatum
                    </label>
                    <p className="text-gray-900">
                      {formatDate(payment.eventDate)}
                    </p>
                  </div>
                )}

                {payment.enrollmentStatus && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Anmeldungsstatus
                    </label>
                    <div>
                      {getStatusBadge(payment.enrollmentStatus, "enrollment")}
                    </div>
                  </div>
                )}

                {payment.registrationStatus && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registrierungsstatus
                    </label>
                    <div>
                      {getStatusBadge(
                        payment.registrationStatus,
                        "registration"
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {(payment.coursePrice || payment.eventPrice) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preis
                    </label>
                    <p className="text-gray-900">
                      {formatCurrency(
                        payment.coursePrice || payment.eventPrice || 0
                      )}
                    </p>
                  </div>
                )}

                {(payment.courseDescription || payment.eventDescription) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Beschreibung
                    </label>
                    <p className="text-gray-900">
                      {payment.courseDescription || payment.eventDescription}
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  {payment.enrollmentId && (
                    <Link
                      href={`/intern/enrollments/${payment.enrollmentId}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium block mb-2"
                    >
                      Anmeldung anzeigen →
                    </Link>
                  )}
                  {payment.courseId && (
                    <Link
                      href={`/kurs/${payment.courseId}/bearbeiten`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium block"
                    >
                      {payment.courseName
                        ? "Kurs bearbeiten"
                        : "Event bearbeiten"}{" "}
                      →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
