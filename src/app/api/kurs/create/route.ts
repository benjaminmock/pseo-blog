import { db, courses } from "@/lib/db";
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
      city_id,
      capacity,
      language,
      price,
      duration,
      location,
      style,
      level,
      is_online,
      is_in_person,
      online_url,
      online_platform,
      online_instructions,
    } = data;

    // Validate required fields
    if (!course_name || !start_date) {
      return NextResponse.json(
        { error: "Kursname und Startdatum sind erforderlich" },
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

    // Validate delivery mode flags
    const isOnline = is_online === 1 || is_online === "1";
    const isInPerson = is_in_person === 1 || is_in_person === "1";

    if (!isOnline && !isInPerson) {
      return NextResponse.json(
        { error: "Kurs muss mindestens eine Veranstaltungsart unterstützen" },
        { status: 400 }
      );
    }

    if (isOnline && !online_url) {
      return NextResponse.json(
        { error: "Online-URL ist für Online-Kurse erforderlich" },
        { status: 400 }
      );
    }

    if (isInPerson && (!city_slug || !city_id)) {
      return NextResponse.json(
        { error: "Standort ist für Präsenz-Kurse erforderlich" },
        { status: 400 }
      );
    }

    // Generate slug from course name
    const slug = course_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Insert course into database
    const result = await db
      .insert(courses)
      .values({
        courseName: course_name,
        trainerId: trainer_id,
        description,
        startDate: start_date,
        endDate: end_date,
        citySlug: city_slug,
        slug,
        cityId: city_id,
        active: 1, // Set new courses as active by default
        capacity,
        language,
        price,
        duration,
        location,
        style,
        level,
        isOnline: isOnline ? 1 : 0,
        isInPerson: isInPerson ? 1 : 0,
        onlineUrl: online_url || null,
        onlinePlatform: online_platform || null,
        onlineInstructions: online_instructions || null,
      })
      .returning({ courseId: courses.courseId });

    return NextResponse.json(
      { course_id: result[0].courseId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Kurses" },
      { status: 500 }
    );
  }
}
