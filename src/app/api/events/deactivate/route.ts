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
    const { event_id, active } = data;

    // Validate required fields
    if (!event_id || typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Event-ID und Status sind erforderlich" },
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

    // Update event status
    const updateStmt = db.prepare(`
      UPDATE Events
      SET active = ?
      WHERE event_id = ?
    `);

    updateStmt.run(active ? 1 : 0, event_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating event status:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Event-Status" },
      { status: 500 }
    );
  }
}
