import { NextResponse } from "next/server";
import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";

// Function to generate a unique slug for a trainer
function generateTrainerSlug(
  firstName: string,
  lastName: string,
  trainerId: number
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
  const existingTrainer = checkSlugStmt.get(baseSlug, trainerId) as
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

    const data = await request.json();
    const { trainer_id, first_name, last_name, phone_number, bio, link } = data;

    // Verify the user is updating their own profile
    const stmt = db.prepare("SELECT email FROM Trainers WHERE trainer_id = ?");
    const trainer = stmt.get(trainer_id) as { email: string } | undefined;

    if (!trainer || trainer.email !== currentUser.email) {
      return NextResponse.json(
        { message: "You can only update your own profile" },
        { status: 403 }
      );
    }

    // Check if names have changed to regenerate slug
    const currentTrainerStmt = db.prepare(
      "SELECT first_name, last_name FROM Trainers WHERE trainer_id = ?"
    );
    const currentTrainer = currentTrainerStmt.get(trainer_id) as
      | { first_name: string; last_name: string }
      | undefined;

    let newSlug = null;
    if (
      currentTrainer &&
      (currentTrainer.first_name !== first_name ||
        currentTrainer.last_name !== last_name)
    ) {
      newSlug = generateTrainerSlug(first_name, last_name, trainer_id);
    }

    // Update trainer information
    const updateStmt = db.prepare(`
      UPDATE Trainers
      SET
        first_name = ?,
        last_name = ?,
        phone_number = ?,
        bio = ?,
        link = ?,
        slug = COALESCE(?, slug)
      WHERE trainer_id = ?
    `);

    updateStmt.run(
      first_name,
      last_name,
      phone_number || null,
      bio || null,
      link || null,
      newSlug,
      trainer_id
    );

    const response: { message: string; newSlug?: string } = {
      message: "Trainer information updated successfully",
    };
    if (newSlug) {
      response.newSlug = newSlug;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error updating trainer:", error);
    return NextResponse.json(
      { message: "Failed to update trainer information" },
      { status: 500 }
    );
  }
}
