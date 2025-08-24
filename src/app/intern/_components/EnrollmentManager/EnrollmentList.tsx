"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CourseEnrollment } from "@prisma/client";

interface EnrollmentWithDetails extends CourseEnrollment {
  participantName: string;
  participantEmail: string;
  courseName: string;
  trainerName: string;
  courseStartDate: string;
}

interface EnrollmentListProps {
  courseId?: number;
  participantId?: number;
}

interface Course {
  courseId: number;
  courseName: string;
  startDate: string;
  endDate: string;
}

export default function EnrollmentList({
  courseId,
  participantId,
}: EnrollmentListProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/api/enrollments";

      if (courseId) {
        url = `/api/enrollments/course/${courseId}`;
      } else if (participantId) {
        url = `/api/enrollments?participantId=${participantId}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch enrollments");
      }
      const data = await response.json();
      setEnrollments(data.enrollments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [courseId, participantId]);

  useEffect(() => {
    fetchEnrollments();
    // Only fetch courses if we're not filtering by a specific course
    if (!courseId) {
      fetchCourses();
    }
  }, [courseId, participantId, fetchEnrollments]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses/my");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      // Don't set error state for courses fetch failure, just log it
    }
  };

  const updateEnrollmentStatus = async (
    enrollmentId: number,
    status: string
  ) => {
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update enrollment status");
      }

      await fetchEnrollments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const statusMatch =
      statusFilter === "all" || enrollment.status === statusFilter;
    const paymentMatch =
      paymentFilter === "all" || enrollment.paymentStatus === paymentFilter;
    const courseMatch =
      courseFilter === "all" ||
      enrollment.courseId?.toString() === courseFilter;
    return statusMatch && paymentMatch && courseMatch;
  });

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
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="text-red-600 text-center">
          <p>Fehler beim Laden der Anmeldungen: {error}</p>
          <button
            onClick={fetchEnrollments}
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">
          {courseId
            ? "Kurs-Anmeldungen"
            : participantId
            ? "Meine Anmeldungen"
            : "Alle Anmeldungen"}
          ({filteredEnrollments.length})
        </h2>
        <Link
          href={`/intern/enrollments/new${
            courseId
              ? `?courseId=${courseId}`
              : participantId
              ? `?participantId=${participantId}`
              : ""
          }`}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          Neue Anmeldung
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Alle Status</option>
            <option value="active">Aktiv</option>
            <option value="cancelled">Storniert</option>
            <option value="completed">Abgeschlossen</option>
            <option value="waitlist">Warteliste</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="payment-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Zahlungsstatus
          </label>
          <select
            id="payment-filter"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Alle Zahlungen</option>
            <option value="pending">Ausstehend</option>
            <option value="paid">Bezahlt</option>
            <option value="partial">Teilweise bezahlt</option>
            <option value="refunded">Erstattet</option>
          </select>
        </div>
        {!courseId && (
          <div>
            <label
              htmlFor="course-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kurs
            </label>
            <select
              id="course-filter"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Alle Kurse</option>
              {courses.map((course) => (
                <option
                  key={course.courseId}
                  value={course.courseId.toString()}
                >
                  {course.courseName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Enrollments List */}
      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Keine Anmeldungen gefunden.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnrollments.map((enrollment) => (
            <div
              key={enrollment.enrollmentId}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {!courseId && enrollment.courseName}
                      {!participantId && enrollment.participantName}
                      {courseId && participantId && "Anmeldung"}
                    </h3>
                    {getStatusBadge(
                      enrollment.status || "active",
                      "enrollment"
                    )}
                    {getStatusBadge(
                      enrollment.paymentStatus || "pending",
                      "payment"
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    {!courseId && (
                      <div>
                        <span className="font-medium">Kurs:</span>{" "}
                        {enrollment.courseName}
                        <br />
                        <span className="font-medium">Trainer:</span>{" "}
                        {enrollment.trainerName}
                        <br />
                        <span className="font-medium">Start:</span>{" "}
                        {formatDate(enrollment.courseStartDate)}
                      </div>
                    )}

                    {!participantId && (
                      <div>
                        <span className="font-medium">Teilnehmer:</span>{" "}
                        {enrollment.participantName}
                        <br />
                        <span className="font-medium">E-Mail:</span>{" "}
                        {enrollment.participantEmail}
                      </div>
                    )}

                    <div>
                      <span className="font-medium">Anmeldedatum:</span>{" "}
                      {formatDate(enrollment.enrollmentDate || "")}
                      <br />
                      {enrollment.totalAmount && (
                        <>
                          <span className="font-medium">Gesamtbetrag:</span>{" "}
                          {formatCurrency(enrollment.totalAmount)}
                          <br />
                          <span className="font-medium">Bezahlt:</span>{" "}
                          {formatCurrency(enrollment.paidAmount || 0)}
                        </>
                      )}
                    </div>
                  </div>

                  {enrollment.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">Notizen:</span>{" "}
                      {enrollment.notes}
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Link
                    href={`/intern/enrollments/${enrollment.enrollmentId}`}
                    className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-center"
                  >
                    Details
                  </Link>

                  {enrollment.status === "active" && (
                    <button
                      onClick={() =>
                        updateEnrollmentStatus(
                          enrollment.enrollmentId!,
                          "cancelled"
                        )
                      }
                      className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      Stornieren
                    </button>
                  )}

                  {enrollment.status === "cancelled" && (
                    <button
                      onClick={() =>
                        updateEnrollmentStatus(
                          enrollment.enrollmentId!,
                          "active"
                        )
                      }
                      className="px-3 py-1 text-sm border border-green-300 text-green-600 rounded hover:bg-green-50 transition-colors"
                    >
                      Reaktivieren
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
