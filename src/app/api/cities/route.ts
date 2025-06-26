import { db } from "@/config";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stmt = db.prepare(`
      SELECT id, city, zip, slug
      FROM cities
      ORDER BY city ASC
    `);

    const cities = stmt.all();

    return NextResponse.json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Städte" },
      { status: 500 }
    );
  }
}
