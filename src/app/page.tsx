"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import WhyYogaSection from "@/components/home/WhyYogaSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

interface Course {
  course_id: number;
  course_name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  city_slug: string | null;
  slug: string | null;
  active: number;
  first_name: string;
  last_name: string;
}

interface Event {
  event_id: number;
  event_name: string;
  description: string;
  start_date: string;
  start_time: string | null;
  city_slug: string | null;
  slug: string | null;
  active: number;
  max_participants: number | null;
  price: number | null;
  first_name: string;
  last_name: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<{
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const response = await fetch("/api/courses/my");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      } else {
        console.error("Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const response = await fetch("/api/events/my");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoadingEvents(false);
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
        // Refresh the courses list
        fetchCourses();
      } else {
        console.error("Failed to update course status");
      }
    } catch (error) {
      console.error("Error updating course status:", error);
    }
  };

  const toggleEventStatus = async (eventId: number, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? false : true;
      const response = await fetch("/api/events/deactivate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
          active: newStatus,
        }),
      });

      if (response.ok) {
        // Refresh the events list
        fetchEvents();
      } else {
        console.error("Failed to update event status");
      }
    } catch (error) {
      console.error("Error updating event status:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser(session.user);

      // Check if there's a stored role in localStorage
      const storedRole = localStorage.getItem("selectedUserRole");

      if (storedRole && session.user.role !== storedRole) {
        // Update the user's role in the database
        updateUserRole(storedRole);
      }

      // Clear the stored role
      localStorage.removeItem("selectedUserRole");

      // Fetch user's courses and events
      fetchCourses();
      fetchEvents();
    }
  }, [status, session]);

  const updateUserRole = async (role: string) => {
    try {
      // Call an API endpoint to update the user's role
      const response = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser((prev) => (prev ? { ...prev, role: updatedUser.role } : null));
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  if (status === "loading") {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  // Show intern page content for authenticated users
  if (status === "authenticated" && user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <main className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-light mb-8 text-gray-900">
            Interner Bereich
          </h1>

          <div className="bg-white rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-2 text-gray-900">
                Willkommen, {user.name || user.email}!
              </h2>
              <p className="text-gray-600 mb-1">
                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm">
                  Rolle:{" "}
                  {user.role === "student"
                    ? "Student"
                    : user.role === "teacher"
                    ? "Lehrer*in/Trainer*in"
                    : user.role}
                </span>
              </p>
              <p className="text-gray-600">
                Dies ist der geschützte interne Bereich. Hier findest du
                zusätzliche Informationen und Funktionen.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/profil"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Dein Profil
                    </h3>
                    <p className="text-sm text-gray-600">
                      Verwalte deine persönlichen Einstellungen
                    </p>
                  </div>
                  <span className="text-indigo-900">→</span>
                </div>
              </Link>

              <Link
                href="/kurs/neu"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Kurs erstellen
                    </h3>
                    <p className="text-sm text-gray-600">
                      Neuen Yoga Kurs anlegen
                    </p>
                  </div>
                  <span className="text-indigo-900">→</span>
                </div>
              </Link>

              <Link
                href="/event/neu"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Event erstellen
                    </h3>
                    <p className="text-sm text-gray-600">
                      Neues Yoga Event anlegen
                    </p>
                  </div>
                  <span className="text-indigo-900">→</span>
                </div>
              </Link>
            </div>

            {/* Courses Section */}
            <div className="mt-8">
              <h2 className="text-xl font-medium mb-4 text-gray-900">
                Meine Kurse
              </h2>

              {isLoadingCourses ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Kurse werden geladen...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    {user?.role === "teacher"
                      ? "Sie haben noch keine Kurse erstellt."
                      : "Sie sind noch nicht als Trainer registriert oder haben keine Kurse erstellt."}
                  </p>
                  {user?.role === "teacher" && (
                    <Link
                      href="/kurs/neu"
                      className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                    >
                      Ersten Kurs erstellen
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div
                      key={course.course_id}
                      className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
                        course.active === 0
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {course.course_name}
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
                            <p className="text-gray-600 mb-3">
                              {course.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
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
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <Link
                            href={`/kurs/${course.course_id}/bearbeiten`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            Bearbeiten
                          </Link>
                          <Link
                            href={`/kurse/${course.course_id}`}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            Vorschau →
                          </Link>
                          <button
                            onClick={() =>
                              toggleCourseStatus(
                                course.course_id,
                                course.active
                              )
                            }
                            className={`text-sm font-medium ${
                              course.active === 1
                                ? "text-red-600 hover:text-red-800"
                                : "text-green-600 hover:text-green-800"
                            }`}
                          >
                            {course.active === 1
                              ? "Deaktivieren"
                              : "Aktivieren"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Events Section */}
            <div className="mt-8">
              <h2 className="text-xl font-medium mb-4 text-gray-900">
                Meine Events
              </h2>

              {isLoadingEvents ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Events werden geladen...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    {user?.role === "teacher"
                      ? "Sie haben noch keine Events erstellt."
                      : "Sie sind noch nicht als Trainer registriert oder haben keine Events erstellt."}
                  </p>
                  {user?.role === "teacher" && (
                    <Link
                      href="/event/neu"
                      className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                    >
                      Erstes Event erstellen
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.event_id}
                      className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
                        event.active === 0
                          ? "border-red-200 bg-red-50"
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
                                event.active === 1
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {event.active === 1 ? "Aktiv" : "Deaktiviert"}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-gray-600 mb-3">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
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
                        <div className="ml-4 flex flex-col gap-2">
                          <Link
                            href={`/event/${event.event_id}/bearbeiten`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            Bearbeiten
                          </Link>
                          <button
                            onClick={() =>
                              toggleEventStatus(event.event_id, event.active)
                            }
                            className={`text-sm font-medium ${
                              event.active === 1
                                ? "text-red-600 hover:text-red-800"
                                : "text-green-600 hover:text-green-800"
                            }`}
                          >
                            {event.active === 1 ? "Deaktivieren" : "Aktivieren"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show original homepage for unauthenticated users
  return (
    <div className="space-y-16 -mt-8">
      <HeroSection />

      <SearchSection />

      {/* Benefits Sections */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16">
          <BenefitsSection
            title="Für Yoga Schüler*innne"
            benefits={[
              {
                title: "Große Auswahl",
                description:
                  "Zugang zu hunderten von Yoga-Kursen für alle Level",
              },
              {
                title: "Geprüfte Lehrer",
                description:
                  "Lerne von zertifizierten Lehrern mit echten Bewertungen",
              },
              // {
              //   title: "Flexible Buchung",
              //   description: "Buche Kurse einfach mit sicherer Bezahlung",
              // },
            ]}
          />
          <BenefitsSection
            title="Für Yoga Lehrer*innen"
            benefits={[
              {
                title: "Geschäft ausbauen",
                description:
                  "Erreiche mehr Schüler und erweitere deine Präsenz",
              },
              {
                title: "100% Verdienst",
                description: "Keine Plattform-Gebühren - du behältst alles",
              },
              {
                title: "Einfache Verwaltung (coming soon)",
                description: "Praktische Tools für Kurs- und Schülermanagement",
              },
            ]}
          />
        </div>
      </section>

      {/* <FeaturedSection /> */}

      <WhyYogaSection />

      {/* <TestimonialsSection /> */}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bereit, deine Yoga-Reise zu beginnen?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Kurse finden
            </button>
            <button className="bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors">
              Als Lehrer registrieren
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
