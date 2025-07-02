"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

export default function InternPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<{
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [courseFilter, setCourseFilter] = useState<
    "active" | "inactive" | "all"
  >("active");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventFilter, setEventFilter] = useState<
    "active_future" | "inactive_past"
  >("active_future");

  console.log(session?.user);

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
        // Refresh the courses list
        fetchCourses();
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Löschen des Kurses");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Fehler beim Löschen des Kurses");
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

  const deleteEvent = async (eventId: number, eventName: string) => {
    if (
      !confirm(
        `Sind Sie sicher, dass Sie das Event "${eventName}" dauerhaft löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/events/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Event wurde erfolgreich gelöscht");
        // Refresh the events list
        fetchEvents();
      } else {
        const error = await response.json();
        alert(error.error || "Fehler beim Löschen des Events");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Fehler beim Löschen des Events");
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
    } else if (status === "unauthenticated") {
      window.location.href = "/login";
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

  if (!user) {
    return null;
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
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
            Dies ist der geschützte interne Bereich. Hier findest du zusätzliche
            Informationen und Funktionen.
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
                <p className="text-sm text-gray-600">Neuen Yoga Kurs anlegen</p>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-gray-900">Meine Kurse</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="course-filter" className="text-sm text-gray-600">
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
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="active">Nur aktive Kurse</option>
                <option value="inactive">Nur inaktive Kurse</option>
                <option value="all">Alle Kurse</option>
              </select>
            </div>
          </div>

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
            (() => {
              const filteredCourses = courses.filter((course) => {
                if (courseFilter === "active") return course.active === 1;
                if (courseFilter === "inactive") return course.active === 0;
                return true; // 'all' - show all courses
              });

              return filteredCourses.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">
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
                        <div className="ml-4 flex flex-col gap-3">
                          {/* Primary Actions */}
                          <div className="flex flex-col gap-1">
                            <Link
                              href={`/kurs/${course.course_id}/bearbeiten`}
                              className="px-4 py-2 text-white rounded-lg transition-colors bg-black text-white rounded-lg hover:bg-gray-900 text-center"
                            >
                              Bearbeiten
                            </Link>
                            <Link
                              href={`/kurse/${course.slug}`}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                            >
                              Vorschau
                            </Link>
                          </div>

                          {/* Secondary Actions */}
                          <div className="flex flex-col gap-1 pt-2 border-t border-gray-200">
                            <button
                              onClick={() =>
                                toggleCourseStatus(
                                  course.course_id,
                                  course.active
                                )
                              }
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              {course.active === 1
                                ? "Deaktivieren"
                                : "Aktivieren"}
                            </button>
                            <button
                              onClick={() =>
                                deleteCourse(
                                  course.course_id,
                                  course.course_name
                                )
                              }
                              className="px-4 py-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Löschen
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>

        {/* Events Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-gray-900">Meine Events</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="event-filter" className="text-sm text-gray-600">
                Filter:
              </label>
              <select
                id="event-filter"
                value={eventFilter}
                onChange={(e) =>
                  setEventFilter(
                    e.target.value as "active_future" | "inactive_past"
                  )
                }
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="active_future">
                  Aktive Events in der Zukunft
                </option>
                <option value="inactive_past">
                  Inaktive oder vergangene Events
                </option>
              </select>
            </div>
          </div>

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
            (() => {
              const filteredEvents = events.filter((event) => {
                const eventDate = new Date(event.start_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
                const isPastEvent = eventDate < today;

                if (eventFilter === "active_future") {
                  return event.active === 1 && !isPastEvent;
                } else {
                  return event.active === 0 || isPastEvent;
                }
              });

              return filteredEvents.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">
                    {eventFilter === "active_future"
                      ? "Keine aktiven Events in der Zukunft gefunden."
                      : "Keine inaktiven oder vergangenen Events gefunden."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents
                    .sort(
                      (a, b) =>
                        new Date(b.start_date).getTime() -
                        new Date(a.start_date).getTime()
                    )
                    .map((event) => {
                      const eventDate = new Date(event.start_date);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
                      const isPastEvent = eventDate < today;

                      return (
                        <div
                          key={event.event_id}
                          className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
                            event.active === 0
                              ? "border-red-200 bg-red-50"
                              : isPastEvent
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
                                    event.active === 1
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {event.active === 1 ? "Aktiv" : "Deaktiviert"}
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
                                  <strong>Datum:</strong>{" "}
                                  {new Date(
                                    event.start_date
                                  ).toLocaleDateString("de-DE")}
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
                                    <strong>Preis:</strong>{" "}
                                    {event.price.toFixed(2)} €
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
                            <div className="ml-4 flex flex-col gap-3">
                              {/* Primary Actions */}
                              <div className="flex flex-col gap-1">
                                <Link
                                  href={`/event/${event.event_id}/bearbeiten`}
                                  className="px-4 py-2 text-white rounded-lg transition-colors bg-black text-white rounded-lg hover:bg-gray-900 text-center"
                                >
                                  Bearbeiten
                                </Link>
                                <Link
                                  href={`/events/${event.slug}`}
                                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                                >
                                  Vorschau
                                </Link>
                              </div>

                              {/* Secondary Actions */}
                              <div className="flex flex-col gap-1 pt-2 border-t border-gray-200">
                                <button
                                  onClick={() =>
                                    toggleEventStatus(
                                      event.event_id,
                                      event.active
                                    )
                                  }
                                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  {event.active === 1
                                    ? "Deaktivieren"
                                    : "Aktivieren"}
                                </button>
                                <button
                                  onClick={() =>
                                    deleteEvent(
                                      event.event_id,
                                      event.event_name
                                    )
                                  }
                                  className="px-4 py-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  Löschen
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </main>
  );
}

// Metadata needs to be in a separate layout file for client components
