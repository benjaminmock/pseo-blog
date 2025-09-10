import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    // Get participant ID for the logged-in user
    const participantStmt = db.prepare(`
      SELECT participant_id
      FROM participants
      WHERE email = ?
    `);
    const participantResult = participantStmt.get(user.email) as
      | { participant_id: number }
      | undefined;

    if (!participantResult) {
      // User is not a participant, return empty array
      return NextResponse.json({ registrations: [] });
    }

    // Get all event registrations for this participant
    const registrationsStmt = db.prepare(`
      SELECT
        er.registration_id,
        er.event_id,
        er.registration_date,
        er.status,
        er.payment_status,
        er.total_amount,
        er.paid_amount,
        e.event_name,
        e.description,
        e.start_date,
        e.start_time,
        e.city_slug,
        e.slug,
        e.price,
        e.max_participants,
        t.first_name,
        t.last_name,
        (t.first_name || ' ' || t.last_name) as trainer_name
      FROM event_registrations er
      JOIN Events e ON er.event_id = e.event_id
      JOIN Trainers t ON e.trainer_id = t.trainer_id
      WHERE er.participant_id = ? AND er.status = 'registered'
      ORDER BY e.start_date DESC
    `);

    const registrations = registrationsStmt.all(participantResult.participant_id);

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error("Error fetching student registrations:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Event-Anmeldungen" },
      { status: 500 }
    );
  }
}