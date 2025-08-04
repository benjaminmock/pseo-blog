import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const courseId = parseInt(params.courseId);

    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Ungültige Kurs-ID" }, { status: 400 });
    }

    // Check if course exists
    const course = db
      .prepare("SELECT course_id, course_name FROM Courses WHERE course_id = ?")
      .get(courseId);

    if (!course) {
      return NextResponse.json(
        { error: "Kurs nicht gefunden" },
        { status: 404 }
      );
    }

    // Get all enrollments for this course
    const enrollmentsStmt = db.prepare(`
      SELECT 
        ce.enrollment_id,
        ce.participant_id,
        ce.enrollment_date,
        ce.status,
        ce.payment_status,
        ce.total_amount,
        ce.paid_amount,
        ce.notes,
        p.full_name,
        p.email,
        p.phone_number,
        p.emergency_contact,
        p.emergency_phone,
        p.medical_notes
      FROM course_enrollments ce
      JOIN participants p ON ce.participant_id = p.participant_id
      WHERE ce.course_id = ?
      ORDER BY ce.enrollment_date ASC
    `);

    const rawEnrollments = enrollmentsStmt.all(courseId);

    // Transform the data to match the expected frontend format
    const enrollments = rawEnrollments.map((enrollment: any) => ({
      enrollmentId: enrollment.enrollment_id,
      participantId: enrollment.participant_id,
      courseId: courseId,
      enrollmentDate: enrollment.enrollment_date,
      status: enrollment.status,
      paymentStatus: enrollment.payment_status,
      totalAmount: enrollment.total_amount,
      paidAmount: enrollment.paid_amount,
      notes: enrollment.notes,
      // Additional fields for display
      participantName: enrollment.full_name,
      participantEmail: enrollment.email,
      participantPhone: enrollment.phone_number,
      emergencyContact: enrollment.emergency_contact,
      emergencyPhone: enrollment.emergency_phone,
      medicalNotes: enrollment.medical_notes,
    }));

    return NextResponse.json({
      course,
      enrollments,
      total: enrollments.length,
    });
  } catch (error) {
    console.error("Error fetching course enrollments:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Kursanmeldungen" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const courseId = parseInt(params.courseId);

    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Ungültige Kurs-ID" }, { status: 400 });
    }

    const data = await request.json();
    const { participantIds, totalAmount, notes } = data;

    // Validate required fields
    if (
      !participantIds ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Teilnehmer-IDs sind erforderlich" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = db
      .prepare(
        "SELECT course_id, max_capacity, current_enrollments FROM Courses WHERE course_id = ? AND active = 1"
      )
      .get(courseId) as {
      course_id: number;
      max_capacity: number | null;
      current_enrollments: number;
    };

    if (!course) {
      return NextResponse.json(
        { error: "Kurs nicht gefunden oder nicht aktiv" },
        { status: 404 }
      );
    }

    // Check capacity
    if (
      course.max_capacity &&
      course.current_enrollments + participantIds.length > course.max_capacity
    ) {
      return NextResponse.json(
        { error: "Nicht genügend Plätze im Kurs verfügbar" },
        { status: 409 }
      );
    }

    // Get trainer ID
    const trainer = db
      .prepare("SELECT trainer_id FROM Trainers WHERE email = ?")
      .get(user.email) as { trainer_id: number } | undefined;

    const enrolledBy = trainer?.trainer_id || null;

    const results = [];
    const errors = [];

    // Process each participant
    for (const participantId of participantIds) {
      try {
        // Check if participant exists
        const participant = db
          .prepare(
            "SELECT participant_id FROM participants WHERE participant_id = ?"
          )
          .get(participantId);

        if (!participant) {
          errors.push(`Teilnehmer mit ID ${participantId} nicht gefunden`);
          continue;
        }

        // Check if already enrolled
        const existingEnrollment = db
          .prepare(
            "SELECT enrollment_id FROM course_enrollments WHERE participant_id = ? AND course_id = ?"
          )
          .get(participantId, courseId);

        if (existingEnrollment) {
          errors.push(
            `Teilnehmer mit ID ${participantId} ist bereits angemeldet`
          );
          continue;
        }

        // Insert enrollment
        const stmt = db.prepare(`
          INSERT INTO course_enrollments (
            participant_id,
            course_id,
            status,
            payment_status,
            total_amount,
            paid_amount,
            notes,
            enrolled_by
          )
          VALUES (?, ?, 'active', 'pending', ?, 0, ?, ?)
          RETURNING enrollment_id
        `);

        const result = stmt.get(
          participantId,
          courseId,
          totalAmount,
          notes,
          enrolledBy
        ) as { enrollment_id: number };

        results.push({
          participantId,
          enrollmentId: result.enrollment_id,
          success: true,
        });
      } catch (error) {
        errors.push(`Fehler bei Teilnehmer ${participantId}: ${error}`);
      }
    }

    // Update course enrollment count
    if (results.length > 0) {
      const updateCourseStmt = db.prepare(`
        UPDATE Courses 
        SET current_enrollments = current_enrollments + ? 
        WHERE course_id = ?
      `);
      updateCourseStmt.run(results.length, courseId);
    }

    return NextResponse.json({
      success: results.length,
      errors: errors.length,
      results,
      errorMessages: errors,
    });
  } catch (error) {
    console.error("Error bulk enrolling participants:", error);
    return NextResponse.json(
      { error: "Fehler beim Massenanmelden der Teilnehmer" },
      { status: 500 }
    );
  }
}
