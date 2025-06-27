import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

// Get the database path from environment or use default
const dbPath = process.env.DATABASE_URL || "yoga.db";

// Create the SQLite database connection
const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");

// Create the Drizzle database instance
export const db = drizzle(sqlite, { schema });

// Export the raw SQLite instance if needed
export { sqlite };

// Export schema for convenience
export * from "./schema";
