import { db } from "@/config";
import { NextResponse } from "next/server";

function getMainEventImage(eventId: number): string | null {
  try {
    // Try to get main image first
    const mainImageStmt = db.prepare(`
      SELECT f.url
      FROM event_images ei
      JOIN files f ON ei.file_id = f.id
      WHERE ei.event_id = ? AND ei.is_main = 1
      LIMIT 1
    `);
    
    const mainImage = mainImageStmt.get(eventId) as any;
    if (mainImage) {
      return mainImage.url;
    }

    // If no main image, get the first image
    const firstImageStmt = db.prepare(`
      SELECT f.url
      FROM event_images ei
      JOIN files f ON ei.file_id = f.id
      WHERE ei.event_id = ?
      ORDER BY ei.sort_order ASC
      LIMIT 1
    `);
    
    const firstImage = firstImageStmt.get(eventId) as any;
    return firstImage?.url || null;
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

    // Add main image for each event
    const eventsWithImages = events.map((event) => {
      const mainImageUrl = getMainEventImage(event.event_id);
      return {
        ...event,
        mainImageUrl,
      };
    });

    return NextResponse.json({ events: eventsWithImages });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Events" },
      { status: 500 }
    );
  }
}
