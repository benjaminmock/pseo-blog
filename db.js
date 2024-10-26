const Database = require("better-sqlite3");
const db = new Database("content.db");

// Initialize table for Markdown topics
db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    meta_description TEXT,
    content TEXT,
    slug TEXT UNIQUE
  )
`);

// db.exec(`
//   CREATE TABLE IF NOT EXISTS faqs (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT,
//     content TEXT
//   )
// `);

module.exports = db;
