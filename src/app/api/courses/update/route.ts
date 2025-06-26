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
    const {
      course_id,
      course_name,
      trainer_id,
      description,
      start_date,
      end_date,
      city_slug,
      city_id,
      capacity,
      language,
      price,
      duration,
      location,
      style,
      level,
    } = data;

    // Validate required fields
    if (!course_id || !course_name || !start_date) {
      return NextResponse.json(
        { error: "Kurs-ID, Kursname und Startdatum sind erforderlich" },
        { status: 400 }
      );
    }

    // Ensure trainer_id is valid
    if (!trainer_id) {
      return NextResponse.json(
        { error: "Trainer-ID konnte nicht ermittelt werden" },
        { status: 400 }
      );
    }

    // Verify that the course belongs to the current user's trainer profile
    const trainerStmt = db.prepare(`
      SELECT trainer_id
      FROM Trainers
      WHERE email = ?
    `);
    const trainerResult = trainerStmt.get(user.email) as
      | { trainer_id: number }
      | undefined;

    if (!trainerResult || trainerResult.trainer_id !== trainer_id) {
      return NextResponse.json(
        { error: "Keine Berechtigung, diesen Kurs zu bearbeiten" },
        { status: 403 }
      );
    }

    // Verify that the course exists and belongs to this trainer
    const courseStmt = db.prepare(`
      SELECT course_id
      FROM Courses
      WHERE course_id = ? AND trainer_id = ?
    `);
    const courseResult = courseStmt.get(course_id, trainer_id) as
      | { course_id: number }
      | undefined;

    if (!courseResult) {
      return NextResponse.json(
        { error: "Kurs nicht gefunden oder keine Berechtigung" },
        { status: 404 }
      );
    }

    // Generate slug from course name
    const slug = course_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Update course in database
    const updateStmt = db.prepare(`
      UPDATE Courses SET
        course_name = ?,
        description = ?,
        start_date = ?,
        end_date = ?,
        city_slug = ?,
        slug = ?,
        city_id = ?,
        capacity = ?,
        language = ?,
        price = ?,
        duration = ?,
        location = ?,
        style = ?,
        level = ?
      WHERE course_id = ? AND trainer_id = ?
    `);

    updateStmt.run(
      course_name,
      description,
      start_date,
      end_date,
      city_slug,
      slug,
      city_id,
      capacity,
      language,
      price,
      duration,
      location,
      style,
      level,
      course_id,
      trainer_id
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Kurses" },
      { status: 500 }
    );
  }
}
