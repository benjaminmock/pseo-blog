import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
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
      return NextResponse.json(
        { error: "Trainer nicht gefunden" },
        { status: 404 }
      );
    }

    const trainerId = trainerResult.trainer_id;
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Get active courses (courses with active = 1 status)
    const activeCoursesStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM Courses
      WHERE trainer_id = ?
        AND active = 1
    `);
    const activeCourses = activeCoursesStmt.get(trainerId) as { count: number };

    // Get total enrollments for all trainer's active courses
    const totalEnrollmentsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM course_enrollments ce
      JOIN Courses c ON ce.course_id = c.course_id
      WHERE c.trainer_id = ?
        AND c.active = 1
        AND ce.status = 'active'
    `);
    const totalEnrollments = totalEnrollmentsStmt.get(trainerId) as {
      count: number;
    };

    // Get upcoming courses (active courses that haven't started yet)
    const upcomingCoursesStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM Courses
      WHERE trainer_id = ?
        AND active = 1
        AND start_date > ?
    `);
    const upcomingCourses = upcomingCoursesStmt.get(trainerId, currentDate) as {
      count: number;
    };

    // Get completed courses (active courses that have ended)
    const completedCoursesStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM Courses
      WHERE trainer_id = ?
        AND active = 1
        AND end_date < ?
    `);
    const completedCourses = completedCoursesStmt.get(
      trainerId,
      currentDate
    ) as { count: number };

    const stats = {
      activeCourses: activeCourses.count,
      totalEnrollments: totalEnrollments.count,
      upcomingCourses: upcomingCourses.count,
      completedCourses: completedCourses.count,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching course stats:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Kursstatistiken" },
      { status: 500 }
    );
  }
}
