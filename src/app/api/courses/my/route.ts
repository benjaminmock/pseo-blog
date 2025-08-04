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
      return NextResponse.json({ courses: [] });
    }

    // Get all courses for this trainer with enrollment counts
    const coursesStmt = db.prepare(`
      SELECT
        c.course_id as courseId,
        c.course_name as courseName,
        c.trainer_id as trainerId,
        c.description,
        c.start_date as startDate,
        c.end_date as endDate,
        c.city_slug,
        c.slug,
        c.active,
        c.price,
        c.max_capacity as maxCapacity,
        c.current_enrollments as currentEnrollments,
        t.first_name,
        t.last_name,
        (t.first_name || ' ' || t.last_name) as trainerName
      FROM Courses c
      JOIN Trainers t ON c.trainer_id = t.trainer_id
      WHERE c.trainer_id = ? AND c.active = 1
      ORDER BY c.start_date DESC
    `);

    const courses = coursesStmt.all(trainerResult.trainer_id);

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Kurse" },
      { status: 500 }
    );
  }
}
