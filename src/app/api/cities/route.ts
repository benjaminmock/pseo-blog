import { db, cities } from "@/lib/db";
import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const citiesData = await db
      .select({
        id: cities.id,
        city: cities.city,
        zip: cities.zip,
        slug: cities.slug,
      })
      .from(cities)
      .orderBy(asc(cities.city));

    return NextResponse.json(citiesData);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Städte" },
      { status: 500 }
    );
  }
}
