"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CityCombobox from "@/components/CityCombobox";

type Props = {
  trainerId: number | undefined;
};

export default function CreateCourseForm({ trainerId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      course_name: formData.get("course_name"),
      trainer_id: trainerId,
      description: formData.get("description"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date") || null,
      city_slug: formData.get("city_slug") || null,
      city_id: formData.get("city_id") || null,
      capacity: formData.get("capacity")
        ? parseInt(formData.get("capacity") as string)
        : null,
      language: formData.get("language") || null,
      price: formData.get("price")
        ? parseFloat(formData.get("price") as string)
        : null,
      duration: formData.get("duration")
        ? parseInt(formData.get("duration") as string)
        : null,
      location: formData.get("location") || null,
      style: formData.get("style") || null,
      level: formData.get("level") || null,
    };

    try {
      const response = await fetch("/api/kurs/create", {
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
      router.push(`/kurse/${result.slug}`);
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
          htmlFor="course_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Kursname *
        </label>
        <input
          type="text"
          id="course_name"
          name="course_name"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        />
      </div>

      <div>
        <label
          htmlFor="start_date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Startdatum *
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
          htmlFor="end_date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Enddatum
        </label>
        <input
          type="date"
          id="end_date"
          name="end_date"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
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

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Genauer Ort/Adresse
        </label>
        <input
          type="text"
          id="location"
          name="location"
          placeholder="z.B. Yogastudio Mitte, Hauptstraße 123"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Kapazität (max. Teilnehmer)
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            min="1"
            placeholder="z.B. 15"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Dauer (Minuten)
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            min="15"
            step="15"
            placeholder="z.B. 90"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="z.B. 25.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Sprache
          </label>
          <select
            id="language"
            name="language"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Sprache wählen</option>
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="style"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Yoga-Stil
          </label>
          <input
            type="text"
            id="style"
            name="style"
            placeholder="z.B. Hatha, Vinyasa, Yin"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="level"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Level
          </label>
          <select
            id="level"
            name="level"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Level wählen</option>
            <option value="beginner">Anfänger</option>
            <option value="intermediate">Fortgeschritten</option>
            <option value="advanced">Experte</option>
          </select>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white rounded-lg hover:bg-gray-900"
        >
          {isSubmitting ? "Wird erstellt..." : "Kurs erstellen"}
        </button>
      </div>
    </form>
  );
}
