import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const {
      event_id,
      event_name,
      description,
      start_date,
      start_time,
      city_slug,
      city_id,
      max_participants,
      price,
    } = data;

    // Validate required fields
    if (!event_id || !event_name || !start_date) {
      return NextResponse.json(
        { error: "Event-ID, Event-Name und Startdatum sind erforderlich" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Sie sind nicht als Trainer registriert" },
        { status: 403 }
      );
    }

    // Verify that the event belongs to this trainer
    const eventStmt = db.prepare(`
      SELECT trainer_id
      FROM Events
      WHERE event_id = ?
    `);
    const eventResult = eventStmt.get(event_id) as
      | { trainer_id: number }
      | undefined;

    if (!eventResult || eventResult.trainer_id !== trainerResult.trainer_id) {
      return NextResponse.json(
        { error: "Sie sind nicht berechtigt, dieses Event zu bearbeiten" },
        { status: 403 }
      );
    }

    // Generate slug from event name
    const slug = event_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Update event in database
    const updateStmt = db.prepare(`
      UPDATE Events
      SET
        event_name = ?,
        description = ?,
        start_date = ?,
        start_time = ?,
        city_slug = ?,
        slug = ?,
        city_id = ?,
        max_participants = ?,
        price = ?
      WHERE event_id = ?
    `);

    updateStmt.run(
      event_name,
      description,
      start_date,
      start_time,
      city_slug,
      slug,
      city_id,
      max_participants,
      price,
      event_id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Events" },
      { status: 500 }
    );
  }
}
