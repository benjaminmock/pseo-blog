import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { course_id } = data;

    // Validate required fields
    if (!course_id) {
      return NextResponse.json(
        { error: "Kurs-ID ist erforderlich" },
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
      SELECT course_id, course_name
      FROM Courses
      WHERE course_id = ? AND trainer_id = ?
    `);
    const courseResult = courseStmt.get(course_id, trainerResult.trainer_id) as
      | { course_id: number; course_name: string }
      | undefined;

    if (!courseResult) {
      return NextResponse.json(
        { error: "Kurs nicht gefunden oder keine Berechtigung" },
        { status: 404 }
      );
    }

    // Delete the course
    const deleteStmt = db.prepare(`
      DELETE FROM Courses
      WHERE course_id = ? AND trainer_id = ?
    `);

    const result = deleteStmt.run(course_id, trainerResult.trainer_id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Kurs konnte nicht gelöscht werden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Kurs "${courseResult.course_name}" wurde erfolgreich gelöscht`,
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Kurses" },
      { status: 500 }
    );
  }
}
