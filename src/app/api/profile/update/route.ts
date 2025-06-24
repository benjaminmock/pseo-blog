import { NextResponse } from "next/server";
import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { userId, name, first_name, last_name, phone_number, bio, link } =
      data;

    // Verify the user is updating their own profile
    if (userId !== currentUser.id) {
      return NextResponse.json(
        { message: "You can only update your own profile" },
        { status: 403 }
      );
    }

    // Update user information in Prisma
    await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    // Check if trainer exists for this user
    const trainerQuery = db.prepare(
      "SELECT trainer_id FROM Trainers WHERE email = ?"
    );
    const existingTrainer = trainerQuery.get(currentUser.email) as
      | { trainer_id: number }
      | undefined;

    if (existingTrainer) {
      // Update existing trainer
      const updateStmt = db.prepare(`
        UPDATE Trainers
        SET 
          first_name = ?,
          last_name = ?,
          phone_number = ?,
          bio = ?,
          link = ?
        WHERE trainer_id = ?
      `);

      updateStmt.run(
        first_name,
        last_name,
        phone_number || null,
        bio || null,
        link || null,
        existingTrainer.trainer_id
      );
    } else if (currentUser.email) {
      // Create new trainer if user has role 'teacher'
      if (currentUser.role === "teacher") {
        const insertStmt = db.prepare(`
          INSERT INTO Trainers (first_name, last_name, email, phone_number, bio, link)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        insertStmt.run(
          first_name,
          last_name,
          currentUser.email,
          phone_number || null,
          bio || null,
          link || null
        );
      }
    }

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile information" },
      { status: 500 }
    );
  }
}
