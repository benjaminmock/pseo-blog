import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { participantId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const participantId = parseInt(params.participantId);

    if (isNaN(participantId)) {
      return NextResponse.json(
        { error: "Ungültige Teilnehmer-ID" },
        { status: 400 }
      );
    }

    // Get participant details
    const participantStmt = db.prepare(`
      SELECT 
        participant_id,
        user_id,
        full_name,
        email,
        phone_number,
        emergency_contact,
        emergency_phone,
        medical_notes,
        date_of_birth,
        address,
        city,
        postal_code,
        created_at,
        updated_at
      FROM participants
      WHERE participant_id = ?
    `);

    const rawParticipant = participantStmt.get(participantId) as any;

    if (!rawParticipant) {
      return NextResponse.json(
        { error: "Teilnehmer nicht gefunden" },
        { status: 404 }
      );
    }

    // Transform participant data to camelCase
    const participant = {
      participantId: rawParticipant.participant_id,
      userId: rawParticipant.user_id,
      fullName: rawParticipant.full_name,
      email: rawParticipant.email,
      phone: rawParticipant.phone_number,
      emergencyContact: rawParticipant.emergency_contact,
      emergencyPhone: rawParticipant.emergency_phone,
      medicalNotes: rawParticipant.medical_notes,
      dateOfBirth: rawParticipant.date_of_birth,
      address: rawParticipant.address,
      city: rawParticipant.city,
      postalCode: rawParticipant.postal_code,
      createdAt: rawParticipant.created_at,
      updatedAt: rawParticipant.updated_at,
    };

    // Get enrollment history
    const enrollmentsStmt = db.prepare(`
      SELECT
        ce.enrollment_id,
        ce.course_id,
        ce.enrollment_date,
        ce.status,
        ce.payment_status,
        ce.total_amount,
        ce.paid_amount,
        ce.notes,
        c.course_name,
        c.start_date,
        c.end_date
      FROM course_enrollments ce
      JOIN Courses c ON ce.course_id = c.course_id
      WHERE ce.participant_id = ?
      ORDER BY ce.enrollment_date DESC
    `);

    const rawEnrollments = enrollmentsStmt.all(participantId) as any[];
    const enrollments = rawEnrollments.map((e) => ({
      enrollmentId: e.enrollment_id,
      courseId: e.course_id,
      enrollmentDate: e.enrollment_date,
      status: e.status,
      paymentStatus: e.payment_status,
      totalAmount: e.total_amount,
      paidAmount: e.paid_amount,
      notes: e.notes,
      courseName: e.course_name,
      startDate: e.start_date,
      endDate: e.end_date,
    }));

    // Get event registrations
    const registrationsStmt = db.prepare(`
      SELECT
        er.registration_id,
        er.event_id,
        er.registration_date,
        er.status,
        er.payment_status,
        er.total_amount,
        er.paid_amount,
        er.notes,
        e.event_name,
        e.start_date,
        e.start_time
      FROM event_registrations er
      JOIN Events e ON er.event_id = e.event_id
      WHERE er.participant_id = ?
      ORDER BY er.registration_date DESC
    `);

    const rawRegistrations = registrationsStmt.all(participantId) as any[];
    const registrations = rawRegistrations.map((r) => ({
      registrationId: r.registration_id,
      eventId: r.event_id,
      registrationDate: r.registration_date,
      status: r.status,
      paymentStatus: r.payment_status,
      totalAmount: r.total_amount,
      paidAmount: r.paid_amount,
      notes: r.notes,
      eventName: r.event_name,
      startDate: r.start_date,
      startTime: r.start_time,
    }));

    // Get attendance records
    const attendanceStmt = db.prepare(`
      SELECT
        ar.attendance_id,
        ar.course_id,
        ar.event_id,
        ar.session_date,
        ar.session_number,
        ar.attended,
        ar.check_in_time,
        ar.notes,
        ar.recorded_at,
        c.course_name,
        e.event_name
      FROM attendance_records ar
      LEFT JOIN Courses c ON ar.course_id = c.course_id
      LEFT JOIN Events e ON ar.event_id = e.event_id
      WHERE ar.participant_id = ?
      ORDER BY ar.session_date DESC
    `);

    const rawAttendance = attendanceStmt.all(participantId) as any[];
    const attendance = rawAttendance.map((a) => ({
      attendanceId: a.attendance_id,
      courseId: a.course_id,
      eventId: a.event_id,
      sessionDate: a.session_date,
      sessionNumber: a.session_number,
      attended: a.attended,
      checkInTime: a.check_in_time,
      notes: a.notes,
      recordedAt: a.recorded_at,
      courseName: a.course_name,
      eventName: a.event_name,
    }));

    // Get payment records
    const paymentsStmt = db.prepare(`
      SELECT
        p.payment_id,
        p.participant_id,
        p.course_id,
        p.event_id,
        p.amount,
        p.payment_method,
        p.status,
        p.paid_at,
        p.created_at,
        p.notes,
        c.course_name,
        e.event_name
      FROM payments p
      LEFT JOIN Courses c ON p.course_id = c.course_id
      LEFT JOIN Events e ON p.event_id = e.event_id
      WHERE p.participant_id = ?
      ORDER BY p.created_at DESC
    `);

    const rawPayments = paymentsStmt.all(participantId) as any[];
    const payments = rawPayments.map((p) => ({
      paymentId: p.payment_id,
      participantId: p.participant_id,
      courseId: p.course_id,
      eventId: p.event_id,
      amount: p.amount,
      paymentMethod: p.payment_method,
      status: p.status,
      paidAt: p.paid_at,
      createdAt: p.created_at,
      notes: p.notes,
      courseName: p.course_name,
      eventName: p.event_name,
    }));

    return NextResponse.json({
      participant,
      enrollments,
      registrations,
      attendance,
      payments,
    });
  } catch (error) {
    console.error("Error fetching participant details:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Teilnehmerdetails" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { participantId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const participantId = parseInt(params.participantId);

    if (isNaN(participantId)) {
      return NextResponse.json(
        { error: "Ungültige Teilnehmer-ID" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const {
      fullName,
      email,
      phone,
      emergencyContact,
      emergencyPhone,
      medicalNotes,
      dateOfBirth,
      address,
      city,
      postalCode,
    } = data;

    // Validate required fields
    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Name und E-Mail sind erforderlich" },
        { status: 400 }
      );
    }

    // Check if participant exists
    const existingParticipant = db
      .prepare(
        "SELECT participant_id FROM participants WHERE participant_id = ?"
      )
      .get(participantId);

    if (!existingParticipant) {
      return NextResponse.json(
        { error: "Teilnehmer nicht gefunden" },
        { status: 404 }
      );
    }

    // Check if email is already used by another participant
    const emailCheck = db
      .prepare(
        "SELECT participant_id FROM participants WHERE email = ? AND participant_id != ?"
      )
      .get(email, participantId);

    if (emailCheck) {
      return NextResponse.json(
        {
          error:
            "Diese E-Mail-Adresse wird bereits von einem anderen Teilnehmer verwendet",
        },
        { status: 409 }
      );
    }

    // Update participant
    const stmt = db.prepare(`
      UPDATE participants SET
        full_name = ?,
        email = ?,
        phone_number = ?,
        emergency_contact = ?,
        emergency_phone = ?,
        medical_notes = ?,
        date_of_birth = ?,
        address = ?,
        city = ?,
        postal_code = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE participant_id = ?
    `);

    stmt.run(
      fullName,
      email,
      phone,
      emergencyContact,
      emergencyPhone,
      medicalNotes,
      dateOfBirth,
      address,
      city,
      postalCode,
      participantId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Teilnehmers" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { participantId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const participantId = parseInt(params.participantId);

    if (isNaN(participantId)) {
      return NextResponse.json(
        { error: "Ungültige Teilnehmer-ID" },
        { status: 400 }
      );
    }

    // Check if participant exists
    const existingParticipant = db
      .prepare(
        "SELECT participant_id FROM participants WHERE participant_id = ?"
      )
      .get(participantId);

    if (!existingParticipant) {
      return NextResponse.json(
        { error: "Teilnehmer nicht gefunden" },
        { status: 404 }
      );
    }

    // Check if participant has active enrollments or registrations
    const activeEnrollments = db
      .prepare(
        "SELECT COUNT(*) as count FROM course_enrollments WHERE participant_id = ? AND status = 'active'"
      )
      .get(participantId) as { count: number };

    const activeRegistrations = db
      .prepare(
        "SELECT COUNT(*) as count FROM event_registrations WHERE participant_id = ? AND status = 'registered'"
      )
      .get(participantId) as { count: number };

    if (activeEnrollments.count > 0 || activeRegistrations.count > 0) {
      return NextResponse.json(
        {
          error:
            "Teilnehmer kann nicht gelöscht werden, da noch aktive Anmeldungen vorhanden sind",
        },
        { status: 409 }
      );
    }

    // Soft delete by updating a status field or hard delete
    // For now, we'll do a hard delete but in production you might want soft delete
    const stmt = db.prepare(
      "DELETE FROM participants WHERE participant_id = ?"
    );
    stmt.run(participantId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting participant:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Teilnehmers" },
      { status: 500 }
    );
  }
}
