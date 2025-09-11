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
  is_online: number;
  is_in_person: number;
  online_url: string | null;
  online_platform: string | null;
  online_instructions: string | null;
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
  const [isOnline, setIsOnline] = useState(event.is_online === 1);
  const [isInPerson, setIsInPerson] = useState(event.is_in_person === 1);

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
    
    // Validate date is in the future
    const startDate = formData.get("start_date") as string;
    if (startDate) {
      const selectedDate = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setError("Das Startdatum muss in der Zukunft liegen");
        setIsSubmitting(false);
        return;
      }
    }

    // Client-side validation
    if (!isOnline && !isInPerson) {
      setError(
        "Event muss mindestens eine Veranstaltungsart unterstützen (Online oder Präsenz)"
      );
      setIsSubmitting(false);
      return;
    }

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
      is_online: isOnline ? 1 : 0,
      is_in_person: isInPerson ? 1 : 0,
      online_url: isOnline ? formData.get("online_url") || null : null,
      online_platform: isOnline
        ? formData.get("online_platform") || null
        : null,
      online_instructions: isOnline
        ? formData.get("online_instructions") || null
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

      const result = await response.json();

      // Redirect to the event page using the new slug from the response
      if (result.slug) {
        router.push(`/events/${result.slug}`);
      } else if (event.slug) {
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
            <label
              htmlFor="is_in_person"
              className="ml-2 text-sm text-gray-700"
            >
              Präsenz-Event
            </label>
          </div>
        </div>
      </div>

      {/* Online Event Fields */}
      {isOnline && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">
            Online-Event Details
          </h3>

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
              defaultValue={event.online_url || ""}
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
              defaultValue={event.online_platform || ""}
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
              defaultValue={event.online_instructions || ""}
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
            initialValue={event.city_slug || ""}
            onSelect={(city) => {
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
