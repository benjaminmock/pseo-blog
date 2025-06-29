import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { event_id } = data;

    // Validate required fields
    if (!event_id) {
      return NextResponse.json(
        { error: "Event-ID ist erforderlich" },
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
      SELECT trainer_id, event_name
      FROM Events
      WHERE event_id = ?
    `);
    const eventResult = eventStmt.get(event_id) as
      | { trainer_id: number; event_name: string }
      | undefined;

    if (!eventResult || eventResult.trainer_id !== trainerResult.trainer_id) {
      return NextResponse.json(
        { error: "Sie sind nicht berechtigt, dieses Event zu löschen" },
        { status: 403 }
      );
    }

    // Delete the event
    const deleteStmt = db.prepare(`
      DELETE FROM Events
      WHERE event_id = ? AND trainer_id = ?
    `);

    const result = deleteStmt.run(event_id, trainerResult.trainer_id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Event konnte nicht gelöscht werden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Event "${eventResult.event_name}" wurde erfolgreich gelöscht`,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Events" },
      { status: 500 }
    );
  }
}
