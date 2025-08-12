import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const {
      courseId,
      eventId,
      sessionDate,
      sessionNumber,
      attendanceRecords, // Array of { participantId, attended, checkInTime, notes }
    } = data;

    // Validate required fields
    if (
      !sessionDate ||
      !attendanceRecords ||
      !Array.isArray(attendanceRecords)
    ) {
      return NextResponse.json(
        { error: "Sitzungsdatum und Anwesenheitsdaten sind erforderlich" },
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

    // Get trainer ID for recorded_by field
    const trainer = db
      .prepare("SELECT trainer_id FROM Trainers WHERE email = ?")
      .get(user.email) as { trainer_id: number } | undefined;

    const recordedBy = trainer?.trainer_id || null;

    const results = [];
    const errors = [];

    // Process each attendance record
    for (const record of attendanceRecords) {
      const { participantId, attended, checkInTime, notes } = record;

      try {
        // Validate participant exists
        const participant = db
          .prepare(
            "SELECT participant_id FROM participants WHERE participant_id = ?"
          )
          .get(participantId);

        if (!participant) {
          errors.push(`Teilnehmer mit ID ${participantId} nicht gefunden`);
          continue;
        }

        // Check if participant is enrolled/registered
        if (courseId) {
          const enrollment = db
            .prepare(
              "SELECT enrollment_id FROM course_enrollments WHERE participant_id = ? AND course_id = ? AND status = 'active'"
            )
            .get(participantId, courseId);

          if (!enrollment) {
            errors.push(
              `Teilnehmer ${participantId} ist nicht für diesen Kurs angemeldet`
            );
            continue;
          }
        }

        if (eventId) {
          const registration = db
            .prepare(
              "SELECT registration_id FROM event_registrations WHERE participant_id = ? AND event_id = ? AND status = 'registered'"
            )
            .get(participantId, eventId);

          if (!registration) {
            errors.push(
              `Teilnehmer ${participantId} ist nicht für dieses Event angemeldet`
            );
            continue;
          }
        }

        // Check if attendance record already exists
        let existingCheck = "";
        const existingParams = [participantId, sessionDate];

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
          // Update existing record
          const updateStmt = db.prepare(`
            UPDATE attendance_records SET
              attended = ?,
              check_in_time = ?,
              notes = ?,
              recorded_by = ?
            WHERE attendance_id = ?
          `);

          updateStmt.run(
            attended,
            checkInTime || null,
            notes || null,
            recordedBy,
            (existingRecord as { attendance_id: number }).attendance_id
          );

          results.push({
            participantId,
            action: "updated",
            success: true,
          });
        } else {
          // Insert new record
          const insertStmt = db.prepare(`
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

          const result = insertStmt.get(
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

          results.push({
            participantId,
            attendanceId: result.attendance_id,
            action: "created",
            success: true,
          });
        }
      } catch (error) {
        errors.push(`Fehler bei Teilnehmer ${participantId}: ${error}`);
      }
    }

    return NextResponse.json({
      success: results.length,
      errors: errors.length,
      results,
      errorMessages: errors,
    });
  } catch (error) {
    console.error("Error bulk recording attendance:", error);
    return NextResponse.json(
      { error: "Fehler beim Massenerfassen der Anwesenheit" },
      { status: 500 }
    );
  }
}
