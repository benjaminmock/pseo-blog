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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
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

      await response.json();
      router.push("/intern");
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

      <div>
        <label
          htmlFor="city_combobox"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Stadt
        </label>
        <CityCombobox
          onSelect={(city) => {
            // This is handled by the hidden input in the CityCombobox component
            console.log("Selected city:", city);
          }}
        />
      </div>

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
