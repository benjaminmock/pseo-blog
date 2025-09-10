import { db } from "@/config";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import EventPaymentSection from "./_components/EventPaymentSection";
import { prisma } from "@/lib/prisma";

type EventPageProps = {
  params: {
    eventSlug: string;
  };
};

type EventImage = {
  id: string;
  url: string;
  isMain: boolean;
  sortOrder: number;
};

type Event = {
  event_id: number;
  event_name: string;
  trainer_id: number;
  description: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  city_slug: string | null;
  city_name: string | null;
  slug: string | null;
  max_participants: number | null;
  price: number | null;
  images: EventImage[];
  trainer: {
    first_name: string;
    last_name: string;
    bio: string | null;
    link: string | null;
    slug: string | null;
  };
};

async function getEventImages(eventId: number): Promise<EventImage[]> {
  try {
    const eventImages = await prisma.eventImage.findMany({
      where: { eventId },
      include: { file: true },
      orderBy: { sortOrder: "asc" },
    });

    return eventImages.map((img: any) => ({
      id: img.file.id,
      url: img.file.url,
      isMain: img.isMain,
      sortOrder: img.sortOrder,
    }));
  } catch (error) {
    console.error("Failed to fetch event images:", error);
    return [];
  }
}

async function getEventBySlug(slug: string): Promise<Event | undefined> {
  const stmt = db.prepare(`
    SELECT
      e.*,
      t.first_name,
      t.last_name,
      t.bio,
      t.link,
      t.slug as trainer_slug,
      city.city as city_name
    FROM Events e
    LEFT JOIN Trainers t ON e.trainer_id = t.trainer_id
    LEFT JOIN cities city ON e.city_slug = city.slug
    WHERE e.slug = ? AND e.active = 1
  `);

  const result = stmt.get(slug) as
    | (Event & {
        first_name: string;
        last_name: string;
        bio: string | null;
        link: string | null;
        trainer_slug: string | null;
        city_name: string | null;
      })
    | undefined;

  if (!result) return undefined;

  // Fetch images for this event
  const images = await getEventImages(result.event_id);
  console.log(images);
  return {
    ...result,
    images,
    trainer: {
      first_name: result.first_name,
      last_name: result.last_name,
      bio: result.bio,
      link: result.link,
      slug: result.trainer_slug,
    },
  };
}

async function getTrainerIdByEmail(email: string) {
  const stmt = db.prepare(`
    SELECT trainer_id
    FROM Trainers
    WHERE email = ?
  `);
  const result = stmt.get(email) as { trainer_id: number } | undefined;
  return result?.trainer_id;
}

// Check if user has teacher role
function isTeacher(user: { role?: string } | null) {
  return user?.role === "teacher";
}

// Check if the logged-in user owns this event
async function isUserEventOwner(
  event: Event,
  user: { email?: string | null; role?: string } | null
) {
  if (!user || !isTeacher(user) || !user.email) {
    return false;
  }

  const trainerId = await getTrainerIdByEmail(user.email);
  return trainerId === event.trainer_id;
}

export async function generateMetadata({ params }: EventPageProps) {
  const { eventSlug } = params;
  const event = await getEventBySlug(eventSlug);

  if (!event) {
    return {
      title: "Event nicht gefunden",
      description: "Das angeforderte Event wurde nicht gefunden",
    };
  }

  return {
    title: event.event_name,
    description:
      event.description ||
      `Yoga Event mit ${event.trainer.first_name} ${event.trainer.last_name}`,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return null;
  return timeStr.slice(0, 5); // Remove seconds if present
}

function formatPrice(price: number | null) {
  if (!price) return null;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function isEventInPast(startDate: string) {
  const eventDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
  return eventDate < today;
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventSlug } = params;
  const event = await getEventBySlug(eventSlug);

  if (!event) {
    notFound();
  }

  // Get current user and check if they own this event
  const user = await getCurrentUser();
  const userOwnsThisEvent = await isUserEventOwner(event, user);
  const eventInPast = isEventInPast(event.start_date);

  // Show payment form if event has a price, is not in the past, and user doesn't own it
  const showPaymentForm =
    event.price && event.price > 0 && !eventInPast && !userOwnsThisEvent;

  // Get main image and other images
  const mainImage = event.images.find((img) => img.isMain) || event.images[0];
  const otherImages = event.images.filter((img) => !img.isMain);

  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex flex-col md:flex-row bg-white shadow-md rounded-lg overflow-hidden">
        <div className="md:w-1/2 bg-gray-100">
          {mainImage ? (
            <div className="relative h-full min-h-[400px]">
              <Image
                src={mainImage.url}
                alt={event.event_name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold text-white text-center mb-4">
                  {event.event_name}
                </h1>
                {eventInPast && (
                  <div className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    Vergangenes Event
                  </div>
                )}
              </div>

              {/* Image Gallery Thumbnails */}
              {otherImages.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {otherImages.slice(0, 4).map((img, index) => (
                      <div
                        key={img.id}
                        className="relative w-16 h-16 flex-shrink-0"
                      >
                        <Image
                          src={img.url}
                          alt={`Event image ${index + 2}`}
                          fill
                          className="object-cover rounded border-2 border-white"
                        />
                      </div>
                    ))}
                    {otherImages.length > 4 && (
                      <div className="w-16 h-16 flex-shrink-0 bg-black bg-opacity-60 rounded border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          +{otherImages.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-gray-100 p-8 h-full min-h-[400px]">
              <h1 className="text-2xl font-bold text-gray-900 text-center">
                {event.event_name}
              </h1>
              {eventInPast && (
                <div className="mt-4 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  Vergangenes Event
                </div>
              )}
            </div>
          )}
        </div>
        <div className="md:w-1/2 p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-500 text-sm">
                Trainer*in / Lehrer*in
              </h2>
              {event.trainer.slug ? (
                <Link
                  href={`/trainer/${event.trainer.slug}`}
                  className="text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {event.trainer.first_name} {event.trainer.last_name}
                </Link>
              ) : (
                <span className="text-gray-900">
                  {event.trainer.first_name} {event.trainer.last_name}
                </span>
              )}
              {event.trainer.bio && (
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                  {event.trainer.bio}
                </p>
              )}
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-500 text-sm">
                Datum
              </h2>
              <p className="text-gray-900">
                {formatDate(event.start_date)}
                {event.end_date && ` - ${formatDate(event.end_date)}`}
              </p>
            </div>
            {event.start_time && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Uhrzeit
                </h2>
                <p className="text-gray-900">
                  {formatTime(event.start_time)}
                  {event.end_time && ` - ${formatTime(event.end_time)}`}
                </p>
              </div>
            )}
            {(event.city_name || event.city_slug) && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Ort
                </h2>
                <div className="text-gray-900">
                  {event.city_name && (
                    <p className="capitalize">{event.city_name}</p>
                  )}
                  {!event.city_name && event.city_slug && (
                    <p className="capitalize">
                      {event.city_slug.replace("-", " ")}
                    </p>
                  )}
                </div>
              </div>
            )}
            {event.price && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Preis
                </h2>
                <p className="text-gray-900">{formatPrice(event.price)}</p>
              </div>
            )}
            {event.max_participants && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Max. Teilnehmer
                </h2>
                <p className="text-gray-900">
                  {event.max_participants} Teilnehmer
                </p>
              </div>
            )}
            {event.description && (
              <div>
                <h2 className="text-lg font-medium text-gray-500 text-sm">
                  Beschreibung
                </h2>
                <p className="text-gray-900 whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}
          </div>

          {/* Payment Form Section */}
          {showPaymentForm && (
            <EventPaymentSection
              eventId={event.event_id}
              eventName={event.event_name}
              price={event.price!}
            />
          )}

          <div className="mt-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <Link
              href="/events"
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              ← Zurück zur Event-Übersicht
            </Link>
            {userOwnsThisEvent && (
              <Link
                href={`/events/${event.slug}/bearbeiten`}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Event bearbeiten
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
