import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const paymentId = parseInt(params.paymentId);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: "Ungültige Zahlungs-ID" },
        { status: 400 }
      );
    }

    // Get payment details with related information
    const paymentStmt = db.prepare(`
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
        p.phone_number,
        p.emergency_contact,
        p.emergency_phone,
        p.medical_notes,
        c.course_name,
        c.start_date as course_start_date,
        c.end_date as course_end_date,
        c.description as course_description,
        c.price as course_price,
        e.event_name,
        e.start_date as event_date,
        e.description as event_description,
        e.price as event_price,
        t.first_name as processor_first_name,
        t.last_name as processor_last_name,
        ce.enrollment_date,
        ce.status as enrollment_status,
        er.registration_date,
        er.status as registration_status
      FROM payments pay
      JOIN participants p ON pay.participant_id = p.participant_id
      LEFT JOIN Courses c ON pay.course_id = c.course_id
      LEFT JOIN Events e ON pay.event_id = e.event_id
      LEFT JOIN Trainers t ON pay.processed_by = t.trainer_id
      LEFT JOIN course_enrollments ce ON pay.enrollment_id = ce.enrollment_id
      LEFT JOIN event_registrations er ON pay.registration_id = er.registration_id
      WHERE pay.payment_id = ?
    `);

    const rawPayment = paymentStmt.get(paymentId) as
      | {
          payment_id: number;
          participant_id: number;
          course_id: number | null;
          event_id: number | null;
          enrollment_id: number | null;
          registration_id: number | null;
          amount: number;
          currency: string;
          payment_method: string;
          status: string;
          transaction_id: string | null;
          stripe_payment_intent_id: string | null;
          paid_at: string | null;
          refunded_at: string | null;
          refund_amount: number | null;
          created_at: string;
          notes: string | null;
          processed_by: number | null;
          full_name: string;
          email: string;
          phone_number: string | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          medical_notes: string | null;
          course_name: string | null;
          course_start_date: string | null;
          course_end_date: string | null;
          course_description: string | null;
          course_price: number | null;
          event_name: string | null;
          event_date: string | null;
          event_description: string | null;
          event_price: number | null;
          processor_first_name: string | null;
          processor_last_name: string | null;
          enrollment_date: string | null;
          enrollment_status: string | null;
          registration_date: string | null;
          registration_status: string | null;
        }
      | undefined;

    if (!rawPayment) {
      return NextResponse.json(
        { error: "Zahlung nicht gefunden" },
        { status: 404 }
      );
    }

    // Transform the data to match the expected frontend format
    const payment = {
      paymentId: rawPayment.payment_id,
      participantId: rawPayment.participant_id,
      courseId: rawPayment.course_id,
      eventId: rawPayment.event_id,
      enrollmentId: rawPayment.enrollment_id,
      registrationId: rawPayment.registration_id,
      amount: rawPayment.amount,
      currency: rawPayment.currency,
      paymentMethod: rawPayment.payment_method,
      status: rawPayment.status,
      transactionId: rawPayment.transaction_id,
      stripePaymentIntentId: rawPayment.stripe_payment_intent_id,
      paidAt: rawPayment.paid_at,
      refundedAt: rawPayment.refunded_at,
      refundAmount: rawPayment.refund_amount,
      createdAt: rawPayment.created_at,
      notes: rawPayment.notes,
      processedBy: rawPayment.processed_by,
      // Participant information
      participantName: rawPayment.full_name,
      participantEmail: rawPayment.email,
      participantPhone: rawPayment.phone_number,
      emergencyContact: rawPayment.emergency_contact,
      emergencyPhone: rawPayment.emergency_phone,
      medicalNotes: rawPayment.medical_notes,
      // Course information (if applicable)
      courseName: rawPayment.course_name,
      courseStartDate: rawPayment.course_start_date,
      courseEndDate: rawPayment.course_end_date,
      courseDescription: rawPayment.course_description,
      coursePrice: rawPayment.course_price,
      enrollmentDate: rawPayment.enrollment_date,
      enrollmentStatus: rawPayment.enrollment_status,
      // Event information (if applicable)
      eventName: rawPayment.event_name,
      eventDate: rawPayment.event_date,
      eventDescription: rawPayment.event_description,
      eventPrice: rawPayment.event_price,
      registrationDate: rawPayment.registration_date,
      registrationStatus: rawPayment.registration_status,
      // Processor information
      processorName:
        rawPayment.processor_first_name && rawPayment.processor_last_name
          ? `${rawPayment.processor_first_name} ${rawPayment.processor_last_name}`
          : "System",
    };

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Zahlungsdetails" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const paymentId = parseInt(params.paymentId);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: "Ungültige Zahlungs-ID" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { status, amount, paymentMethod, notes, refundAmount } = data;

    // Check if payment exists
    const existingPayment = db
      .prepare(
        "SELECT payment_id, status, amount, enrollment_id, registration_id FROM payments WHERE payment_id = ?"
      )
      .get(paymentId) as
      | {
          payment_id: number;
          status: string;
          amount: number;
          enrollment_id: number | null;
          registration_id: number | null;
        }
      | undefined;

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Zahlung nicht gefunden" },
        { status: 404 }
      );
    }

    // Handle refund logic
    let refundedAt = null;
    if (status === "refunded" && existingPayment.status !== "refunded") {
      refundedAt = new Date().toISOString();
    }

    // Update payment
    const stmt = db.prepare(`
      UPDATE payments SET
        status = ?,
        amount = ?,
        payment_method = ?,
        notes = ?,
        refund_amount = ?,
        refunded_at = ?
      WHERE payment_id = ?
    `);

    stmt.run(
      status,
      amount,
      paymentMethod,
      notes,
      refundAmount || null,
      refundedAt,
      paymentId
    );

    // Update related enrollment or registration payment status if needed
    if (existingPayment.enrollment_id) {
      // Recalculate enrollment payment status
      const enrollmentPayments = db
        .prepare(
          "SELECT SUM(amount) as total_paid FROM payments WHERE enrollment_id = ? AND status = 'completed'"
        )
        .get(existingPayment.enrollment_id) as { total_paid: number | null };

      const enrollment = db
        .prepare(
          "SELECT total_amount FROM course_enrollments WHERE enrollment_id = ?"
        )
        .get(existingPayment.enrollment_id) as { total_amount: number | null };

      const totalPaid = enrollmentPayments.total_paid || 0;
      let paymentStatus = "pending";

      if (totalPaid > 0 && enrollment.total_amount) {
        if (totalPaid >= enrollment.total_amount) {
          paymentStatus = "paid";
        } else {
          paymentStatus = "partial";
        }
      }

      const updateEnrollmentStmt = db.prepare(`
        UPDATE course_enrollments 
        SET paid_amount = ?, payment_status = ?
        WHERE enrollment_id = ?
      `);
      updateEnrollmentStmt.run(
        totalPaid,
        paymentStatus,
        existingPayment.enrollment_id
      );
    }

    if (existingPayment.registration_id) {
      // Recalculate registration payment status
      const registrationPayments = db
        .prepare(
          "SELECT SUM(amount) as total_paid FROM payments WHERE registration_id = ? AND status = 'completed'"
        )
        .get(existingPayment.registration_id) as { total_paid: number | null };

      const registration = db
        .prepare(
          "SELECT total_amount FROM event_registrations WHERE registration_id = ?"
        )
        .get(existingPayment.registration_id) as {
        total_amount: number | null;
      };

      const totalPaid = registrationPayments.total_paid || 0;
      let paymentStatus = "pending";

      if (totalPaid > 0 && registration.total_amount) {
        if (totalPaid >= registration.total_amount) {
          paymentStatus = "paid";
        } else {
          paymentStatus = "partial";
        }
      }

      const updateRegistrationStmt = db.prepare(`
        UPDATE event_registrations 
        SET paid_amount = ?, payment_status = ?
        WHERE registration_id = ?
      `);
      updateRegistrationStmt.run(
        totalPaid,
        paymentStatus,
        existingPayment.registration_id
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Zahlung" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const paymentId = parseInt(params.paymentId);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: "Ungültige Zahlungs-ID" },
        { status: 400 }
      );
    }

    // Check if payment exists and get related info
    const existingPayment = db
      .prepare(
        "SELECT payment_id, amount, status, enrollment_id, registration_id FROM payments WHERE payment_id = ?"
      )
      .get(paymentId) as
      | {
          payment_id: number;
          amount: number;
          status: string;
          enrollment_id: number | null;
          registration_id: number | null;
        }
      | undefined;

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Zahlung nicht gefunden" },
        { status: 404 }
      );
    }

    // Delete payment
    const stmt = db.prepare("DELETE FROM payments WHERE payment_id = ?");
    stmt.run(paymentId);

    // Update related enrollment or registration payment status
    if (
      existingPayment.enrollment_id &&
      existingPayment.status === "completed"
    ) {
      const enrollmentPayments = db
        .prepare(
          "SELECT SUM(amount) as total_paid FROM payments WHERE enrollment_id = ? AND status = 'completed'"
        )
        .get(existingPayment.enrollment_id) as { total_paid: number | null };

      const enrollment = db
        .prepare(
          "SELECT total_amount FROM course_enrollments WHERE enrollment_id = ?"
        )
        .get(existingPayment.enrollment_id) as { total_amount: number | null };

      const totalPaid = enrollmentPayments.total_paid || 0;
      let paymentStatus = "pending";

      if (totalPaid > 0 && enrollment.total_amount) {
        if (totalPaid >= enrollment.total_amount) {
          paymentStatus = "paid";
        } else {
          paymentStatus = "partial";
        }
      }

      const updateEnrollmentStmt = db.prepare(`
        UPDATE course_enrollments 
        SET paid_amount = ?, payment_status = ?
        WHERE enrollment_id = ?
      `);
      updateEnrollmentStmt.run(
        totalPaid,
        paymentStatus,
        existingPayment.enrollment_id
      );
    }

    if (
      existingPayment.registration_id &&
      existingPayment.status === "completed"
    ) {
      const registrationPayments = db
        .prepare(
          "SELECT SUM(amount) as total_paid FROM payments WHERE registration_id = ? AND status = 'completed'"
        )
        .get(existingPayment.registration_id) as { total_paid: number | null };

      const registration = db
        .prepare(
          "SELECT total_amount FROM event_registrations WHERE registration_id = ?"
        )
        .get(existingPayment.registration_id) as {
        total_amount: number | null;
      };

      const totalPaid = registrationPayments.total_paid || 0;
      let paymentStatus = "pending";

      if (totalPaid > 0 && registration.total_amount) {
        if (totalPaid >= registration.total_amount) {
          paymentStatus = "paid";
        } else {
          paymentStatus = "partial";
        }
      }

      const updateRegistrationStmt = db.prepare(`
        UPDATE event_registrations 
        SET paid_amount = ?, payment_status = ?
        WHERE registration_id = ?
      `);
      updateRegistrationStmt.run(
        totalPaid,
        paymentStatus,
        existingPayment.registration_id
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen der Zahlung" },
      { status: 500 }
    );
  }
}
