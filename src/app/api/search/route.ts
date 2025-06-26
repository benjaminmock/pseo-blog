import { NextResponse } from "next/server";
import { db } from "@/config";

type SearchResult = {
  id: number;
  slug: string;
  title: string;
  city: string;
  state: string;
  zip: string;
  type: "city" | "course" | "event";
  sort_priority: number;
};

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

    // Create the different LIKE patterns for prioritized matching
    const exactPattern = sanitizedQuery;
    const startsWithPattern = `${sanitizedQuery}%`;
    const containsPattern = `%${sanitizedQuery}%`;

    // Search for cities
    const cityStmt = db.prepare(`
      SELECT
        id,
        slug,
        city as title,
        city,
        state,
        zip,
        'city' as type,
        population as sort_priority
      FROM cities
      WHERE city LIKE ? OR title LIKE ?
      ORDER BY
        CASE
          WHEN city LIKE ? THEN 1  -- Exact match
          WHEN city LIKE ? THEN 2  -- Starts with
          ELSE 3                   -- Contains
        END,
        population DESC            -- Larger cities first
      LIMIT 5
    `);

    // Search for courses
    const courseStmt = db.prepare(`
      SELECT
        course_id as id,
        slug,
        course_name as title,
        city_slug as city,
        '' as state,
        '' as zip,
        'course' as type,
        1 as sort_priority
      FROM Courses
      WHERE active = 1 AND (course_name LIKE ? OR description LIKE ?)
      ORDER BY
        CASE
          WHEN course_name LIKE ? THEN 1  -- Exact match
          WHEN course_name LIKE ? THEN 2  -- Starts with
          ELSE 3                          -- Contains
        END
      LIMIT 5
    `);

    // Search for events
    const eventStmt = db.prepare(`
      SELECT
        event_id as id,
        slug,
        event_name as title,
        city_slug as city,
        '' as state,
        '' as zip,
        'event' as type,
        2 as sort_priority
      FROM Events
      WHERE active = 1 AND (event_name LIKE ? OR description LIKE ?)
      ORDER BY
        CASE
          WHEN event_name LIKE ? THEN 1  -- Exact match
          WHEN event_name LIKE ? THEN 2  -- Starts with
          ELSE 3                         -- Contains
        END
      LIMIT 5
    `);

    // Execute all searches
    const cityResults = cityStmt.all(
      containsPattern,
      containsPattern,
      exactPattern,
      startsWithPattern
    ) as SearchResult[];

    const courseResults = courseStmt.all(
      containsPattern,
      containsPattern,
      exactPattern,
      startsWithPattern
    ) as SearchResult[];

    const eventResults = eventStmt.all(
      containsPattern,
      containsPattern,
      exactPattern,
      startsWithPattern
    ) as SearchResult[];

    // Combine and sort results by type priority and relevance
    const allResults = [...cityResults, ...courseResults, ...eventResults]
      .sort((a: SearchResult, b: SearchResult) => {
        // First sort by type priority (cities first, then events, then courses)
        if (a.sort_priority !== b.sort_priority) {
          return b.sort_priority - a.sort_priority;
        }
        // Then by relevance (exact matches first)
        return 0;
      })
      .slice(0, 10); // Limit total results to 10

    // Return the matching results as a JSON response
    return NextResponse.json({ results: allResults });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
