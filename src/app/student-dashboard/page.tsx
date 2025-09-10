"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface EnrolledCourse {
  enrollment_id: number;
  course_id: number;
  course_name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  city_slug: string | null;
  slug: string | null;
  price: number | null;
  trainer_name: string;
  enrollment_date: string;
  status: string;
  payment_status: string;
  total_amount: number | null;
  paid_amount: number | null;
}

interface RegisteredEvent {
  registration_id: number;
  event_id: number;
  event_name: string;
  description: string;
  start_date: string;
  start_time: string | null;
  city_slug: string | null;
  slug: string | null;
  price: number | null;
  max_participants: number | null;
  trainer_name: string;
  registration_date: string;
  status: string;
  payment_status: string;
  total_amount: number | null;
  paid_amount: number | null;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<{
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>(
    []
  );
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const fetchEnrolledCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const response = await fetch("/api/enrollments/my");
      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.enrollments);
      } else {
        console.error("Failed to fetch enrolled courses");
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const response = await fetch("/api/registrations/my");
      if (response.ok) {
        const data = await response.json();
        setRegisteredEvents(data.registrations);
      } else {
        console.error("Failed to fetch registered events");
      }
    } catch (error) {
      console.error("Error fetching registered events:", error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser(session.user);

      // Check if user is a student
      if (session.user.role !== "student") {
        window.location.href = "/anbieter-dashboard";
        return;
      }

      fetchEnrolledCourses();
      fetchRegisteredEvents();
    } else if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status, session]);

  if (status === "loading") {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  if (!user || user.role !== "student") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light mb-8 text-gray-900">
          Mein Yoga Dashboard
        </h1>

        <div className="bg-white rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-2 text-gray-900">
              Willkommen, {user?.name || user?.email}!
            </h2>
            <p className="text-gray-600 mb-1">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                Rolle: Student
              </span>
            </p>
            <p className="text-gray-600">
              Hier findest du eine Übersicht über deine Kurse, Events und deinen
              Fortschritt.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Link
              href="/kurse"
              className="block p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-colors border border-purple-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Kurse entdecken
                  </h3>
                  <p className="text-sm text-gray-600">
                    Finde neue Yoga-Kurse in deiner Nähe
                  </p>
                </div>
                <span className="text-purple-600">→</span>
              </div>
            </Link>

            <Link
              href="/events"
              className="block p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg hover:from-green-100 hover:to-teal-100 transition-colors border border-green-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Events finden
                  </h3>
                  <p className="text-sm text-gray-600">
                    Entdecke Yoga-Events und Workshops
                  </p>
                </div>
                <span className="text-green-600">→</span>
              </div>
            </Link>
          </div>

          {/* Enrolled Courses Section */}
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 text-gray-900">
              Meine Kurse
            </h2>

            {isLoadingCourses ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Kurse werden geladen...</p>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">
                  Du bist noch nicht für Kurse angemeldet.
                </p>
                <Link
                  href="/kurse"
                  className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                >
                  Kurse entdecken
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.enrollment_id}
                    className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {course.course_name}
                          </h3>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              course.payment_status === "paid"
                                ? "bg-green-100 text-green-800"
                                : course.payment_status === "partial"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {course.payment_status === "paid"
                              ? "Bezahlt"
                              : course.payment_status === "partial"
                              ? "Teilweise bezahlt"
                              : "Ausstehend"}
                          </span>
                        </div>
                        {course.description && (
                          <p className="text-gray-600 mb-3">
                            {course.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>
                            <strong>Trainer:</strong> {course.trainer_name}
                          </span>
                          <span>
                            <strong>Start:</strong>{" "}
                            {new Date(course.start_date).toLocaleDateString(
                              "de-DE"
                            )}
                          </span>
                          {course.end_date && (
                            <span>
                              <strong>Ende:</strong>{" "}
                              {new Date(course.end_date).toLocaleDateString(
                                "de-DE"
                              )}
                            </span>
                          )}
                          {course.city_slug && (
                            <span>
                              <strong>Ort:</strong> {course.city_slug}
                            </span>
                          )}
                          {course.price && (
                            <span>
                              <strong>Preis:</strong> {course.price.toFixed(2)}{" "}
                              €
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link
                          href={`/kurse/${course.slug}`}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Details ansehen
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered Events Section */}
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 text-gray-900">
              Meine Events
            </h2>

            {isLoadingEvents ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Events werden geladen...</p>
              </div>
            ) : registeredEvents.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">
                  Du bist noch nicht für Events angemeldet.
                </p>
                <Link
                  href="/events"
                  className="inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Events entdecken
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {registeredEvents.map((event) => {
                  const eventDate = new Date(event.start_date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isPastEvent = eventDate < today;

                  return (
                    <div
                      key={event.registration_id}
                      className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
                        isPastEvent
                          ? "border-gray-300 bg-gray-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {event.event_name}
                            </h3>
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                event.payment_status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : event.payment_status === "partial"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {event.payment_status === "paid"
                                ? "Bezahlt"
                                : event.payment_status === "partial"
                                ? "Teilweise bezahlt"
                                : "Ausstehend"}
                            </span>
                            {isPastEvent && (
                              <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                Vergangen
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-gray-600 mb-3">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>
                              <strong>Trainer:</strong> {event.trainer_name}
                            </span>
                            <span>
                              <strong>Datum:</strong>{" "}
                              {new Date(event.start_date).toLocaleDateString(
                                "de-DE"
                              )}
                              {event.start_time &&
                                ` um ${event.start_time.slice(0, 5)}`}
                            </span>
                            {event.city_slug && (
                              <span>
                                <strong>Ort:</strong> {event.city_slug}
                              </span>
                            )}
                            {event.price && (
                              <span>
                                <strong>Preis:</strong> {event.price.toFixed(2)}{" "}
                                €
                              </span>
                            )}
                            {event.max_participants && (
                              <span>
                                <strong>Max. Teilnehmer:</strong>{" "}
                                {event.max_participants}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/events/${event.slug}`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Details ansehen
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4 text-gray-900">
              Profil & Einstellungen
            </h2>
            <div className="space-y-4">
              <Link
                href="/profil"
                className="block p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Profil bearbeiten
                    </h3>
                    <p className="text-sm text-gray-600">
                      Verwalte deine persönlichen Informationen
                    </p>
                  </div>
                  <span className="text-indigo-600">→</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
