import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { db } from "@/config";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ein Benutzer mit dieser E-Mail existiert bereits" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["student", "teacher"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be either 'student' or 'teacher'" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role,
      },
    });

    // If user is a teacher, automatically create a trainer profile
    if (role === "teacher") {
      try {
        // Check if trainer profile already exists
        const checkStmt = db.prepare(
          "SELECT trainer_id FROM Trainers WHERE email = ?"
        );
        const existingTrainer = checkStmt.get(email) as
          | { trainer_id: number }
          | undefined;

        if (!existingTrainer) {
          // Create trainer profile
          const insertStmt = db.prepare(`
            INSERT INTO Trainers (
              first_name,
              last_name,
              email,
              phone_number,
              bio,
              link
            )
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          // Use name as first_name if provided, otherwise use email username
          const firstName = name ? name.split(" ")[0] : email.split("@")[0];
          // Use last part of name as last_name if provided
          const lastName =
            name && name.includes(" ")
              ? name.split(" ").slice(1).join(" ")
              : "";

          insertStmt.run(firstName, lastName, email, null, null, null);
        }
      } catch (trainerError) {
        console.error("Error creating trainer profile:", trainerError);
        // Continue even if trainer profile creation fails
        // The user is still created successfully
      }
    }

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten bei der Registrierung" },
      { status: 500 }
    );
  }
}
