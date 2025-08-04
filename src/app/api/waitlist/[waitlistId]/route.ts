import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { waitlistId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const waitlistId = parseInt(params.waitlistId);

    if (isNaN(waitlistId)) {
      return NextResponse.json(
        { error: "Ungültige Wartelisten-ID" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { status, expiresAt, notes } = data;

    // Check if waitlist entry exists
    const existingEntry = db
      .prepare(
        "SELECT waitlist_id, participant_id, course_id, event_id, status FROM participant_waitlist WHERE waitlist_id = ?"
      )
      .get(waitlistId) as
      | {
          waitlist_id: number;
          participant_id: number;
          course_id: number | null;
          event_id: number | null;
          status: string;
        }
      | undefined;

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Wartelisten-Eintrag nicht gefunden" },
        { status: 404 }
      );
    }

    // If status is changing to "accepted", create enrollment/registration
    if (status === "accepted" && existingEntry.status === "offered") {
      if (existingEntry.course_id) {
        // Check if course still has capacity
        const course = db
          .prepare(
            "SELECT max_capacity, current_enrollments FROM Courses WHERE course_id = ?"
          )
          .get(existingEntry.course_id) as {
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

        // Get trainer ID
        const trainer = db
          .prepare("SELECT trainer_id FROM Trainers WHERE email = ?")
          .get(user.email) as { trainer_id: number } | undefined;

        // Create enrollment
        const enrollmentStmt = db.prepare(`
          INSERT INTO course_enrollments (
            participant_id,
            course_id,
            status,
            payment_status,
            enrolled_by
          )
          VALUES (?, ?, 'active', 'pending', ?)
          RETURNING enrollment_id
        `);

        enrollmentStmt.get(
          existingEntry.participant_id,
          existingEntry.course_id,
          trainer?.trainer_id || null
        );

        // Update course enrollment count
        const updateCourseStmt = db.prepare(`
          UPDATE Courses 
          SET current_enrollments = current_enrollments + 1 
          WHERE course_id = ?
        `);
        updateCourseStmt.run(existingEntry.course_id);
      }

      if (existingEntry.event_id) {
        // Check if event still has capacity
        const event = db
          .prepare(
            "SELECT max_participants, current_registrations FROM Events WHERE event_id = ?"
          )
          .get(existingEntry.event_id) as {
          max_participants: number | null;
          current_registrations: number;
        };

        if (
          event.max_participants &&
          event.current_registrations >= event.max_participants
        ) {
          return NextResponse.json(
            { error: "Event ist bereits ausgebucht" },
            { status: 409 }
          );
        }

        // Get trainer ID
        const trainer = db
          .prepare("SELECT trainer_id FROM Trainers WHERE email = ?")
          .get(user.email) as { trainer_id: number } | undefined;

        // Create registration
        const registrationStmt = db.prepare(`
          INSERT INTO event_registrations (
            participant_id,
            event_id,
            status,
            payment_status,
            registered_by
          )
          VALUES (?, ?, 'registered', 'pending', ?)
          RETURNING registration_id
        `);

        registrationStmt.get(
          existingEntry.participant_id,
          existingEntry.event_id,
          trainer?.trainer_id || null
        );

        // Update event registration count
        const updateEventStmt = db.prepare(`
          UPDATE Events 
          SET current_registrations = current_registrations + 1 
          WHERE event_id = ?
        `);
        updateEventStmt.run(existingEntry.event_id);
      }
    }

    // Update waitlist entry
    const stmt = db.prepare(`
      UPDATE participant_waitlist SET
        status = ?,
        expires_at = ?,
        notes = ?,
        notified_at = CASE WHEN status != 'offered' AND ? = 'offered' THEN CURRENT_TIMESTAMP ELSE notified_at END
      WHERE waitlist_id = ?
    `);

    stmt.run(status, expiresAt || null, notes || null, status, waitlistId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating waitlist entry:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Wartelisten-Eintrags" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { waitlistId: string } }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const waitlistId = parseInt(params.waitlistId);

    if (isNaN(waitlistId)) {
      return NextResponse.json(
        { error: "Ungültige Wartelisten-ID" },
        { status: 400 }
      );
    }

    // Check if waitlist entry exists
    const existingEntry = db
      .prepare(
        "SELECT waitlist_id, course_id, event_id, position FROM participant_waitlist WHERE waitlist_id = ?"
      )
      .get(waitlistId) as
      | {
          waitlist_id: number;
          course_id: number | null;
          event_id: number | null;
          position: number;
        }
      | undefined;

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Wartelisten-Eintrag nicht gefunden" },
        { status: 404 }
      );
    }

    // Delete waitlist entry
    const deleteStmt = db.prepare(
      "DELETE FROM participant_waitlist WHERE waitlist_id = ?"
    );
    deleteStmt.run(waitlistId);

    // Update positions of remaining waitlist entries
    if (existingEntry.course_id) {
      const updatePositionsStmt = db.prepare(`
        UPDATE participant_waitlist 
        SET position = position - 1 
        WHERE course_id = ? AND position > ?
      `);
      updatePositionsStmt.run(existingEntry.course_id, existingEntry.position);
    }

    if (existingEntry.event_id) {
      const updatePositionsStmt = db.prepare(`
        UPDATE participant_waitlist 
        SET position = position - 1 
        WHERE event_id = ? AND position > ?
      `);
      updatePositionsStmt.run(existingEntry.event_id, existingEntry.position);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting waitlist entry:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Wartelisten-Eintrags" },
      { status: 500 }
    );
  }
}
