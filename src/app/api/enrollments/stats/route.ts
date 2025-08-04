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

    // Get active enrollments count
    const activeEnrollmentsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM course_enrollments ce
      JOIN Courses c ON ce.course_id = c.course_id
      WHERE c.trainer_id = ? AND ce.status = 'active'
    `);
    const activeEnrollments = activeEnrollmentsStmt.get(trainerId) as {
      count: number;
    };

    // Get waitlist count
    const waitlistStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM course_enrollments ce
      JOIN Courses c ON ce.course_id = c.course_id
      WHERE c.trainer_id = ? AND ce.status = 'waitlist'
    `);
    const waitlistCount = waitlistStmt.get(trainerId) as { count: number };

    // Get outstanding payments count (pending or partial payments)
    const outstandingPaymentsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM course_enrollments ce
      JOIN Courses c ON ce.course_id = c.course_id
      WHERE c.trainer_id = ? 
        AND ce.status = 'active' 
        AND ce.payment_status IN ('pending', 'partial')
    `);
    const outstandingPayments = outstandingPaymentsStmt.get(trainerId) as {
      count: number;
    };

    // Get cancellations this month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const cancellationsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM course_enrollments ce
      JOIN Courses c ON ce.course_id = c.course_id
      WHERE c.trainer_id = ? 
        AND ce.status = 'cancelled'
        AND ce.enrollment_date LIKE ?
    `);
    const cancellationsThisMonth = cancellationsStmt.get(
      trainerId,
      `${currentMonth}%`
    ) as { count: number };

    return NextResponse.json({
      activeEnrollments: activeEnrollments.count,
      waitlistCount: waitlistCount.count,
      outstandingPayments: outstandingPayments.count,
      cancellationsThisMonth: cancellationsThisMonth.count,
    });
  } catch (error) {
    console.error("Error fetching enrollment stats:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Statistiken" },
      { status: 500 }
    );
  }
}
