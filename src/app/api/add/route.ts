import { NextResponse } from "next/server";
import Database from "better-sqlite3";

// Create a connection to your SQLite database
const db = new Database("./yoga.db");

export async function POST(req) {
  const body = await req.json();

  const {
    first_name,
    last_name,
    email,
    phone_number,
    bio,
    link,
    course_name,
    description,
    start_date,
    end_date,
    city_slug,
  } = body;

  try {
    // Insert the trainer into the database
    const insertTrainer = db.prepare(`
        INSERT INTO Trainers (first_name, last_name, email, phone_number, bio, link)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

    const trainerResult = insertTrainer.run(
      first_name,
      last_name,
      email,
      phone_number,
      bio,
      link
    );

    // Insert the course into the database and link it to the trainer
    const insertCourse = db.prepare(`
        INSERT INTO Courses (course_name, trainer_id, description, start_date, end_date, city_slug)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

    insertCourse.run(
      course_name,
      trainerResult.lastInsertRowid,
      description,
      start_date,
      end_date,
      city_slug
    );

    return NextResponse.json(
      { message: "Trainer and course added successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error adding trainer and course", error: error.message },
      { status: 500 }
    );
  }
}
