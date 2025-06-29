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
      event_name,
      trainer_id,
      description,
      start_date,
      start_time,
      city_slug,
      city_id,
      max_participants,
      price,
    } = data;

    // Validate required fields
    if (!event_name || !start_date) {
      return NextResponse.json(
        { error: "Event-Name und Startdatum sind erforderlich" },
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

    // Generate unique slug from event name
    let baseSlug = event_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    // Check if slug already exists and make it unique
    while (true) {
      const existingEvent = db
        .prepare(
          `
        SELECT event_id FROM Events WHERE slug = ?
      `
        )
        .get(slug);

      if (!existingEvent) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Insert event into database
    const stmt = db.prepare(`
      INSERT INTO Events (
        event_name,
        trainer_id,
        description,
        start_date,
        start_time,
        city_slug,
        slug,
        city_id,
        active,
        max_participants,
        price
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING event_id
    `);

    const result = stmt.get(
      event_name,
      trainer_id,
      description,
      start_date,
      start_time,
      city_slug,
      slug,
      city_id,
      1, // Set new events as active by default
      max_participants,
      price
    ) as { event_id: number };

    return NextResponse.json(
      {
        event_id: result.event_id,
        slug: slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Events" },
      { status: 500 }
    );
  }
}
