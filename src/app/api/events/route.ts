import { db } from "@/config";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all active events with trainer information
    const eventsStmt = db.prepare(`
      SELECT
        e.event_id,
        e.event_name,
        e.description,
        e.start_date,
        e.start_time,
        e.city_slug,
        e.slug,
        e.max_participants,
        e.price,
        t.first_name,
        t.last_name,
        t.bio as trainer_bio
      FROM Events e
      JOIN Trainers t ON e.trainer_id = t.trainer_id
      WHERE e.active = 1
      ORDER BY e.start_date ASC
    `);

    const events = eventsStmt.all();

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Events" },
      { status: 500 }
    );
  }
}
