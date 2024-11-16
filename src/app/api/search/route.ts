// /app/api/search/route.ts
import { NextResponse } from "next/server";
import { db } from "@/config";

export async function POST(req: Request) {
  // Parse the JSON body to retrieve the search query
  const { query } = await req.json();

  console.log("QUERY -------->");

  // If there's no query, return an empty result set
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // Prepare the SQL statement to search for cities with names that match the query
  const stmt = db.prepare(`
    SELECT * FROM cities
    WHERE city LIKE ?
    LIMIT 10
  `);
  console.log("QUERY -------->", query);

  console.log(query);

  // Execute the statement with a wildcard to allow partial matching
  const results = stmt.all(`%${query}%`);

  // Return the matching results as a JSON response
  return NextResponse.json({ results });
}
