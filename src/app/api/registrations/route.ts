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
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    const queryParams: (string | number)[] = [];

    if (eventId) {
      whereClause += " AND er.event_id = ?";
      queryParams.push(parseInt(eventId));
    }

    if (status) {
      whereClause += " AND er.status = ?";
      queryParams.push(status);
    }

    // Get registrations with participant and event details
    const registrationsStmt = db.prepare(`
      SELECT 
        er.registration_id,
        er.participant_id,
        er.event_id,
        er.registration_date,
        er.status,
        er.payment_status,
        er.total_amount,
        er.paid_amount,
        er.notes,
        er.registered_by,
        p.full_name,
        p.email,
        p.phone_number,
        e.event_name,
        e.start_date,
        e.start_time,
        e.end_date,
        e.end_time,
        t.first_name as trainer_first_name,
        t.last_name as trainer_last_name
      FROM event_registrations er
      JOIN participants p ON er.participant_id = p.participant_id
      JOIN Events e ON er.event_id = e.event_id
      LEFT JOIN Trainers t ON er.registered_by = t.trainer_id
      ${whereClause}
      ORDER BY er.registration_date DESC
      LIMIT ? OFFSET ?
    `);

    const registrations = registrationsStmt.all(...queryParams, limit, offset);

    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM event_registrations er
      ${whereClause}
    `);

    const countResult = countStmt.get(...queryParams) as { count: number };
    const totalCount = countResult.count;

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Anmeldungen" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  // Allow both teachers and students to register for events
  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { participantId, eventId, totalAmount, paidAmount = 0, notes } = data;

    // Validate required fields
    if (!participantId || !eventId) {
      return NextResponse.json(
        { error: "Teilnehmer-ID und Event-ID sind erforderlich" },
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

    // Check if event exists
    const event = db
      .prepare(
        "SELECT event_id, max_participants, current_registrations FROM Events WHERE event_id = ? AND active = 1"
      )
      .get(eventId) as {
      event_id: number;
      max_participants: number | null;
      current_registrations: number;
    };

    if (!event) {
      return NextResponse.json(
        { error: "Event nicht gefunden oder nicht aktiv" },
        { status: 404 }
      );
    }

    // Check if participant is already registered
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

    // Check capacity
    if (
      event.max_participants &&
      event.current_registrations >= event.max_participants
    ) {
      return NextResponse.json(
        { error: "Event ist bereits ausgebucht" },
        { status: 409 }
      );
    }

    // Get trainer ID for registered_by field (only if user is teacher)
    let registeredBy = null;
    if (user.role === "teacher") {
      const trainer = db
        .prepare("SELECT trainer_id FROM Trainers WHERE email = ?")
        .get(user.email) as { trainer_id: number } | undefined;
      registeredBy = trainer?.trainer_id || null;
    }

    // Determine payment status
    let paymentStatus = "pending";
    if (paidAmount > 0) {
      if (totalAmount && paidAmount >= totalAmount) {
        paymentStatus = "paid";
      } else {
        paymentStatus = "partial";
      }
    }

    // Insert registration
    const stmt = db.prepare(`
      INSERT INTO event_registrations (
        participant_id,
        event_id,
        status,
        payment_status,
        total_amount,
        paid_amount,
        notes,
        registered_by
      )
      VALUES (?, ?, 'registered', ?, ?, ?, ?, ?)
      RETURNING registration_id
    `);

    const result = stmt.get(
      participantId,
      eventId,
      paymentStatus,
      totalAmount,
      paidAmount,
      notes,
      registeredBy
    ) as { registration_id: number };

    // Update event registration count
    const updateEventStmt = db.prepare(`
      UPDATE Events 
      SET current_registrations = current_registrations + 1 
      WHERE event_id = ?
    `);
    updateEventStmt.run(eventId);

    return NextResponse.json(
      { registrationId: result.registration_id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Anmeldung" },
      { status: 500 }
    );
  }
}
