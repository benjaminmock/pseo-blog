import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config";

// This endpoint is only available in test/development environments
export async function POST(request: NextRequest) {
  // Only allow in test environment
  if (process.env.NODE_ENV === "production" && !process.env.CYPRESS) {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email, firstName = "Test", lastName = "Teacher" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if trainer already exists
    const existingTrainer = db
      .prepare(
        `
      SELECT trainer_id FROM Trainers WHERE email = ?
    `
      )
      .get(email) as { trainer_id: number } | undefined;

    if (existingTrainer) {
      return NextResponse.json({
        success: true,
        trainer_id: existingTrainer.trainer_id,
        message: "Trainer already exists",
      });
    }

    // Insert new trainer
    const insertStmt = db.prepare(`
      INSERT INTO Trainers (first_name, last_name, email, slug)
      VALUES (?, ?, ?, ?)
    `);

    const slug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
    const result = insertStmt.run(firstName, lastName, email, slug);

    return NextResponse.json({
      success: true,
      trainer_id: result.lastInsertRowid,
      message: "Trainer created successfully",
    });
  } catch (error) {
    console.error("Seed trainer error:", error);
    return NextResponse.json(
      { error: "Failed to seed trainer data" },
      { status: 500 }
    );
  }
}

// Delete trainer endpoint for cleanup
export async function DELETE(request: NextRequest) {
  // Only allow in test environment
  if (process.env.NODE_ENV === "production" && !process.env.CYPRESS) {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Delete trainer
    const deleteStmt = db.prepare(`
      DELETE FROM Trainers WHERE email = ?
    `);

    const result = deleteStmt.run(email);

    return NextResponse.json({
      success: true,
      changes: result.changes,
      message: "Trainer deleted successfully",
    });
  } catch (error) {
    console.error("Delete trainer error:", error);
    return NextResponse.json(
      { error: "Failed to delete trainer data" },
      { status: 500 }
    );
  }
}
