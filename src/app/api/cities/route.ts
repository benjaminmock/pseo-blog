import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const citiesData = await prisma.city.findMany({
      select: {
        id: true,
        city: true,
        zip: true,
        slug: true,
      },
      orderBy: {
        city: 'asc',
      },
    });

    return NextResponse.json(citiesData);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Städte" },
      { status: 500 }
    );
  }
}
