import { db } from "@/config";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import dynamic from "next/dynamic";

// Dynamically import the GuestPaymentForm to avoid SSR issues with Stripe
const GuestPaymentForm = dynamic(
  () => import("@/components/GuestPaymentForm"),
  { ssr: false }
);

type EventPageProps = {
  params: {
    eventSlug: string;
  };
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
  trainer: {
    first_name: string;
    last_name: string;
    bio: string | null;
    link: string | null;
    slug: string | null;
  };
};

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

  return {
    ...result,
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
  const showPaymentForm = event.price && event.price > 0 && !eventInPast && !userOwnsThisEvent;

  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex flex-col md:flex-row bg-white shadow-md rounded-lg overflow-hidden">
        <div className="md:w-1/2 flex flex-col items-center justify-center bg-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            {event.event_name}
          </h1>
          {eventInPast && (
            <div className="mt-4 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
              Vergangenes Event
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
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Event buchen</h3>
              <GuestPaymentForm
                eventId={event.event_id}
                eventName={event.event_name}
                price={event.price!}
                onSuccess={() => {
                  // Redirect to success page
                  window.location.href = '/events/payment/success';
                }}
              />
            </div>
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
