"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AttendanceSheet from "../_components/AttendanceTracker/AttendanceSheet";

interface Course {
  courseId: number;
  courseName: string;
  trainerId: number;
  description: string;
  startDate: string;
  endDate: string;
  citySlug: string;
  slug: string;
  active: boolean;
  price: number;
  maxCapacity: number;
  currentEnrollments: number;
  trainerName: string;
}

export default function AttendancePage() {
  const { data: session, status } = useSession();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedSessionDate, setSelectedSessionDate] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role === "teacher") {
      fetchCourses();
    }
  }, [session]);

  // Redirect if not authenticated or not a teacher
  if (status === "loading") {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "teacher") {
    redirect("/login");
  }

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      setCoursesError(null);

      const response = await fetch("/api/courses/my");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      setCoursesError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900">
            Anwesenheit erfassen
          </h1>
          <p className="text-gray-600 mt-2">
            Dokumentieren Sie die Teilnahme an Kursstunden
          </p>
        </div>
      </div>

      {/* Course and Session Selection */}
      <div className="mb-6 bg-white rounded-lg p-6 border">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Kurs und Termin auswählen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="course-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kurs
            </label>
            <select
              id="course-select"
              value={selectedCourseId || ""}
              onChange={(e) =>
                setSelectedCourseId(Number(e.target.value) || null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Kurs auswählen</option>
              {loadingCourses ? (
                <option disabled>Kurse werden geladen...</option>
              ) : coursesError ? (
                <option disabled>Fehler beim Laden der Kurse</option>
              ) : courses.length === 0 ? (
                <option disabled>Keine Kurse verfügbar</option>
              ) : (
                courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseName} ({course.currentEnrollments}/
                    {course.maxCapacity} Teilnehmer)
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label
              htmlFor="session-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kurstermin
            </label>
            <input
              type="date"
              id="session-date"
              value={selectedSessionDate}
              onChange={(e) => setSelectedSessionDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Attendance Sheet */}
      {selectedCourseId && selectedSessionDate && (
        <AttendanceSheet
          courseId={selectedCourseId}
          sessionDate={selectedSessionDate}
        />
      )}

      {/* Instructions */}
      {(!selectedCourseId || !selectedSessionDate) && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Anwesenheit erfassen
          </h3>
          <div className="space-y-3 text-gray-600">
            <p>
              1. <strong>Kurs auswählen:</strong> Wählen Sie den Kurs aus, für
              den Sie die Anwesenheit erfassen möchten.
            </p>
            <p>
              2. <strong>Termin festlegen:</strong> Geben Sie das Datum der
              Kursstunde an.
            </p>
            <p>
              3. <strong>Anwesenheit markieren:</strong> Markieren Sie die
              anwesenden Teilnehmer und fügen Sie bei Bedarf Notizen hinzu.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">Schnellzugriff</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedSessionDate(
                      new Date().toISOString().split("T")[0]
                    );
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                >
                  Heutiges Datum setzen
                </button>
                <button
                  onClick={() => {
                    /* TODO: Load recent sessions */
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                >
                  Letzte Termine anzeigen
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">Statistiken</h4>
              <p className="text-sm text-gray-600">
                Übersicht über Anwesenheitsraten und Trends
              </p>
              {/* TODO: Add attendance statistics */}
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">Berichte</h4>
              <p className="text-sm text-gray-600">
                Exportieren Sie Anwesenheitslisten und Berichte
              </p>
              {/* TODO: Add export functionality */}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
