import { db } from "@/config";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getMainEventImage(eventId: number): Promise<string | null> {
  try {
    const mainImage = await prisma.eventImage.findFirst({
      where: {
        eventId,
        isMain: true
      },
      include: { file: true },
    });

    if (mainImage) {
      return mainImage.file.url;
    }

    // If no main image, get the first image
    const firstImage = await prisma.eventImage.findFirst({
      where: { eventId },
      include: { file: true },
      orderBy: { sortOrder: "asc" },
    });

    return firstImage?.file.url || null;
  } catch (error) {
    console.error("Failed to fetch main event image:", error);
    return null;
  }
}

export async function GET() {
  try {
    // Get all active events with trainer information
    const eventsStmt = db.prepare(`
      SELECT
        e.event_id,
        e.event_name,
        e.description,
        e.start_date,
        e.start_time,
        e.city_slug,
        e.slug,
        e.max_participants,
        e.price,
        t.first_name,
        t.last_name,
        t.bio as trainer_bio
      FROM Events e
      JOIN Trainers t ON e.trainer_id = t.trainer_id
      WHERE e.active = 1
      ORDER BY e.start_date ASC
    `);

    const events = eventsStmt.all() as any[];

    // Fetch main image for each event
    const eventsWithImages = await Promise.all(
      events.map(async (event) => {
        const mainImageUrl = await getMainEventImage(event.event_id);
        return {
          ...event,
          mainImageUrl,
        };
      })
    );

    return NextResponse.json({ events: eventsWithImages });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Events" },
      { status: 500 }
    );
  }
}
