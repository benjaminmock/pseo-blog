import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get("participantId");
    const courseId = searchParams.get("courseId");
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("paymentMethod");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    let queryParams: (string | number)[] = [];

    if (participantId) {
      whereClause += " AND pay.participant_id = ?";
      queryParams.push(parseInt(participantId));
    }

    if (courseId) {
      whereClause += " AND pay.course_id = ?";
      queryParams.push(parseInt(courseId));
    }

    if (eventId) {
      whereClause += " AND pay.event_id = ?";
      queryParams.push(parseInt(eventId));
    }

    if (status) {
      whereClause += " AND pay.status = ?";
      queryParams.push(status);
    }

    if (paymentMethod) {
      whereClause += " AND pay.payment_method = ?";
      queryParams.push(paymentMethod);
    }

    // Get payments with participant and course/event details
    const paymentsStmt = db.prepare(`
      SELECT 
        pay.payment_id,
        pay.participant_id,
        pay.course_id,
        pay.event_id,
        pay.enrollment_id,
        pay.registration_id,
        pay.amount,
        pay.currency,
        pay.payment_method,
        pay.status,
        pay.transaction_id,
        pay.stripe_payment_intent_id,
        pay.paid_at,
        pay.refunded_at,
        pay.refund_amount,
        pay.created_at,
        pay.notes,
        pay.processed_by,
        p.full_name,
        p.email,
        c.course_name,
        e.event_name,
        t.first_name as processor_first_name,
        t.last_name as processor_last_name
      FROM payments pay
      JOIN participants p ON pay.participant_id = p.participant_id
      LEFT JOIN Courses c ON pay.course_id = c.course_id
      LEFT JOIN Events e ON pay.event_id = e.event_id
      LEFT JOIN Trainers t ON pay.processed_by = t.trainer_id
      ${whereClause}
      ORDER BY pay.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const rawPayments = paymentsStmt.all(...queryParams, limit, offset);

    // Map the database fields to the expected interface
    const payments = rawPayments.map((payment: any) => ({
      ...payment,
      participantName: payment.full_name,
      participantEmail: payment.email,
      courseName: payment.course_name,
      eventName: payment.event_name,
      createdAt: payment.created_at,
      paidAt: payment.paid_at,
      refundedAt: payment.refunded_at,
      refundAmount: payment.refund_amount,
      paymentMethod: payment.payment_method,
      transactionId: payment.transaction_id,
      paymentId: payment.payment_id,
      participantId: payment.participant_id,
      courseId: payment.course_id,
      eventId: payment.event_id,
      enrollmentId: payment.enrollment_id,
      registrationId: payment.registration_id,
    }));

    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM payments pay
      ${whereClause}
    `);

    const countResult = countStmt.get(...queryParams) as { count: number };
    const totalCount = countResult.count;

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Zahlungen" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const {
      participantId,
      courseId,
      eventId,
      enrollmentId,
      registrationId,
      amount,
      currency = "EUR",
      paymentMethod,
      status = "completed",
      transactionId,
      notes,
    } = data;

    // Validate required fields
    if (!participantId || !amount || !paymentMethod) {
      return NextResponse.json(
        {
          error: "Teilnehmer-ID, Betrag und Zahlungsmethode sind erforderlich",
        },
        { status: 400 }
      );
    }

    // Check if participant exists
    const participant = db
      .prepare(
        "SELECT participant_id FROM participants WHERE participant_id = ?"
      )
      .get(participantId);

    if (!participant) {
      return NextResponse.json(
        { error: "Teilnehmer nicht gefunden" },
        { status: 404 }
      );
    }

    // Validate enrollment or registration if provided
    if (enrollmentId) {
      const enrollment = db
        .prepare(
          "SELECT enrollment_id FROM course_enrollments WHERE enrollment_id = ? AND participant_id = ?"
        )
        .get(enrollmentId, participantId);

      if (!enrollment) {
        return NextResponse.json(
          { error: "Anmeldung nicht gefunden" },
          { status: 404 }
        );
      }
    }

    if (registrationId) {
      const registration = db
        .prepare(
          "SELECT registration_id FROM event_registrations WHERE registration_id = ? AND participant_id = ?"
        )
        .get(registrationId, participantId);

      if (!registration) {
        return NextResponse.json(
          { error: "Registrierung nicht gefunden" },
          { status: 404 }
        );
      }
    }

    // Get trainer ID for processed_by field
    const trainer = db
      .prepare("SELECT trainer_id FROM Trainers WHERE email = ?")
      .get(user.email) as { trainer_id: number } | undefined;

    const processedBy = trainer?.trainer_id || null;

    // Insert payment record
    const stmt = db.prepare(`
      INSERT INTO payments (
        participant_id,
        course_id,
        event_id,
        enrollment_id,
        registration_id,
        amount,
        currency,
        payment_method,
        status,
        transaction_id,
        paid_at,
        notes,
        processed_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING payment_id
    `);

    const paidAt = status === "completed" ? new Date().toISOString() : null;

    const result = stmt.get(
      participantId,
      courseId || null,
      eventId || null,
      enrollmentId || null,
      registrationId || null,
      amount,
      currency,
      paymentMethod,
      status,
      transactionId || null,
      paidAt,
      notes || null,
      processedBy
    ) as { payment_id: number };

    // Update enrollment or registration payment status if applicable
    if (enrollmentId && status === "completed") {
      // Get current enrollment payment info
      const enrollmentInfo = db
        .prepare(
          "SELECT total_amount, paid_amount FROM course_enrollments WHERE enrollment_id = ?"
        )
        .get(enrollmentId) as {
        total_amount: number | null;
        paid_amount: number;
      };

      const newPaidAmount = (enrollmentInfo.paid_amount || 0) + amount;
      let paymentStatus = "partial";

      if (
        enrollmentInfo.total_amount &&
        newPaidAmount >= enrollmentInfo.total_amount
      ) {
        paymentStatus = "paid";
      }

      const updateEnrollmentStmt = db.prepare(`
        UPDATE course_enrollments 
        SET paid_amount = ?, payment_status = ?
        WHERE enrollment_id = ?
      `);
      updateEnrollmentStmt.run(newPaidAmount, paymentStatus, enrollmentId);
    }

    if (registrationId && status === "completed") {
      // Get current registration payment info
      const registrationInfo = db
        .prepare(
          "SELECT total_amount, paid_amount FROM event_registrations WHERE registration_id = ?"
        )
        .get(registrationId) as {
        total_amount: number | null;
        paid_amount: number;
      };

      const newPaidAmount = (registrationInfo.paid_amount || 0) + amount;
      let paymentStatus = "partial";

      if (
        registrationInfo.total_amount &&
        newPaidAmount >= registrationInfo.total_amount
      ) {
        paymentStatus = "paid";
      }

      const updateRegistrationStmt = db.prepare(`
        UPDATE event_registrations 
        SET paid_amount = ?, payment_status = ?
        WHERE registration_id = ?
      `);
      updateRegistrationStmt.run(newPaidAmount, paymentStatus, registrationId);
    }

    return NextResponse.json({ paymentId: result.payment_id }, { status: 201 });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json(
      { error: "Fehler beim Erfassen der Zahlung" },
      { status: 500 }
    );
  }
}
