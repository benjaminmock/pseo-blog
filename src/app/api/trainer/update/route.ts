import { NextResponse } from "next/server";
import { db } from "@/config";
import { getCurrentUser } from "@/lib/auth";

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

    // Update trainer information
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
      trainer_id
    );

    return NextResponse.json(
      { message: "Trainer information updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating trainer:", error);
    return NextResponse.json(
      { message: "Failed to update trainer information" },
      { status: 500 }
    );
  }
}
