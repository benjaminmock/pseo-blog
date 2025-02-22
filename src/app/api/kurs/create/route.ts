import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const {
      course_name,
      trainer_id,
      description,
      start_date,
      end_date,
      city_slug,
    } = data;

    // Validate required fields
    if (!course_name || !trainer_id || !start_date) {
      return NextResponse.json(
        { error: "Kursname, Trainer und Startdatum sind erforderlich" },
        { status: 400 }
      );
    }

    // Generate slug from course name
    const slug = course_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Insert course into database
    const stmt = db.prepare(`
      INSERT INTO Courses (
        course_name,
        trainer_id,
        description,
        start_date,
        end_date,
        city_slug,
        slug
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING course_id
    `);

    const result = stmt.get(
      course_name,
      trainer_id,
      description,
      start_date,
      end_date,
      city_slug,
      slug
    ) as { course_id: number };

    return NextResponse.json({ course_id: result.course_id }, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Kurses" },
      { status: 500 }
    );
  }
}
