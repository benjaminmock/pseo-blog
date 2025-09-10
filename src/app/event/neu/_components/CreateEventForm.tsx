"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

type Props = {
  trainerId: number | undefined;
};

export default function CreateEventForm({ trainerId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isInPerson, setIsInPerson] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);
  const [createdEventSlug, setCreatedEventSlug] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const uploadSelectedImages = async (eventId: number) => {
    const imagesToUpload = uploadedImages.filter((img) => img.file);
    console.log(
      `Starting upload for ${imagesToUpload.length} images to event ${eventId}`
    );

    if (imagesToUpload.length === 0) return;

    const uploadPromises = imagesToUpload.map(async (image, index) => {
      if (!image.file) return null;

      console.log(
        `Uploading image ${index + 1}/${imagesToUpload.length}: ${
          image.file.name
        }`
      );

      // Get image dimensions
      const validation = await validateFile(image.file);
      const dimensions = validation.dimensions;

      // Step 1: Get presigned URL
      console.log(`Step 1: Getting presigned URL for ${image.file.name}`);
      const presignResponse = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: image.file.name,
          contentType: image.file.type,
          fileSize: image.file.size,
          scope: "events",
          entityId: eventId.toString(),
        }),
      });

      if (!presignResponse.ok) {
        const error = await presignResponse.json();
        console.error(`Presign failed for ${image.file.name}:`, error);
        throw new Error(error.error || "Failed to get upload URL");
      }

      const { presignedPost, objectKey } = await presignResponse.json();
      console.log(
        `Step 1 complete: Got presigned URL and objectKey: ${objectKey}`
      );

      // Step 2: Upload to S3
      console.log(`Step 2: Uploading ${image.file.name} to S3`);
      const formData = new FormData();
      Object.entries(presignedPost.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", image.file);

      const uploadResponse = await fetch(presignedPost.url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        console.error(
          `S3 upload failed for ${image.file.name}:`,
          uploadResponse.status,
          uploadResponse.statusText
        );
        throw new Error("Upload to storage failed");
      }

      console.log(
        `Step 2 complete: Successfully uploaded ${image.file.name} to S3`
      );

      // Step 3: Complete upload
      console.log(`Step 3: Completing upload for ${image.file.name}`);
      const completeResponse = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectKey,
          mimeType: image.file.type,
          sizeBytes: image.file.size,
          width: dimensions?.width,
          height: dimensions?.height,
          scope: "events",
          entityId: eventId.toString(),
        }),
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        console.error(`Complete upload failed for ${image.file.name}:`, error);
        throw new Error(error.error || "Failed to save file metadata");
      }

      const result = await completeResponse.json();
      console.log(
        `Step 3 complete: Upload completed for ${image.file.name}`,
        result
      );
      return result;
    });

    const results = await Promise.all(uploadPromises);
    console.log(`All uploads completed successfully:`, results);

    // Update state to remove file references from uploaded images
    setUploadedImages((prev) =>
      prev.map((img) => ({
        ...img,
        file: undefined, // Remove file reference for uploaded images
      }))
    );

    // Call completion callback to trigger redirect
    handleImageUploadComplete([]);
  };

  const validateFile = (
    file: File
  ): Promise<{
    valid: boolean;
    error?: string;
    warning?: string;
    dimensions?: { width: number; height: number };
  }> => {
    return new Promise((resolve) => {
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const MIN_DIMENSIONS = { width: 256, height: 256 };

      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        resolve({
          valid: false,
          error: `Ungültiger Dateityp. Erlaubt: ${ALLOWED_TYPES.join(", ")}`,
        });
        return;
      }

      // Check file size
      if (file.size > MAX_SIZE) {
        resolve({
          valid: false,
          error: `Datei zu groß. Maximum: ${MAX_SIZE / (1024 * 1024)}MB`,
        });
        return;
      }

      // Check image dimensions
      const img = new window.Image();
      img.onload = () => {
        const dimensions = { width: img.width, height: img.height };
        let warning;

        if (
          img.width < MIN_DIMENSIONS.width ||
          img.height < MIN_DIMENSIONS.height
        ) {
          warning = `Bild ist kleiner als empfohlen (${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height}px). Qualität könnte reduziert sein.`;
        }

        resolve({
          valid: true,
          warning,
          dimensions,
        });
      };

      img.onerror = () => {
        resolve({
          valid: false,
          error: "Ungültiges Bildformat",
        });
      };

      img.src = URL.createObjectURL(file);
    });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Client-side validation
    if (!isOnline && !isInPerson) {
      setError(
        "Event muss mindestens eine Veranstaltungsart unterstützen (Online oder Präsenz)"
      );
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
      online_url: isOnline ? formData.get("online_url") || null : null,
      online_platform: isOnline
        ? formData.get("online_platform") || null
        : null,
      online_instructions: isOnline
        ? formData.get("online_instructions") || null
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

      const result = await response.json();

      // Store the created event ID and slug for image uploads and redirects
      setCreatedEventId(result.event_id);
      setCreatedEventSlug(result.slug);
      const eventSlug = result.slug;

      console.log(uploadedImages);

      // If there are no images to upload, redirect immediately
      if (
        uploadedImages.length === 0 ||
        uploadedImages.every((img) => !img.file)
      ) {
        if (eventSlug) {
          router.push(`/events/${eventSlug}`);
        } else {
          router.push("/events");
        }
        router.refresh();
      } else {
        // Automatically trigger image upload for selected files
        setIsUploadingImages(true);
        try {
          await uploadSelectedImages(result.event_id);
          // The redirect will be handled by handleImageUploadComplete after successful upload
        } catch (uploadError) {
          setError(
            `Event wurde erstellt, aber Bild-Upload fehlgeschlagen: ${
              uploadError instanceof Error
                ? uploadError.message
                : "Unbekannter Fehler"
            }`
          );
          setIsUploadingImages(false);
          setIsSubmitting(false);

          // Reset upload state to allow retry - remove file references from failed uploads
          setUploadedImages((prev) =>
            prev.map((img) => ({
              ...img,
              file: undefined,
            }))
          );
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageUploadComplete = (images: UploadedImage[]) => {
    console.log("handleImageUploadComplete called with:", images);
    setUploadedImages(images);
    setIsUploadingImages(false);
    setIsSubmitting(false);
    
    // Redirect after successful upload
    if (createdEventSlug) {
      router.push(`/events/${createdEventSlug}`);
    } else {
      router.push("/events");
    }
    router.refresh();
  };

  const handleImageSelectionChange = (images: UploadedImage[]) => {
    console.log("handleImageSelectionChange called with:", images);
    setUploadedImages(images);
  };

  const handleImageUploadError = (error: string) => {
    setError(`Bild-Upload Fehler: ${error}`);
  };

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

      {/* Event Images Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Event-Bilder
        </label>
        <div className="text-sm text-gray-500 mb-4">
          Fügen Sie Bilder zu Ihrem Event hinzu. Diese werden nach der
          Event-Erstellung hochgeladen.
        </div>
        <MultiImageUpload
          eventId={createdEventId || undefined}
          currentImages={uploadedImages}
          onUploadComplete={handleImageSelectionChange}
          onUploadError={handleImageUploadError}
          maxImages={5}
          autoUpload={true}
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isUploadingImages}
          className="w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white rounded-lg hover:bg-gray-900"
        >
          {isUploadingImages
            ? "Lade Bilder hoch..."
            : isSubmitting
            ? "Wird erstellt..."
            : "Event erstellen"}
        </button>

        {createdEventId && !isUploadingImages && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              Event wurde erfolgreich erstellt!
            </p>
          </div>
        )}

        {isUploadingImages && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Event wurde erstellt! Bilder werden hochgeladen...
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
