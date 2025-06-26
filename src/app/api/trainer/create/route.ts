import { NextResponse } from "next/server";
import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";

// Function to generate a unique slug for a trainer
function generateTrainerSlug(
  firstName: string,
  lastName: string,
  trainerId?: number
): string {
  // Create base slug from first and last name
  const baseSlug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`
    .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric chars with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  // Check if this slug already exists
  const checkSlugStmt = db.prepare(
    "SELECT trainer_id FROM Trainers WHERE slug = ? AND trainer_id != ?"
  );
  const existingTrainer = checkSlugStmt.get(baseSlug, trainerId || 0) as
    | { trainer_id: number }
    | undefined;

  if (!existingTrainer) {
    return baseSlug;
  }

  // If slug exists, append the trainer ID to make it unique
  return `${baseSlug}-${trainerId}`;
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a trainer profile
    const checkStmt = db.prepare(
      "SELECT trainer_id FROM Trainers WHERE email = ?"
    );
    const existingTrainer = checkStmt.get(currentUser.email) as
      | { trainer_id: number }
      | undefined;

    if (existingTrainer) {
      return NextResponse.json(
        {
          message: "You already have a trainer profile",
          trainer_id: existingTrainer.trainer_id,
        },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { first_name, last_name, phone_number, bio, link } = data;

    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json(
        { message: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Insert new trainer record first to get the ID
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
      RETURNING trainer_id
    `);

    const result = insertStmt.get(
      first_name,
      last_name,
      currentUser.email,
      phone_number || null,
      bio || null,
      link || null
    ) as { trainer_id: number };

    // Generate and update the slug
    const slug = generateTrainerSlug(first_name, last_name, result.trainer_id);
    const updateSlugStmt = db.prepare(
      "UPDATE Trainers SET slug = ? WHERE trainer_id = ?"
    );
    updateSlugStmt.run(slug, result.trainer_id);

    return NextResponse.json(
      {
        message: "Trainer profile created successfully",
        trainer_id: result.trainer_id,
        slug: slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating trainer profile:", error);
    return NextResponse.json(
      { message: "Failed to create trainer profile" },
      { status: 500 }
    );
  }
}
