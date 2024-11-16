import { NextResponse } from "next/server";
import { db } from "@/config";
import { sendDiscordNotification } from "@/lib/discord";

interface TrainerCourseRequestBody {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bio: string;
  link: string;
  course_name: string;
  description: string;
  start_date: string;
  end_date: string;
  city_slug: string;
}

export async function POST(req: Request) {
  try {
    const body: TrainerCourseRequestBody = await req.json();

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

    // Insert the trainer into the database
    const insertTrainer = db.prepare(`
      INSERT INTO trainers (first_name, last_name, email, phone_number, bio, link)
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
      INSERT INTO courses (course_name, trainer_id, description, start_date, end_date, city_slug)
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

    // Send Discord notification
    await sendDiscordNotification(
      `🎉 New Course/Trainer Added\n` +
      `Trainer: ${first_name} ${last_name}\n` +
      `Course: ${course_name}\n` +
      `City: ${city_slug}\n` +
      `Dates: ${start_date} - ${end_date}\n` +
      `Contact: ${email}${phone_number ? ` / ${phone_number}` : ''}`
    );

    return NextResponse.json(
      { message: "Trainer and course added successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add course/trainer error:", error);
    return NextResponse.json(
      { message: "Error adding trainer and course", error: error.message },
      { status: 500 }
    );
  }
}
