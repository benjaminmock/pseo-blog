"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface CourseStats {
  activeCourses: number;
  totalEnrollments: number;
  upcomingCourses: number;
  completedCourses: number;
}

interface Course {
  courseId: number;
  courseName: string;
  description: string;
  startDate: string;
  endDate: string | null;
  citySlug: string | null;
  slug: string | null;
  active: number;
  price: number | null;
  maxCapacity: number | null;
  currentEnrollments: number;
  trainerName: string;
}

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState<
    "active" | "inactive" | "all"
  >("active");

  const handleNewCourse = () => {
    router.push("/kurs/neu");
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/courses/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching course stats:", error);
      // Fallback to empty stats on error
      setStats({
        activeCourses: 0,
        totalEnrollments: 0,
        upcomingCourses: 0,
        completedCourses: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await fetch("/api/courses/my");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await response.json();
      setCourses(data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const toggleCourseStatus = async (
    courseId: number,
    currentStatus: number
  ) => {
    try {
      const newStatus = currentStatus === 1 ? false : true;
      const response = await fetch("/api/courses/deactivate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
          active: newStatus,
        }),
      });

      if (response.ok) {
        // Refresh the courses list and stats
        fetchCourses();
        fetchStats();
      } else {
        console.error("Failed to update course status");
      }
    } catch (error) {
      console.error("Error updating course status:", error);
    }
  };

  const deleteCourse = async (courseId: number, courseName: string) => {
    if (
      !confirm(
        `Sind Sie sicher, dass Sie den Kurs "${courseName}" dauerhaft löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/courses/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Kurs wurde erfolgreich gelöscht");
        // Refresh the courses list and stats
        fetchCourses();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Löschen des Kurses");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Fehler beim Löschen des Kurses");
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "teacher") {
      fetchStats();
      fetchCourses();
    }
  }, [session, status]);

  // Debug logging
  console.log("🔍 Kurse page - Session status:", status);
  console.log("🔍 Kurse page - Session data:", session);
  console.log("🔍 Kurse page - User role:", session?.user?.role);

  // Redirect if not authenticated or not a teacher
  if (status === "loading") {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  if (status === "unauthenticated") {
    console.log("❌ Kurse page - User not authenticated, redirecting to login");
    redirect("/login");
  }

  if (session?.user?.role !== "teacher") {
    console.log(`❌ Kurse page - User role '${session?.user?.role}' is not teacher, redirecting to login`);
    redirect("/login");
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Kurse verwalten</h1>
          <p className="text-gray-600 mt-2">
            Übersicht und Verwaltung aller Kurse
          </p>
        </div>

        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="text-gray-900 font-medium">Kurse</span>
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={handleNewCourse}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          Neuen Kurs erstellen
        </button>
        <button
          onClick={() => {
            /* TODO: Implement course import */
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Kurse importieren
        </button>
        <button
          onClick={() => {
            /* TODO: Implement export */
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Liste exportieren
        </button>
      </div>

      {/* Main Content - Course List */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900">Alle Kurse</h2>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="course-filter"
                  className="text-sm text-gray-600"
                >
                  Filter:
                </label>
                <select
                  id="course-filter"
                  value={courseFilter}
                  onChange={(e) =>
                    setCourseFilter(
                      e.target.value as "active" | "inactive" | "all"
                    )
                  }
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="active">Nur aktive Kurse</option>
                  <option value="inactive">Nur inaktive Kurse</option>
                  <option value="all">Alle Kurse</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {coursesLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Noch keine Kurse erstellt.</p>
                <button
                  onClick={handleNewCourse}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Ersten Kurs erstellen
                </button>
              </div>
            ) : (
              (() => {
                const filteredCourses = courses.filter((course) => {
                  if (courseFilter === "active") return course.active === 1;
                  if (courseFilter === "inactive") return course.active === 0;
                  return true; // 'all' - show all courses
                });

                return filteredCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {courseFilter === "active"
                        ? "Keine aktiven Kurse gefunden."
                        : courseFilter === "inactive"
                        ? "Keine inaktiven Kurse gefunden."
                        : "Keine Kurse gefunden."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCourses.map((course) => (
                      <div
                        key={course.courseId}
                        className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                          course.active === 0
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-medium text-gray-900">
                                {course.courseName}
                              </h3>
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  course.active === 1
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {course.active === 1 ? "Aktiv" : "Deaktiviert"}
                              </span>
                            </div>

                            {course.description && (
                              <p className="text-gray-600 mb-4">
                                {course.description}
                              </p>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">
                                  Start:
                                </span>
                                <p className="text-gray-600">
                                  {new Date(
                                    course.startDate
                                  ).toLocaleDateString("de-DE")}
                                </p>
                              </div>
                              {course.endDate && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Ende:
                                  </span>
                                  <p className="text-gray-600">
                                    {new Date(
                                      course.endDate
                                    ).toLocaleDateString("de-DE")}
                                  </p>
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-gray-700">
                                  Anmeldungen:
                                </span>
                                <p className="text-gray-600">
                                  {course.currentEnrollments}
                                  {course.maxCapacity &&
                                    ` / ${course.maxCapacity}`}
                                </p>
                              </div>
                              {course.price && (
                                <div>
                                  <span className="font-medium text-gray-700">
                                    Preis:
                                  </span>
                                  <p className="text-gray-600">
                                    {course.price.toFixed(2)} €
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="ml-6 flex flex-col gap-2">
                            <Link
                              href={`/kurs/${course.courseId}/bearbeiten`}
                              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-center text-sm"
                            >
                              Bearbeiten
                            </Link>
                            {course.slug && (
                              <Link
                                href={`/kurse/${course.slug}`}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm"
                              >
                                Vorschau
                              </Link>
                            )}
                            <button
                              onClick={() =>
                                toggleCourseStatus(
                                  course.courseId,
                                  course.active
                                )
                              }
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                              {course.active === 1
                                ? "Deaktivieren"
                                : "Aktivieren"}
                            </button>
                            <button
                              onClick={() =>
                                deleteCourse(course.courseId, course.courseName)
                              }
                              className="px-4 py-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                            >
                              Löschen
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Aktive Kurse
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.activeCourses ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Laufende Kurse</p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Anmeldungen
          </h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.totalEnrollments ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Gesamt Teilnehmer</p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Kommende Kurse
          </h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.upcomingCourses ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Geplante Kurse</p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Abgeschlossen
          </h3>
          <p className="text-2xl font-bold text-gray-600 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.completedCourses ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Beendete Kurse</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Verwandte Aktionen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleNewCourse}
            className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Neuen Kurs erstellen</h4>
            <p className="text-sm text-gray-600 mt-1">
              Neuen Kurs mit Terminen und Inhalten anlegen
            </p>
          </button>

          <button
            onClick={() => router.push("/intern/enrollments")}
            className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Anmeldungen verwalten</h4>
            <p className="text-sm text-gray-600 mt-1">
              Kursanmeldungen und Teilnehmer verwalten
            </p>
          </button>

          <button
            onClick={() => router.push("/intern/attendance")}
            className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Anwesenheit erfassen</h4>
            <p className="text-sm text-gray-600 mt-1">
              Teilnahme an Kursstunden dokumentieren
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}
