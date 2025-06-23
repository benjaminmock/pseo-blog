import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { course_id, active } = data;

    // Validate required fields
    if (!course_id || typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Kurs-ID und Status sind erforderlich" },
        { status: 400 }
      );
    }

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
        { error: "Trainer-Profil nicht gefunden" },
        { status: 404 }
      );
    }

    // Verify that the course exists and belongs to this trainer
    const courseStmt = db.prepare(`
      SELECT course_id
      FROM Courses
      WHERE course_id = ? AND trainer_id = ?
    `);
    const courseResult = courseStmt.get(course_id, trainerResult.trainer_id) as
      | { course_id: number }
      | undefined;

    if (!courseResult) {
      return NextResponse.json(
        { error: "Kurs nicht gefunden oder keine Berechtigung" },
        { status: 404 }
      );
    }

    // Update course active status
    const updateStmt = db.prepare(`
      UPDATE Courses SET active = ?
      WHERE course_id = ? AND trainer_id = ?
    `);

    updateStmt.run(active ? 1 : 0, course_id, trainerResult.trainer_id);

    return NextResponse.json(
      {
        success: true,
        message: active ? "Kurs aktiviert" : "Kurs deaktiviert",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating course status:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Kursstatus" },
      { status: 500 }
    );
  }
}
