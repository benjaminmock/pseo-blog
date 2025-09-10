import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { role } = await request.json();

    if (!role || !["student", "teacher"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Update user role in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });

    // If user is a teacher, create trainer profile if it doesn't exist
    if (role === "teacher" && session.user.email) {
      const existingTrainer = await prisma.trainer.findUnique({
        where: { email: session.user.email },
      });

      if (!existingTrainer) {
        const firstName = session.user.name
          ? session.user.name.split(" ")[0]
          : session.user.email.split("@")[0];
        const lastName =
          session.user.name && session.user.name.includes(" ")
            ? session.user.name.split(" ").slice(1).join(" ")
            : "";

        // Create slug from first and last name, ensure it's unique
        let baseSlug =
          `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(
            /\s+/g,
            "-"
          );
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
            email: session.user.email,
            slug,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}