import { NextResponse } from "next/server";
import { db, trainers } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

// Function to generate a unique slug for a trainer
async function generateTrainerSlug(
  firstName: string,
  lastName: string,
  trainerId?: number
): Promise<string> {
  // Create base slug from first and last name
  const baseSlug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`
    .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric chars with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  // Check if this slug already exists
  const existingTrainer = await db
    .select({ trainerId: trainers.trainerId })
    .from(trainers)
    .where(eq(trainers.slug, baseSlug))
    .limit(1);

  if (
    existingTrainer.length === 0 ||
    existingTrainer[0].trainerId === trainerId
  ) {
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
    const existingTrainer = await db
      .select({ trainerId: trainers.trainerId })
      .from(trainers)
      .where(eq(trainers.email, currentUser.email!))
      .limit(1);

    if (existingTrainer.length > 0) {
      return NextResponse.json(
        {
          message: "You already have a trainer profile",
          trainer_id: existingTrainer[0].trainerId,
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
    const result = await db
      .insert(trainers)
      .values({
        firstName: first_name,
        lastName: last_name,
        email: currentUser.email!,
        phoneNumber: phone_number || null,
        bio: bio || null,
        link: link || null,
      })
      .returning({ trainerId: trainers.trainerId });

    const trainerId = result[0].trainerId;

    // Generate and update the slug
    const slug = await generateTrainerSlug(first_name, last_name, trainerId);
    await db
      .update(trainers)
      .set({ slug })
      .where(eq(trainers.trainerId, trainerId));

    return NextResponse.json(
      {
        message: "Trainer profile created successfully",
        trainer_id: trainerId,
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
