"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Event {
  event_id: number;
  event_name: string;
  description: string;
  start_date: string;
  start_time: string | null;
  city_slug: string | null;
  slug: string | null;
  max_participants: number | null;
  price: number | null;
  first_name: string;
  last_name: string;
  trainer_bio: string | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events);
        } else {
          setError("Fehler beim Laden der Events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Fehler beim Laden der Events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    return timeString.slice(0, 5); // Remove seconds if present
  };

  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Events werden geladen...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-light mb-4 text-gray-900">
          Yoga Events & Workshops
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Entdecken Sie besondere Yoga-Events, Workshops und Retreats. Vertiefen
          Sie Ihre Praxis mit erfahrenen Lehrern in inspirierenden Umgebungen.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Keine Events verfügbar
          </h2>
          <p className="text-gray-600">
            Derzeit sind keine Events geplant. Schauen Sie bald wieder vorbei!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.event_id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.event_name}
                  </h2>
                  {event.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{formatDate(event.start_date)}</span>
                  </div>

                  {event.start_time && (
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{formatTime(event.start_time)}</span>
                    </div>
                  )}

                  {event.city_slug && (
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{event.city_slug}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>
                      {event.first_name} {event.last_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {event.price && (
                    <div className="text-lg font-semibold text-indigo-600">
                      {event.price.toFixed(2)} €
                    </div>
                  )}

                  {event.max_participants && (
                    <div className="text-sm text-gray-500">
                      Max. {event.max_participants} Teilnehmer
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                    Mehr erfahren
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
