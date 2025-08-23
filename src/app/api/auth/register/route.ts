import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";

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
        const existingTrainer = await prisma.trainer.findUnique({
          where: { email },
        });

        if (!existingTrainer) {
          // Create trainer profile
          const firstName = name ? name.split(" ")[0] : email.split("@")[0];
          const lastName =
            name && name.includes(" ")
              ? name.split(" ").slice(1).join(" ")
              : "";
          
          // Create slug from first and last name, ensure it's unique
          let baseSlug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(/\s+/g, "-");
          let slug = baseSlug;
          let counter = 1;
          
          // Check for existing slugs and make unique if necessary
          while (await prisma.trainer.findFirst({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          await prisma.trainer.create({
            data: {
              firstName,
              lastName,
              email,
              slug,
            },
          });

          console.log(`Created trainer profile for user: ${email} with slug: ${slug}`);
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
