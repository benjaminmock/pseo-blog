import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
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

    const trainerId = trainerResult.trainer_id;
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Get active events in the future (events with active = 1 status and start_date >= today)
    const activeEventsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM Events
      WHERE trainer_id = ?
        AND active = 1
        AND start_date >= ?
    `);
    const activeEvents = activeEventsStmt.get(trainerId, currentDate) as {
      count: number;
    };

    // Get total registrations for all trainer's active events
    // Note: Assuming there's an event_registrations table similar to course_enrollments
    const totalRegistrationsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM event_registrations er
      JOIN Events e ON er.event_id = e.event_id
      WHERE e.trainer_id = ?
        AND e.active = 1
        AND er.status = 'active'
    `);
    let totalRegistrations = { count: 0 };
    try {
      totalRegistrations = totalRegistrationsStmt.get(trainerId) as {
        count: number;
      };
    } catch {
      // If event_registrations table doesn't exist, default to 0
      console.log("event_registrations table not found, defaulting to 0");
    }

    // Get upcoming events (active events that haven't started yet)
    const upcomingEventsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM Events
      WHERE trainer_id = ?
        AND active = 1
        AND start_date > ?
    `);
    const upcomingEvents = upcomingEventsStmt.get(trainerId, currentDate) as {
      count: number;
    };

    // Get completed events (active events that have ended)
    const completedEventsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM Events
      WHERE trainer_id = ?
        AND active = 1
        AND start_date < ?
    `);
    const completedEvents = completedEventsStmt.get(trainerId, currentDate) as {
      count: number;
    };

    const stats = {
      activeEvents: activeEvents.count,
      totalRegistrations: totalRegistrations.count,
      upcomingEvents: upcomingEvents.count,
      completedEvents: completedEvents.count,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching event stats:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Eventstatistiken" },
      { status: 500 }
    );
  }
}
