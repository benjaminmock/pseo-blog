import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const enrollmentId = parseInt(params.enrollmentId);

    if (isNaN(enrollmentId)) {
      return NextResponse.json(
        { error: "Ungültige Anmeldungs-ID" },
        { status: 400 }
      );
    }

    // Get enrollment details
    const enrollmentStmt = db.prepare(`
      SELECT 
        ce.enrollment_id,
        ce.participant_id,
        ce.course_id,
        ce.enrollment_date,
        ce.status,
        ce.payment_status,
        ce.total_amount,
        ce.paid_amount,
        ce.notes,
        ce.enrolled_by,
        p.full_name,
        p.email,
        p.phone_number,
        p.emergency_contact,
        p.emergency_phone,
        p.medical_notes,
        c.course_name,
        c.start_date,
        c.end_date,
        c.description,
        c.price,
        t.first_name as trainer_first_name,
        t.last_name as trainer_last_name
      FROM course_enrollments ce
      JOIN participants p ON ce.participant_id = p.participant_id
      JOIN Courses c ON ce.course_id = c.course_id
      LEFT JOIN Trainers t ON ce.enrolled_by = t.trainer_id
      WHERE ce.enrollment_id = ?
    `);

    const rawEnrollment = enrollmentStmt.get(enrollmentId) as
      | {
          enrollment_id: number;
          participant_id: number;
          course_id: number;
          enrollment_date: string;
          status: string;
          payment_status: string;
          total_amount: number | null;
          paid_amount: number;
          notes: string | null;
          enrolled_by: number | null;
          full_name: string;
          email: string;
          phone_number: string | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          medical_notes: string | null;
          course_name: string;
          start_date: string;
          end_date: string;
          description: string | null;
          price: number | null;
          trainer_first_name: string | null;
          trainer_last_name: string | null;
        }
      | undefined;

    if (!rawEnrollment) {
      return NextResponse.json(
        { error: "Anmeldung nicht gefunden" },
        { status: 404 }
      );
    }

    // Transform the data to match the expected frontend format
    const enrollment = {
      enrollmentId: rawEnrollment.enrollment_id,
      participantId: rawEnrollment.participant_id,
      courseId: rawEnrollment.course_id,
      enrollmentDate: rawEnrollment.enrollment_date,
      status: rawEnrollment.status,
      paymentStatus: rawEnrollment.payment_status,
      totalAmount: rawEnrollment.total_amount,
      paidAmount: rawEnrollment.paid_amount,
      notes: rawEnrollment.notes,
      enrolledBy: rawEnrollment.enrolled_by,
      // Additional fields for display
      participantName: rawEnrollment.full_name,
      participantEmail: rawEnrollment.email,
      participantPhone: rawEnrollment.phone_number,
      emergencyContact: rawEnrollment.emergency_contact,
      emergencyPhone: rawEnrollment.emergency_phone,
      medicalNotes: rawEnrollment.medical_notes,
      courseName: rawEnrollment.course_name,
      courseStartDate: rawEnrollment.start_date,
      courseEndDate: rawEnrollment.end_date,
      courseDescription: rawEnrollment.description,
      coursePrice: rawEnrollment.price,
      trainerName:
        rawEnrollment.trainer_first_name && rawEnrollment.trainer_last_name
          ? `${rawEnrollment.trainer_first_name} ${rawEnrollment.trainer_last_name}`
          : "Unbekannt",
    };

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error("Error fetching enrollment details:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Anmeldungsdetails" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const enrollmentId = parseInt(params.enrollmentId);

    if (isNaN(enrollmentId)) {
      return NextResponse.json(
        { error: "Ungültige Anmeldungs-ID" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { status, paymentStatus, totalAmount, paidAmount, notes } = data;

    // Check if enrollment exists
    const existingEnrollment = db
      .prepare(
        "SELECT enrollment_id, course_id, status FROM course_enrollments WHERE enrollment_id = ?"
      )
      .get(enrollmentId) as
      | { enrollment_id: number; course_id: number; status: string }
      | undefined;

    if (!existingEnrollment) {
      return NextResponse.json(
        { error: "Anmeldung nicht gefunden" },
        { status: 404 }
      );
    }

    // If status is changing from active to cancelled, update course enrollment count
    if (existingEnrollment.status === "active" && status === "cancelled") {
      const updateCourseStmt = db.prepare(`
        UPDATE Courses 
        SET current_enrollments = current_enrollments - 1 
        WHERE course_id = ?
      `);
      updateCourseStmt.run(existingEnrollment.course_id);
    }
    // If status is changing from cancelled to active, update course enrollment count
    else if (existingEnrollment.status === "cancelled" && status === "active") {
      // Check capacity first
      const course = db
        .prepare(
          "SELECT max_capacity, current_enrollments FROM Courses WHERE course_id = ?"
        )
        .get(existingEnrollment.course_id) as {
        max_capacity: number | null;
        current_enrollments: number;
      };

      if (
        course.max_capacity &&
        course.current_enrollments >= course.max_capacity
      ) {
        return NextResponse.json(
          { error: "Kurs ist bereits ausgebucht" },
          { status: 409 }
        );
      }

      const updateCourseStmt = db.prepare(`
        UPDATE Courses 
        SET current_enrollments = current_enrollments + 1 
        WHERE course_id = ?
      `);
      updateCourseStmt.run(existingEnrollment.course_id);
    }

    // Update enrollment
    const stmt = db.prepare(`
      UPDATE course_enrollments SET
        status = ?,
        payment_status = ?,
        total_amount = ?,
        paid_amount = ?,
        notes = ?
      WHERE enrollment_id = ?
    `);

    stmt.run(
      status,
      paymentStatus,
      totalAmount,
      paidAmount,
      notes,
      enrollmentId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Anmeldung" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const enrollmentId = parseInt(params.enrollmentId);

    if (isNaN(enrollmentId)) {
      return NextResponse.json(
        { error: "Ungültige Anmeldungs-ID" },
        { status: 400 }
      );
    }

    // Check if enrollment exists and get course info
    const existingEnrollment = db
      .prepare(
        "SELECT enrollment_id, course_id, status FROM course_enrollments WHERE enrollment_id = ?"
      )
      .get(enrollmentId) as
      | { enrollment_id: number; course_id: number; status: string }
      | undefined;

    if (!existingEnrollment) {
      return NextResponse.json(
        { error: "Anmeldung nicht gefunden" },
        { status: 404 }
      );
    }

    // If enrollment was active, decrease course enrollment count
    if (existingEnrollment.status === "active") {
      const updateCourseStmt = db.prepare(`
        UPDATE Courses 
        SET current_enrollments = current_enrollments - 1 
        WHERE course_id = ?
      `);
      updateCourseStmt.run(existingEnrollment.course_id);
    }

    // Delete enrollment
    const stmt = db.prepare(
      "DELETE FROM course_enrollments WHERE enrollment_id = ?"
    );
    stmt.run(enrollmentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen der Anmeldung" },
      { status: 500 }
    );
  }
}
