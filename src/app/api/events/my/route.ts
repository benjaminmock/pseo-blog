import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    // Get trainer ID for the logged-in user
    const trainerStmt = db.prepare(`
      SELECT trainer_id
      FROM Trainers
      WHERE email = ?
    `);
    const trainerResult = trainerStmt.get(user.email) as
      | { trainer_id: number }
      | undefined;

    if (!trainerResult) {
      // User is not a trainer, return empty array
      return NextResponse.json({ events: [] });
    }

    // Get all events for this trainer
    const eventsStmt = db.prepare(`
      SELECT
        e.event_id,
        e.event_name,
        e.description,
        e.start_date,
        e.start_time,
        e.city_slug,
        e.slug,
        e.active,
        e.max_participants,
        e.price,
        t.first_name,
        t.last_name
      FROM Events e
      JOIN Trainers t ON e.trainer_id = t.trainer_id
      WHERE e.trainer_id = ?
      ORDER BY e.start_date DESC
    `);

    const events = eventsStmt.all(trainerResult.trainer_id);

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Events" },
      { status: 500 }
    );
  }
}
