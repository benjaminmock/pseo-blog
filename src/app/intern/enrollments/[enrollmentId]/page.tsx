"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface EnrollmentDetails {
  enrollmentId: number;
  participantId: number;
  courseId: number;
  enrollmentDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  paidAmount: number;
  notes: string;
  enrolledBy: number;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalNotes: string;
  courseName: string;
  courseStartDate: string;
  courseEndDate: string;
  courseDescription: string;
  coursePrice: number;
  trainerName: string;
}

export default function EnrollmentDetailsPage({
  params,
}: {
  params: { enrollmentId: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<EnrollmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    paymentStatus: "",
    totalAmount: 0,
    paidAmount: 0,
    notes: "",
  });

  const fetchEnrollmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/enrollments/${params.enrollmentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch enrollment details");
      }
      const data = await response.json();
      setEnrollment(data.enrollment);
      setEditForm({
        status: data.enrollment.status || "active",
        paymentStatus: data.enrollment.paymentStatus || "pending",
        totalAmount: data.enrollment.totalAmount || 0,
        paidAmount: data.enrollment.paidAmount || 0,
        notes: data.enrollment.notes || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [params.enrollmentId]);

  useEffect(() => {
    fetchEnrollmentDetails();
  }, [fetchEnrollmentDetails]);

  // Redirect if not authenticated or not a teacher
  if (status === "loading") {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "teacher") {
    redirect("/login");
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/enrollments/${params.enrollmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update enrollment");
      }

      await fetchEnrollmentDetails();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm("Sind Sie sicher, dass Sie diese Anmeldung löschen möchten?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/enrollments/${params.enrollmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete enrollment");
      }

      router.push("/intern/enrollments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getStatusBadge = (status: string, type: "enrollment" | "payment") => {
    const statusColors = {
      enrollment: {
        active: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        completed: "bg-blue-100 text-blue-800",
        waitlist: "bg-yellow-100 text-yellow-800",
      },
      payment: {
        pending: "bg-yellow-100 text-yellow-800",
        paid: "bg-green-100 text-green-800",
        partial: "bg-orange-100 text-orange-800",
        refunded: "bg-gray-100 text-gray-800",
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
          <p>Fehler beim Laden der Anmeldungsdetails: {error}</p>
          <button
            onClick={fetchEnrollmentDetails}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">
          Anmeldung nicht gefunden.
        </div>
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
            <Link href="/intern/enrollments" className="hover:text-gray-700">
              Anmeldungen
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Details</span>
          </nav>
          <h1 className="text-3xl font-light text-gray-900">
            Anmeldungsdetails
          </h1>
          <p className="text-gray-600 mt-2">
            Detaillierte Informationen zur Anmeldung #{enrollment.enrollmentId}
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
        {/* Enrollment Information */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Anmeldungsinformationen
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
                  <option value="active">Aktiv</option>
                  <option value="cancelled">Storniert</option>
                  <option value="completed">Abgeschlossen</option>
                  <option value="waitlist">Warteliste</option>
                </select>
              ) : (
                <div>{getStatusBadge(enrollment.status, "enrollment")}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zahlungsstatus
              </label>
              {isEditing ? (
                <select
                  value={editForm.paymentStatus}
                  onChange={(e) =>
                    setEditForm({ ...editForm, paymentStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Ausstehend</option>
                  <option value="paid">Bezahlt</option>
                  <option value="partial">Teilweise bezahlt</option>
                  <option value="refunded">Erstattet</option>
                </select>
              ) : (
                <div>{getStatusBadge(enrollment.paymentStatus, "payment")}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anmeldedatum
              </label>
              <p className="text-gray-900">
                {formatDate(enrollment.enrollmentDate)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gesamtbetrag
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editForm.totalAmount}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      totalAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">
                  {formatCurrency(enrollment.totalAmount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bezahlter Betrag
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editForm.paidAmount}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      paidAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-gray-900">
                  {formatCurrency(enrollment.paidAmount)}
                </p>
              )}
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
                  {enrollment.notes || "Keine Notizen"}
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
              <p className="text-gray-900">{enrollment.participantName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <p className="text-gray-900">{enrollment.participantEmail}</p>
            </div>

            {enrollment.participantPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <p className="text-gray-900">{enrollment.participantPhone}</p>
              </div>
            )}

            {enrollment.emergencyContact && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notfallkontakt
                </label>
                <p className="text-gray-900">{enrollment.emergencyContact}</p>
                {enrollment.emergencyPhone && (
                  <p className="text-gray-600 text-sm">
                    {enrollment.emergencyPhone}
                  </p>
                )}
              </div>
            )}

            {enrollment.medicalNotes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medizinische Hinweise
                </label>
                <p className="text-gray-900 bg-yellow-50 p-2 rounded">
                  {enrollment.medicalNotes}
                </p>
              </div>
            )}

            <div className="pt-4">
              <Link
                href={`/intern/participants/${enrollment.participantId}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Vollständiges Teilnehmerprofil anzeigen →
              </Link>
            </div>
          </div>
        </div>

        {/* Course Information */}
        <div className="bg-white rounded-lg p-6 border lg:col-span-2">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Kursinformationen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kursname
                </label>
                <p className="text-gray-900 font-medium">
                  {enrollment.courseName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trainer
                </label>
                <p className="text-gray-900">{enrollment.trainerName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Startdatum
                </label>
                <p className="text-gray-900">
                  {formatDate(enrollment.courseStartDate)}
                </p>
              </div>

              {enrollment.courseEndDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enddatum
                  </label>
                  <p className="text-gray-900">
                    {formatDate(enrollment.courseEndDate)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {enrollment.coursePrice && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kurspreis
                  </label>
                  <p className="text-gray-900">
                    {formatCurrency(enrollment.coursePrice)}
                  </p>
                </div>
              )}

              {enrollment.courseDescription && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung
                  </label>
                  <p className="text-gray-900">
                    {enrollment.courseDescription}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Link
                  href={`/kurs/${enrollment.courseId}/bearbeiten`}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Kurs bearbeiten →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
