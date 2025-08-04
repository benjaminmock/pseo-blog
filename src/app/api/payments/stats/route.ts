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

    // Get payment statistics for courses and events owned by this trainer
    const statsStmt = db.prepare(`
      SELECT 
        COUNT(CASE WHEN pay.status = 'pending' THEN 1 END) as pendingCount,
        COUNT(CASE WHEN pay.status = 'completed' THEN 1 END) as completedCount,
        COUNT(CASE WHEN pay.status = 'failed' THEN 1 END) as failedCount,
        COALESCE(SUM(CASE WHEN pay.status = 'pending' THEN pay.amount END), 0) as totalPending,
        COALESCE(SUM(CASE WHEN pay.status = 'completed' THEN pay.amount END), 0) as totalCompleted,
        COALESCE(SUM(CASE WHEN pay.status = 'failed' THEN pay.amount END), 0) as totalFailed,
        COUNT(*) as totalPayments,
        COALESCE(SUM(pay.amount), 0) as totalAmount
      FROM payments pay
      LEFT JOIN Courses c ON pay.course_id = c.course_id
      LEFT JOIN Events e ON pay.event_id = e.event_id
      WHERE (c.trainer_id = ? OR e.trainer_id = ?)
    `);

    const stats = statsStmt.get(
      trainerResult.trainer_id,
      trainerResult.trainer_id
    ) as {
      pendingCount: number;
      completedCount: number;
      failedCount: number;
      totalPending: number;
      totalCompleted: number;
      totalFailed: number;
      totalPayments: number;
      totalAmount: number;
    };

    // Get recent payments for courses and events owned by this trainer
    const recentPaymentsStmt = db.prepare(`
      SELECT 
        pay.payment_id,
        pay.participant_id,
        pay.amount,
        pay.currency,
        pay.payment_method,
        pay.status,
        pay.paid_at,
        pay.created_at,
        p.full_name,
        p.email,
        c.course_name,
        e.event_name
      FROM payments pay
      JOIN participants p ON pay.participant_id = p.participant_id
      LEFT JOIN Courses c ON pay.course_id = c.course_id
      LEFT JOIN Events e ON pay.event_id = e.event_id
      WHERE (c.trainer_id = ? OR e.trainer_id = ?)
      ORDER BY pay.created_at DESC
      LIMIT 10
    `);

    const recentPayments = recentPaymentsStmt.all(
      trainerResult.trainer_id,
      trainerResult.trainer_id
    );

    // Get monthly payment trends for the last 6 months
    const monthlyTrendsStmt = db.prepare(`
      SELECT 
        strftime('%Y-%m', pay.created_at) as month,
        COUNT(*) as paymentCount,
        COALESCE(SUM(CASE WHEN pay.status = 'completed' THEN pay.amount END), 0) as completedAmount,
        COALESCE(SUM(CASE WHEN pay.status = 'pending' THEN pay.amount END), 0) as pendingAmount
      FROM payments pay
      LEFT JOIN Courses c ON pay.course_id = c.course_id
      LEFT JOIN Events e ON pay.event_id = e.event_id
      WHERE (c.trainer_id = ? OR e.trainer_id = ?)
        AND pay.created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', pay.created_at)
      ORDER BY month DESC
    `);

    const monthlyTrends = monthlyTrendsStmt.all(
      trainerResult.trainer_id,
      trainerResult.trainer_id
    );

    // Get outstanding enrollments (enrollments with unpaid amounts)
    const outstandingEnrollmentsStmt = db.prepare(`
      SELECT 
        ce.enrollment_id,
        ce.participant_id,
        ce.total_amount,
        ce.paid_amount,
        (ce.total_amount - ce.paid_amount) as outstanding_amount,
        p.full_name,
        p.email,
        c.course_name
      FROM course_enrollments ce
      JOIN participants p ON ce.participant_id = p.participant_id
      JOIN Courses c ON ce.course_id = c.course_id
      WHERE c.trainer_id = ?
        AND ce.total_amount > ce.paid_amount
        AND ce.status = 'active'
      ORDER BY outstanding_amount DESC
      LIMIT 10
    `);

    const outstandingEnrollments = outstandingEnrollmentsStmt.all(
      trainerResult.trainer_id
    );

    return NextResponse.json({
      stats,
      recentPayments,
      monthlyTrends,
      outstandingEnrollments,
    });
  } catch (error) {
    console.error("Error fetching payment statistics:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Zahlungsstatistiken" },
      { status: 500 }
    );
  }
}
