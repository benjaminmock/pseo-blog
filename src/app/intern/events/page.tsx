"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface EventStats {
  activeEvents: number;
  totalRegistrations: number;
  upcomingEvents: number;
  completedEvents: number;
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

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<EventStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventFilter, setEventFilter] = useState<
    "active_future" | "inactive_past"
  >("active_future");

  const handleNewEvent = () => {
    router.push("/event/neu");
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/events/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching event stats:", error);
      // Fallback to mock data if API fails
      setStats({
        activeEvents: 0,
        totalRegistrations: 0,
        upcomingEvents: 0,
        completedEvents: 0,
      });
    } finally {
      setStatsLoading(false);
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
        // Refresh the events list and stats
        fetchEvents();
        fetchStats();
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
        // Refresh the events list and stats
        fetchEvents();
        fetchStats();
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
    if (status === "authenticated" && session?.user?.role === "teacher") {
      fetchStats();
      fetchEvents();
    }
  }, [session, status]);

  // Redirect if not authenticated or not a teacher
  if (status === "loading") {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "teacher") {
    redirect("/login");
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900">
            Events verwalten
          </h1>
          <p className="text-gray-600 mt-2">
            Übersicht und Verwaltung aller Events
          </p>
        </div>

        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="text-gray-900 font-medium">Events</span>
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={handleNewEvent}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          Neues Event erstellen
        </button>
        <button
          onClick={() => {
            /* TODO: Implement event import */
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Events importieren
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

      {/* Main Content - Event List */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900">Event Liste</h2>
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
          </div>

          <div className="p-6">
            {isLoadingEvents ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Events werden geladen...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Sie haben noch keine Events erstellt.
                </p>
                <button
                  onClick={handleNewEvent}
                  className="inline-block bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900"
                >
                  Erstes Event erstellen
                </button>
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
                  <div className="text-center py-8">
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
                        today.setHours(0, 0, 0, 0);
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
                                    {event.active === 1
                                      ? "Aktiv"
                                      : "Deaktiviert"}
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
      </div>

      {/* Statistics Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Aktive Events
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.activeEvents ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Aktiv und in der Zukunft</p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Anmeldungen
          </h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.totalRegistrations ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Gesamt Teilnehmer</p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Kommende Events
          </h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.upcomingEvents ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Geplante Events</p>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Abgeschlossen
          </h3>
          <p className="text-2xl font-bold text-gray-600 mt-2">
            {statsLoading ? (
              <span className="animate-pulse bg-gray-200 rounded w-8 h-8 inline-block"></span>
            ) : (
              stats?.completedEvents ?? 0
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">Beendete Events</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Verwandte Aktionen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleNewEvent}
            className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Neues Event erstellen</h4>
            <p className="text-sm text-gray-600 mt-1">
              Neues Event mit Datum und Details anlegen
            </p>
          </button>

          <button
            onClick={() => router.push("/intern/enrollments")}
            className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Anmeldungen verwalten</h4>
            <p className="text-sm text-gray-600 mt-1">
              Event-Anmeldungen und Teilnehmer verwalten
            </p>
          </button>

          <button
            onClick={() => router.push("/intern/participants")}
            className="text-left p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
          >
            <h4 className="font-medium text-gray-900">Teilnehmer verwalten</h4>
            <p className="text-sm text-gray-600 mt-1">
              Teilnehmerdaten und Kontakte verwalten
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}
