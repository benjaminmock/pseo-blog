const Database = require("better-sqlite3");
const db = new Database("content.db");

// Initialize table for Markdown posts
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    meta_description TEXT,
    content TEXT,
    slug TEXT UNIQUE
  )
`);

module.exports = db;
