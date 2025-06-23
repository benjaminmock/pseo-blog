import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to update your role" },
        { status: 401 }
      );
    }

    // Get the role from the request body
    const { role } = await request.json();

    // Validate the role
    if (!role || !["student", "teacher"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Role must be 'student' or 'teacher'" },
        { status: 400 }
      );
    }

    // Update the user's role in the database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });

    // Return the updated user
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "An error occurred while updating your role" },
      { status: 500 }
    );
  }
}
