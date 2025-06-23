import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import EditEventForm from "./_components/EditEventForm";
import Link from "next/link";

async function getTrainerIdByEmail(email: string) {
  const stmt = db.prepare(`
    SELECT trainer_id
    FROM Trainers
    WHERE email = ?
  `);
  const result = stmt.get(email) as { trainer_id: number } | undefined;
  return result?.trainer_id;
}

async function getEventById(eventId: number, trainerId: number) {
  const stmt = db.prepare(`
    SELECT
      e.event_id,
      e.event_name,
      e.description,
      e.start_date,
      e.end_date,
      e.start_time,
      e.end_time,
      e.city_slug,
      e.slug,
      e.city_id,
      e.active,
      e.max_participants,
      e.price,
      t.first_name,
      t.last_name
    FROM Events e
    JOIN Trainers t ON e.trainer_id = t.trainer_id
    WHERE e.event_id = ? AND e.trainer_id = ?
  `);

  return stmt.get(eventId, trainerId) as any;
}

// Check if user has teacher role
function isTeacher(user: any) {
  return user?.role === "teacher";
}

export default async function EditEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check if user has teacher role
  const userIsTeacher = isTeacher(user);
  if (!userIsTeacher) {
    redirect("/intern");
  }

  // Get trainer ID for the logged-in user
  const trainerId = user.email
    ? await getTrainerIdByEmail(user.email)
    : undefined;

  if (!trainerId) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-light mb-8 text-gray-900">
          Event bearbeiten
        </h1>

        <div className="bg-white rounded-lg p-6">
          <p className="text-amber-600 mb-4">
            Sie haben die Rolle "Lehrer", aber es wurde kein Trainer-Profil für
            Sie gefunden.
          </p>
          <Link
            href="/profil"
            className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Zurück zum Profil
          </Link>
        </div>
      </main>
    );
  }

  const eventId = parseInt(params.eventId);
  if (isNaN(eventId)) {
    notFound();
  }

  const event = await getEventById(eventId, trainerId);
  if (!event) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-4 text-gray-900">
          Event bearbeiten
        </h1>
        <p className="text-gray-600">
          Bearbeiten Sie die Details Ihres Events.
        </p>
      </div>

      <div className="bg-white rounded-lg p-6">
        <EditEventForm event={event} />
      </div>
    </main>
  );
}

export const metadata = {
  title: "Event bearbeiten",
  description: "Event Details bearbeiten",
};
