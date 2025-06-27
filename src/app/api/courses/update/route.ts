import { db, trainers, courses } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

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
    const trainerResult = await db
      .select({ trainerId: trainers.trainerId })
      .from(trainers)
      .where(eq(trainers.email, user.email!))
      .limit(1);

    if (!trainerResult.length || trainerResult[0].trainerId !== trainer_id) {
      return NextResponse.json(
        { error: "Keine Berechtigung, diesen Kurs zu bearbeiten" },
        { status: 403 }
      );
    }

    // Verify that the course exists and belongs to this trainer
    const courseResult = await db
      .select({ courseId: courses.courseId })
      .from(courses)
      .where(
        and(eq(courses.courseId, course_id), eq(courses.trainerId, trainer_id))
      )
      .limit(1);

    if (!courseResult.length) {
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
    await db
      .update(courses)
      .set({
        courseName: course_name,
        description,
        startDate: start_date,
        endDate: end_date,
        citySlug: city_slug,
        slug,
        cityId: city_id,
        capacity,
        language,
        price,
        duration,
        location,
        style,
        level,
      })
      .where(
        and(eq(courses.courseId, course_id), eq(courses.trainerId, trainer_id))
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
