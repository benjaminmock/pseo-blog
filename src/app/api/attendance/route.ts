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
    const eventId = searchParams.get("eventId");
    const participantId = searchParams.get("participantId");
    const sessionDate = searchParams.get("sessionDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    let queryParams: (string | number)[] = [];

    if (courseId) {
      whereClause += " AND ar.course_id = ?";
      queryParams.push(parseInt(courseId));
    }

    if (eventId) {
      whereClause += " AND ar.event_id = ?";
      queryParams.push(parseInt(eventId));
    }

    if (participantId) {
      whereClause += " AND ar.participant_id = ?";
      queryParams.push(parseInt(participantId));
    }

    if (sessionDate) {
      whereClause += " AND ar.session_date = ?";
      queryParams.push(sessionDate);
    }

    // Get attendance records with participant and course/event details
    const attendanceStmt = db.prepare(`
      SELECT 
        ar.attendance_id,
        ar.participant_id,
        ar.course_id,
        ar.event_id,
        ar.session_date,
        ar.session_number,
        ar.attended,
        ar.check_in_time,
        ar.notes,
        ar.recorded_at,
        ar.recorded_by,
        p.full_name,
        p.email,
        c.course_name,
        e.event_name,
        t.first_name as recorder_first_name,
        t.last_name as recorder_last_name
      FROM attendance_records ar
      JOIN participants p ON ar.participant_id = p.participant_id
      LEFT JOIN Courses c ON ar.course_id = c.course_id
      LEFT JOIN Events e ON ar.event_id = e.event_id
      LEFT JOIN Trainers t ON ar.recorded_by = t.trainer_id
      ${whereClause}
      ORDER BY ar.session_date DESC, ar.recorded_at DESC
      LIMIT ? OFFSET ?
    `);

    const attendance = attendanceStmt.all(...queryParams, limit, offset);

    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM attendance_records ar
      ${whereClause}
    `);

    const countResult = countStmt.get(...queryParams) as { count: number };
    const totalCount = countResult.count;

    return NextResponse.json({
      attendance,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Anwesenheitsdaten" },
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
      sessionDate,
      sessionNumber,
      attended,
      checkInTime,
      notes,
    } = data;

    // Validate required fields
    if (!participantId || !sessionDate || attended === undefined) {
      return NextResponse.json(
        {
          error:
            "Teilnehmer-ID, Sitzungsdatum und Anwesenheitsstatus sind erforderlich",
        },
        { status: 400 }
      );
    }

    // Must have either courseId or eventId
    if (!courseId && !eventId) {
      return NextResponse.json(
        { error: "Kurs-ID oder Event-ID ist erforderlich" },
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

    // Check if course or event exists and participant is enrolled/registered
    if (courseId) {
      const enrollment = db
        .prepare(
          "SELECT enrollment_id FROM course_enrollments WHERE participant_id = ? AND course_id = ? AND status = 'active'"
        )
        .get(participantId, courseId);

      if (!enrollment) {
        return NextResponse.json(
          { error: "Teilnehmer ist nicht für diesen Kurs angemeldet" },
          { status: 404 }
        );
      }
    }

    if (eventId) {
      const registration = db
        .prepare(
          "SELECT registration_id FROM event_registrations WHERE participant_id = ? AND event_id = ? AND status = 'registered'"
        )
        .get(participantId, eventId);

      if (!registration) {
        return NextResponse.json(
          { error: "Teilnehmer ist nicht für dieses Event angemeldet" },
          { status: 404 }
        );
      }
    }

    // Check if attendance record already exists for this session
    let existingCheck = "";
    let existingParams = [participantId, sessionDate];

    if (courseId) {
      existingCheck =
        "SELECT attendance_id FROM attendance_records WHERE participant_id = ? AND session_date = ? AND course_id = ?";
      existingParams.push(courseId);
    } else {
      existingCheck =
        "SELECT attendance_id FROM attendance_records WHERE participant_id = ? AND session_date = ? AND event_id = ?";
      existingParams.push(eventId);
    }

    if (sessionNumber) {
      existingCheck += " AND session_number = ?";
      existingParams.push(sessionNumber);
    }

    const existingRecord = db.prepare(existingCheck).get(...existingParams);

    if (existingRecord) {
      return NextResponse.json(
        { error: "Anwesenheitsdatensatz für diese Sitzung existiert bereits" },
        { status: 409 }
      );
    }

    // Get trainer ID for recorded_by field
    const trainer = db
      .prepare("SELECT trainer_id FROM Trainers WHERE email = ?")
      .get(user.email) as { trainer_id: number } | undefined;

    const recordedBy = trainer?.trainer_id || null;

    // Insert attendance record
    const stmt = db.prepare(`
      INSERT INTO attendance_records (
        participant_id,
        course_id,
        event_id,
        session_date,
        session_number,
        attended,
        check_in_time,
        notes,
        recorded_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING attendance_id
    `);

    const result = stmt.get(
      participantId,
      courseId || null,
      eventId || null,
      sessionDate,
      sessionNumber || null,
      attended,
      checkInTime || null,
      notes || null,
      recordedBy
    ) as { attendance_id: number };

    return NextResponse.json(
      { attendanceId: result.attendance_id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { error: "Fehler beim Erfassen der Anwesenheit" },
      { status: 500 }
    );
  }
}
