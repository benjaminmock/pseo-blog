const Database = require("better-sqlite3");

const db = new Database("./yoga.db");

// Assuming db is an existing database connection
const createTables = () => {
  // SQL for creating the Trainers table
  const createTrainersTable = `
      CREATE TABLE IF NOT EXISTS Trainers (
        trainer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone_number TEXT,
        bio TEXT,
        link TEXT
      );
    `;

  // SQL for creating the Courses table
  const createCoursesTable = `
      CREATE TABLE IF NOT EXISTS Courses (
        course_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_name TEXT NOT NULL,
        trainer_id INTEGER NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT,
        city_slug TEXT,
        FOREIGN KEY(trainer_id) REFERENCES Trainers(trainer_id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

  // Optional: SQL for creating the Enrollments table
  //   const createEnrollmentsTable = `
  //       CREATE TABLE IF NOT EXISTS Enrollments (
  //         enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  //         user_id INTEGER,
  //         course_id INTEGER NOT NULL,
  //         enrollment_date TEXT NOT NULL,
  //         FOREIGN KEY(course_id) REFERENCES Courses(course_id) ON DELETE CASCADE ON UPDATE CASCADE
  //       );
  //     `;

  // Execute the SQL to create the Trainers table
  db.exec(createTrainersTable, (err) => {
    if (err) {
      return console.error("Error creating Trainers table:", err.message);
    }
    console.log("Trainers table created or already exists.");
  });

  // Execute the SQL to create the Courses table
  db.exec(createCoursesTable, (err) => {
    if (err) {
      return console.error("Error creating Courses table:", err.message);
    }
    console.log("Courses table created or already exists.");
  });
};

// Call the function to create the tables
createTables();
