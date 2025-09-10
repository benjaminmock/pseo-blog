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
      return NextResponse.json({ enrollments: [] });
    }

    // Get all course enrollments for this participant
    const enrollmentsStmt = db.prepare(`
      SELECT
        ce.enrollment_id,
        ce.course_id,
        ce.enrollment_date,
        ce.status,
        ce.payment_status,
        ce.total_amount,
        ce.paid_amount,
        c.course_name,
        c.description,
        c.start_date,
        c.end_date,
        c.city_slug,
        c.slug,
        c.price,
        t.first_name,
        t.last_name,
        (t.first_name || ' ' || t.last_name) as trainer_name
      FROM course_enrollments ce
      JOIN Courses c ON ce.course_id = c.course_id
      JOIN Trainers t ON c.trainer_id = t.trainer_id
      WHERE ce.participant_id = ? AND ce.status = 'active'
      ORDER BY c.start_date DESC
    `);

    const enrollments = enrollmentsStmt.all(participantResult.participant_id);

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error("Error fetching student enrollments:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Kursanmeldungen" },
      { status: 500 }
    );
  }
}