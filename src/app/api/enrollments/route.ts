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
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const offset = (page - 1) * limit;

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

    // Build WHERE clause - only show enrollments for courses owned by this trainer
    let whereClause = "WHERE c.trainer_id = ?";
    let queryParams: (string | number)[] = [trainerResult.trainer_id];

    if (courseId) {
      whereClause += " AND ce.course_id = ?";
      queryParams.push(parseInt(courseId));
    }

    if (status) {
      whereClause += " AND ce.status = ?";
      queryParams.push(status);
    }

    // Get enrollments with participant and course details
    const enrollmentsStmt = db.prepare(`
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
        c.course_name,
        c.start_date,
        c.end_date,
        t.first_name as trainer_first_name,
        t.last_name as trainer_last_name
      FROM course_enrollments ce
      JOIN participants p ON ce.participant_id = p.participant_id
      JOIN Courses c ON ce.course_id = c.course_id
      LEFT JOIN Trainers t ON ce.enrolled_by = t.trainer_id
      ${whereClause}
      ORDER BY ce.enrollment_date DESC
      LIMIT ? OFFSET ?
    `);

    const rawEnrollments = enrollmentsStmt.all(...queryParams, limit, offset);

    // Transform the data to match the expected frontend format
    const enrollments = rawEnrollments.map((enrollment: any) => ({
      enrollmentId: enrollment.enrollment_id,
      participantId: enrollment.participant_id,
      courseId: enrollment.course_id,
      enrollmentDate: enrollment.enrollment_date,
      status: enrollment.status,
      paymentStatus: enrollment.payment_status,
      totalAmount: enrollment.total_amount,
      paidAmount: enrollment.paid_amount,
      notes: enrollment.notes,
      enrolledBy: enrollment.enrolled_by,
      // Additional fields for display
      participantName: enrollment.full_name,
      participantEmail: enrollment.email,
      courseName: enrollment.course_name,
      trainerName:
        enrollment.trainer_first_name && enrollment.trainer_last_name
          ? `${enrollment.trainer_first_name} ${enrollment.trainer_last_name}`
          : "Unbekannt",
      courseStartDate: enrollment.start_date,
    }));

    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM course_enrollments ce
      JOIN Courses c ON ce.course_id = c.course_id
      ${whereClause}
    `);

    const countResult = countStmt.get(...queryParams) as { count: number };
    const totalCount = countResult.count;

    return NextResponse.json({
      enrollments,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Anmeldungen" },
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
      totalAmount,
      paidAmount = 0,
      notes,
    } = data;

    // Validate required fields
    if (!participantId || !courseId) {
      return NextResponse.json(
        { error: "Teilnehmer-ID und Kurs-ID sind erforderlich" },
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

    // Check if participant is already enrolled
    const existingEnrollment = db
      .prepare(
        "SELECT enrollment_id FROM course_enrollments WHERE participant_id = ? AND course_id = ?"
      )
      .get(participantId, courseId);

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Teilnehmer ist bereits für diesen Kurs angemeldet" },
        { status: 409 }
      );
    }

    // Check capacity
    if (
      course.max_capacity &&
      course.current_enrollments >= course.max_capacity
    ) {
      return NextResponse.json(
        { error: "Kurs ist bereits ausgebucht" },
        { status: 409 }
      );
    }

    // Get trainer ID for enrolled_by field
    const trainer = db
      .prepare("SELECT trainer_id FROM Trainers WHERE email = ?")
      .get(user.email) as { trainer_id: number } | undefined;

    const enrolledBy = trainer?.trainer_id || null;

    // Determine payment status
    let paymentStatus = "pending";
    if (paidAmount > 0) {
      if (totalAmount && paidAmount >= totalAmount) {
        paymentStatus = "paid";
      } else {
        paymentStatus = "partial";
      }
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
      VALUES (?, ?, 'active', ?, ?, ?, ?, ?)
      RETURNING enrollment_id
    `);

    const result = stmt.get(
      participantId,
      courseId,
      paymentStatus,
      totalAmount,
      paidAmount,
      notes,
      enrolledBy
    ) as { enrollment_id: number };

    // Update course enrollment count
    const updateCourseStmt = db.prepare(`
      UPDATE Courses 
      SET current_enrollments = current_enrollments + 1 
      WHERE course_id = ?
    `);
    updateCourseStmt.run(courseId);

    return NextResponse.json(
      { enrollmentId: result.enrollment_id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Anmeldung" },
      { status: 500 }
    );
  }
}
