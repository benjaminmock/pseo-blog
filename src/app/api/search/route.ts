import { NextResponse } from "next/server";
import { db } from "@/config";

export async function POST(req: Request) {
  try {
    // Parse the JSON body to retrieve the search query
    const { query } = await req.json();

    // If there's no query, return an empty result set
    if (!query || typeof query !== "string") {
      return NextResponse.json({ results: [] });
    }

    // Sanitize the query by removing any SQL injection attempts
    const sanitizedQuery = query.replace(/[^\w\s]/g, "").trim();

    if (!sanitizedQuery) {
      return NextResponse.json({ results: [] });
    }

    // Prepare the SQL statement to search for cities
    // Search in both city and title columns for better results
    const stmt = db.prepare(`
      SELECT id, slug, city, title, state, zip
      FROM cities
      WHERE city LIKE ? OR title LIKE ?
      ORDER BY 
        CASE 
          WHEN city LIKE ? THEN 1  -- Exact match
          WHEN city LIKE ? THEN 2  -- Starts with
          ELSE 3                   -- Contains
        END,
        population DESC            -- Larger cities first
      LIMIT 10
    `);

    // Create the different LIKE patterns for prioritized matching
    const exactPattern = sanitizedQuery;
    const startsWithPattern = `${sanitizedQuery}%`;
    const containsPattern = `%${sanitizedQuery}%`;

    // Execute the statement with the different patterns
    const results = stmt.all(
      containsPattern,
      containsPattern,
      exactPattern,
      startsWithPattern
    );

    // Return the matching results as a JSON response
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
