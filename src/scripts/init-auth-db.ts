const Database = require("better-sqlite3");

const db = new Database("./yoga.db");

const fs = require("fs");
const path = require("path");

const schemaPath = path.join(
  process.cwd(),
  "src/app/api/auth/db-schema.sql"
);
const schema = fs.readFileSync(schemaPath, "utf8");

// Split the schema into individual statements
const statements = schema
  .split(";")
  .map((s: string) => s.trim())
  .filter((s: string) => s.length > 0);

// Execute each statement
statements.forEach((statement: string) => {
  if (statement.length > 0) {
    db.exec(statement);
  }
});

console.log("Authentication tables created successfully!");
