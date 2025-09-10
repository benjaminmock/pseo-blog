"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CityCombobox from "@/components/CityCombobox";
import MultiImageUpload from "@/components/MultiImageUpload";

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  isUploading?: boolean;
  isMain?: boolean;
  sortOrder?: number;
}

type Event = {
  event_id: number;
  event_name: string;
  description: string | null;
  start_date: string;
  start_time: string | null;
  city_slug: string | null;
  slug: string | null;
  city_id: number | null;
  active: number;
  max_participants: number | null;
  price: number | null;
  trainer_id: number;
};

type Props = {
  event: Event;
};

export default function EditEventForm({ event }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImages, setCurrentImages] = useState<UploadedImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  // Fetch existing images when component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/events/${event.event_id}/images`);
        if (response.ok) {
          const data = await response.json();
          const images: UploadedImage[] = data.images.map((img: any) => ({
            id: img.file.id,
            url: img.file.url,
            isMain: img.isMain,
            sortOrder: img.sortOrder,
          }));
          setCurrentImages(images);
        }
      } catch (error) {
        console.error("Failed to fetch images:", error);
      } finally {
        setImagesLoading(false);
      }
    };

    fetchImages();
  }, [event.event_id]);

  const handleImageUploadComplete = (images: UploadedImage[]) => {
    setCurrentImages(images);
  };

  const handleImageUploadError = (error: string) => {
    setError(`Bild-Upload Fehler: ${error}`);
  };

  async function handleSubmit(event_form: React.FormEvent<HTMLFormElement>) {
    event_form.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event_form.currentTarget);
    const data = {
      event_id: event.event_id,
      event_name: formData.get("event_name"),
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
      const response = await fetch("/api/events/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ein Fehler ist aufgetreten");
      }

      // Redirect to the event page using slug
      if (event.slug) {
        router.push(`/events/${event.slug}`);
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
          defaultValue={event.event_name}
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
          defaultValue={event.description || ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            defaultValue={event.start_date}
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
            defaultValue={event.start_time || ""}
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
          initialValue={event.city_slug || ""}
          onSelect={(city) => {
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
            defaultValue={event.max_participants || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            defaultValue={event.price || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Event Images Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Event-Bilder
        </label>
        {imagesLoading ? (
          <div className="text-sm text-gray-500">Lade Bilder...</div>
        ) : (
          <MultiImageUpload
            eventId={event.event_id}
            currentImages={currentImages}
            onUploadComplete={handleImageUploadComplete}
            onUploadError={handleImageUploadError}
            maxImages={5}
          />
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white rounded-lg hover:bg-gray-900"
        >
          {isSubmitting ? "Wird gespeichert..." : "Änderungen speichern"}
        </button>

        <button
          type="button"
          onClick={() => {
            if (event.slug) {
              router.push(`/events/${event.slug}`);
            } else {
              router.push("/events");
            }
          }}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
