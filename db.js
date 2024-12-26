// TODO remove this file
const Database = require("better-sqlite3");
const db = new Database("yoga.db");

// Initialize table for Markdown topics
// db.exec(`
//   CREATE TABLE IF NOT EXISTS topics (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT,
//     meta_description TEXT,
//     content TEXT,
//     slug TEXT UNIQUE
//   )
// `);

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    meta_description TEXT,
    content TEXT,
    city_slug TEXT,
    category_slug TEXT
  );
`);

// db.exec(`
//   CREATE TABLE IF NOT EXISTS faqs (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT,
//     content TEXT
//   )
// `);

// Insert dummy data into posts table with markdown content
db.exec(`
  INSERT INTO posts (title, meta_description, content, city_slug, category_slug)
  VALUES 
    (
      'Introduction to Yoga', 
      'Learn the basics of Yoga and its benefits.', 
      '# Yoga Basics\nYoga is a practice that brings **mind**, **body**, and **spirit** together. It combines physical postures, breathing exercises, and meditation to improve overall well-being.\n\n## Benefits\n- Increases flexibility\n- Reduces stress\n- Improves strength\n', 
      '24937-flensburg', 
      'yoga'
    ),
    (
      'Advanced Yoga Techniques', 
      'Explore advanced Yoga techniques for flexibility and strength.', 
      '# Advanced Yoga\nThis post covers advanced **Yoga poses** and sequences, helping practitioners deepen their practice.\n\n### Popular Advanced Poses\n1. Crow Pose (Bakasana)\n2. Firefly Pose (Tittibhasana)\n3. Handstand (Adho Mukha Vrksasana)\n', 
      '24937-flensburg', 
      'yoga'
    ),
    (
      'Zumba for Beginners', 
      'A beginner''s guide to Zumba.', 
      '# Zumba for Beginners\nGet started with Zumba and enjoy a fun workout set to energetic music!\n\n### What You''ll Learn\n- Basic steps\n- Keeping rhythm\n- Improving cardio fitness\n', 
      '24937-flensburg', 
      'zumba'
    ),
    (
      'Benefits of Zumba', 
      'Discover the health benefits of Zumba.', 
      '# Zumba Benefits\nZumba is a fantastic cardiovascular workout that **improves coordination** and **burns calories**.\n\n## Key Benefits\n- Burns calories\n- Boosts energy levels\n- Enhances mood\n', 
      '24937-flensburg', 
      'zumba'
    ),
    (
      'Pilates Core Workout', 
      'Strengthen your core with Pilates.', 
      '# Pilates Core Workout\nPilates focuses on **core stability**, **balance**, and **flexibility**.\n\n### Core Exercises\n- The Hundred\n- Roll-Up\n- Leg Circles\n', 
      '24937-flensburg', 
      'pilates'
    ),
    (
      'Pilates for Flexibility', 
      'Enhance flexibility through Pilates exercises.', 
      '# Pilates Flexibility\nThis post covers **Pilates movements** designed to improve flexibility and range of motion.\n\n### Flexibility Exercises\n- Spine Stretch\n- Forward Fold\n- Side Bend\n', 
      '24937-flensburg', 
      'pilates'
    );
`);

module.exports = db;

/*
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    slug TEXT
  );

INSERT INTO categories (title, slug) VALUES ("Yoga", "yoga");
INSERT INTO categories (title, slug) VALUES ("Zumba", "zumba");
INSERT INTO categories (title, slug) VALUES ("Pilates", "pilates");


CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  meta_description TEXT,
  content TEXT,
  city_slug TEXT,
  category_slug TEXT
);


*/
