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
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    let queryParams: (string | number)[] = [];

    if (courseId) {
      whereClause += " AND pw.course_id = ?";
      queryParams.push(parseInt(courseId));
    }

    if (eventId) {
      whereClause += " AND pw.event_id = ?";
      queryParams.push(parseInt(eventId));
    }

    if (status) {
      whereClause += " AND pw.status = ?";
      queryParams.push(status);
    }

    // Get waitlist entries with participant and course/event details
    const waitlistStmt = db.prepare(`
      SELECT 
        pw.waitlist_id,
        pw.participant_id,
        pw.course_id,
        pw.event_id,
        pw.position,
        pw.added_at,
        pw.notified_at,
        pw.status,
        pw.expires_at,
        pw.notes,
        p.full_name,
        p.email,
        p.phone_number,
        c.course_name,
        c.start_date as course_start_date,
        e.event_name,
        e.start_date as event_start_date
      FROM participant_waitlist pw
      JOIN participants p ON pw.participant_id = p.participant_id
      LEFT JOIN Courses c ON pw.course_id = c.course_id
      LEFT JOIN Events e ON pw.event_id = e.event_id
      ${whereClause}
      ORDER BY pw.course_id, pw.event_id, pw.position ASC
      LIMIT ? OFFSET ?
    `);

    const waitlist = waitlistStmt.all(...queryParams, limit, offset);

    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM participant_waitlist pw
      ${whereClause}
    `);

    const countResult = countStmt.get(...queryParams) as { count: number };
    const totalCount = countResult.count;

    return NextResponse.json({
      waitlist,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Warteliste" },
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
    const { participantId, courseId, eventId, notes } = data;

    // Validate required fields
    if (!participantId || (!courseId && !eventId)) {
      return NextResponse.json(
        { error: "Teilnehmer-ID und Kurs-ID oder Event-ID sind erforderlich" },
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

    // Check if course or event exists and has waitlist enabled
    if (courseId) {
      const course = db
        .prepare(
          "SELECT course_id, waitlist_enabled FROM Courses WHERE course_id = ? AND active = 1"
        )
        .get(courseId) as
        | { course_id: number; waitlist_enabled: number }
        | undefined;

      if (!course) {
        return NextResponse.json(
          { error: "Kurs nicht gefunden oder nicht aktiv" },
          { status: 404 }
        );
      }

      if (!course.waitlist_enabled) {
        return NextResponse.json(
          { error: "Warteliste ist für diesen Kurs nicht aktiviert" },
          { status: 400 }
        );
      }

      // Check if participant is already enrolled or on waitlist
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

      const existingWaitlist = db
        .prepare(
          "SELECT waitlist_id FROM participant_waitlist WHERE participant_id = ? AND course_id = ? AND status = 'waiting'"
        )
        .get(participantId, courseId);

      if (existingWaitlist) {
        return NextResponse.json(
          {
            error:
              "Teilnehmer steht bereits auf der Warteliste für diesen Kurs",
          },
          { status: 409 }
        );
      }
    }

    if (eventId) {
      const event = db
        .prepare(
          "SELECT event_id, waitlist_enabled FROM Events WHERE event_id = ? AND active = 1"
        )
        .get(eventId) as
        | { event_id: number; waitlist_enabled: number }
        | undefined;

      if (!event) {
        return NextResponse.json(
          { error: "Event nicht gefunden oder nicht aktiv" },
          { status: 404 }
        );
      }

      if (!event.waitlist_enabled) {
        return NextResponse.json(
          { error: "Warteliste ist für dieses Event nicht aktiviert" },
          { status: 400 }
        );
      }

      // Check if participant is already registered or on waitlist
      const existingRegistration = db
        .prepare(
          "SELECT registration_id FROM event_registrations WHERE participant_id = ? AND event_id = ?"
        )
        .get(participantId, eventId);

      if (existingRegistration) {
        return NextResponse.json(
          { error: "Teilnehmer ist bereits für dieses Event angemeldet" },
          { status: 409 }
        );
      }

      const existingWaitlist = db
        .prepare(
          "SELECT waitlist_id FROM participant_waitlist WHERE participant_id = ? AND event_id = ? AND status = 'waiting'"
        )
        .get(participantId, eventId);

      if (existingWaitlist) {
        return NextResponse.json(
          {
            error:
              "Teilnehmer steht bereits auf der Warteliste für dieses Event",
          },
          { status: 409 }
        );
      }
    }

    // Get next position in waitlist
    let positionQuery = "";
    let positionParams = [];

    if (courseId) {
      positionQuery =
        "SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM participant_waitlist WHERE course_id = ?";
      positionParams = [courseId];
    } else {
      positionQuery =
        "SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM participant_waitlist WHERE event_id = ?";
      positionParams = [eventId];
    }

    const positionResult = db.prepare(positionQuery).get(...positionParams) as {
      next_position: number;
    };
    const position = positionResult.next_position;

    // Insert waitlist entry
    const stmt = db.prepare(`
      INSERT INTO participant_waitlist (
        participant_id,
        course_id,
        event_id,
        position,
        status,
        notes
      )
      VALUES (?, ?, ?, ?, 'waiting', ?)
      RETURNING waitlist_id
    `);

    const result = stmt.get(
      participantId,
      courseId || null,
      eventId || null,
      position,
      notes || null
    ) as { waitlist_id: number };

    return NextResponse.json(
      {
        waitlistId: result.waitlist_id,
        position: position,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    return NextResponse.json(
      { error: "Fehler beim Hinzufügen zur Warteliste" },
      { status: 500 }
    );
  }
}
