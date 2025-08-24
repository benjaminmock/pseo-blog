"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CityCombobox from "@/components/CityCombobox";

type Props = {
  trainerId: number | undefined;
};

export default function CreateEventForm({ trainerId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isInPerson, setIsInPerson] = useState(true);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Client-side validation
    if (!isOnline && !isInPerson) {
      setError("Event muss mindestens eine Veranstaltungsart unterstützen (Online oder Präsenz)");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    
    // Validate online URL if online is selected
    const onlineUrl = formData.get("online_url") as string;
    if (isOnline && (!onlineUrl || onlineUrl.trim() === "")) {
      setError("Online-URL ist für Online-Events erforderlich");
      setIsSubmitting(false);
      return;
    }

    // Validate location if in-person is selected
    const citySlug = formData.get("city_slug") as string;
    const cityId = formData.get("city_id") as string;
    if (isInPerson && (!citySlug || !cityId)) {
      setError("Standort ist für Präsenz-Events erforderlich");
      setIsSubmitting(false);
      return;
    }

    const data = {
      event_name: formData.get("event_name"),
      trainer_id: trainerId,
      description: formData.get("description"),
      start_date: formData.get("start_date"),
      start_time: formData.get("start_time") || null,
      city_slug: formData.get("city_slug") || null,
      city_id: formData.get("city_id") || null,
      max_participants: formData.get("max_participants")
        ? parseInt(formData.get("max_participants") as string)
        : null,
      price: formData.get("price")
        ? parseFloat(formData.get("price") as string)
        : null,
      is_online: isOnline ? 1 : 0,
      is_in_person: isInPerson ? 1 : 0,
      online_url: isOnline ? (formData.get("online_url") || null) : null,
      online_platform: isOnline ? (formData.get("online_platform") || null) : null,
      online_instructions: isOnline ? (formData.get("online_instructions") || null) : null,
    };

    try {
      const response = await fetch("/api/event/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ein Fehler ist aufgetreten");
      }

      const result = await response.json();
      // Redirect to the new event page using the slug if available
      if (result.slug) {
        router.push(`/events/${result.slug}`);
      } else {
        router.push("/events");
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-red-700 bg-red-50 rounded-md">{error}</div>
      )}

      <div>
        <label
          htmlFor="event_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Event-Name *
        </label>
        <input
          type="text"
          id="event_name"
          name="event_name"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="z.B. Yoga Workshop: Achtsamkeit & Entspannung"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Beschreibung
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Beschreiben Sie Ihr Event..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="start_date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Datum *
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="start_time"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Uhrzeit
          </label>
          <input
            type="time"
            id="start_time"
            name="start_time"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Delivery Mode Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Veranstaltungsart *
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_online"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="is_online" className="ml-2 text-sm text-gray-700">
              Online-Event
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_in_person"
              checked={isInPerson}
              onChange={(e) => setIsInPerson(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="is_in_person" className="ml-2 text-sm text-gray-700">
              Präsenz-Event
            </label>
          </div>
        </div>
      </div>

      {/* Online Event Fields */}
      {isOnline && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Online-Event Details</h3>
          
          <div>
            <label
              htmlFor="online_url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Online-URL *
            </label>
            <input
              type="url"
              id="online_url"
              name="online_url"
              required={isOnline}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="z.B. https://zoom.us/j/123456789"
            />
          </div>

          <div>
            <label
              htmlFor="online_platform"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Plattform
            </label>
            <input
              type="text"
              id="online_platform"
              name="online_platform"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="z.B. Zoom, Teams, Google Meet"
            />
          </div>

          <div>
            <label
              htmlFor="online_instructions"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Teilnahme-Hinweise
            </label>
            <textarea
              id="online_instructions"
              name="online_instructions"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Zusätzliche Hinweise für die Online-Teilnahme..."
            />
          </div>
        </div>
      )}

      {/* Location Selection for In-Person Events */}
      {isInPerson && (
        <div>
          <label
            htmlFor="city_combobox"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Stadt *
          </label>
          <CityCombobox
            onSelect={(city) => {
              // This is handled by the hidden input in the CityCombobox component
              console.log("Selected city:", city);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="max_participants"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Max. Teilnehmer
          </label>
          <input
            type="number"
            id="max_participants"
            name="max_participants"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="z.B. 20"
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Preis (€)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="z.B. 89.00"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white rounded-lg hover:bg-gray-900"
        >
          {isSubmitting ? "Wird erstellt..." : "Event erstellen"}
        </button>
      </div>
    </form>
  );
}
