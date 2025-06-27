import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index";

export async function runMigrations() {
  try {
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: "./src/lib/db/migrations" });
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
