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
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    // Build the WHERE clause for search
    let whereClause = "";
    let searchParams_sql: string[] = [];
    if (search) {
      whereClause =
        "WHERE (full_name LIKE ? OR email LIKE ? OR phone_number LIKE ?)";
      searchParams_sql = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    // Build the ORDER BY clause
    const validSortColumns = ["full_name", "email", "created_at"];
    const sortColumn = validSortColumns.includes(sortBy)
      ? sortBy
      : "created_at";
    const sortDirection = sortOrder === "asc" ? "ASC" : "DESC";

    // Get participants with pagination
    const participantsStmt = db.prepare(`
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
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?
    `);

    const rawParticipants = participantsStmt.all(
      ...searchParams_sql,
      limit,
      offset
    ) as {
      participant_id: number;
      user_id: number | null;
      full_name: string;
      email: string;
      phone_number: string | null;
      emergency_contact: string | null;
      emergency_phone: string | null;
      medical_notes: string | null;
      date_of_birth: string | null;
      address: string | null;
      city: string | null;
      postal_code: string | null;
      created_at: string;
      updated_at: string;
    }[];

    // Transform snake_case database fields to camelCase for frontend
    const participants = rawParticipants.map((p) => ({
      participantId: p.participant_id,
      userId: p.user_id,
      fullName: p.full_name,
      email: p.email,
      phone: p.phone_number,
      emergencyContact: p.emergency_contact,
      emergencyPhone: p.emergency_phone,
      medicalNotes: p.medical_notes,
      dateOfBirth: p.date_of_birth,
      address: p.address,
      city: p.city,
      postalCode: p.postal_code,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    // Get total count for pagination
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM participants
      ${whereClause}
    `);

    const countResult = countStmt.get(...searchParams_sql) as { count: number };
    const totalCount = countResult.count;

    return NextResponse.json({
      participants,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Teilnehmer" },
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
      userId,
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

    // Check if participant with this email already exists
    const existingParticipant = db
      .prepare("SELECT participant_id FROM participants WHERE email = ?")
      .get(email);

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Ein Teilnehmer mit dieser E-Mail-Adresse existiert bereits" },
        { status: 409 }
      );
    }

    // Insert participant into database
    const stmt = db.prepare(`
      INSERT INTO participants (
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
        postal_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING participant_id
    `);

    const result = stmt.get(
      userId,
      fullName,
      email,
      phone,
      emergencyContact,
      emergencyPhone,
      medicalNotes,
      dateOfBirth,
      address,
      city,
      postalCode
    ) as { participant_id: number };

    return NextResponse.json(
      { participantId: result.participant_id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Teilnehmers" },
      { status: 500 }
    );
  }
}
