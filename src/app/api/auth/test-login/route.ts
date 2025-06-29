import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { db } from "@/config/index";

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
    const { user, expires } = body;

    const testUser = {
      id: user?.id || "test-user-id",
      name: user?.name || "Test User",
      email: user?.email || "test@example.com",
      role: user?.role || "student",
      image: user?.image || null,
    };

    // Create or update the user in the database for proper NextAuth integration
    const dbUser = await prisma.user.upsert({
      where: { email: testUser.email },
      update: {
        name: testUser.name,
        role: testUser.role,
        image: testUser.image,
      },
      create: {
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        image: testUser.image,
      },
    });

    // Update testUser with the actual database ID
    testUser.id = dbUser.id;

    // If the user is a teacher, also create a trainer record in SQLite
    if (testUser.role === "teacher") {
      try {
        // Check if trainer already exists
        const existingTrainer = db
          .prepare(
            `
          SELECT trainer_id FROM Trainers WHERE email = ?
        `
          )
          .get(testUser.email);

        if (!existingTrainer) {
          // Create trainer record in SQLite
          const insertTrainer = db.prepare(`
            INSERT INTO Trainers (name, email, bio, specialties, experience_years, certifications, profile_image, contact_info, availability, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `);

          insertTrainer.run(
            testUser.name,
            testUser.email,
            "Test trainer bio for Cypress testing",
            "Hatha Yoga, Vinyasa",
            5,
            "RYT-200, RYT-500",
            testUser.image,
            JSON.stringify({
              phone: "+49 123 456789",
              website: "https://example.com",
            }),
            JSON.stringify({ monday: "09:00-17:00", tuesday: "09:00-17:00" })
          );
        }
      } catch (error) {
        console.error("Error creating trainer record:", error);
        // Don't fail the login if trainer creation fails
      }
    }

    // Create a proper NextAuth JWT token
    const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-for-testing";
    const token = await encode({
      token: {
        sub: testUser.id,
        name: testUser.name,
        email: testUser.email,
        picture: testUser.image,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor((Date.now() + 30 * 60 * 1000) / 1000), // 30 minutes
      },
      secret,
    });

    // Create a mock session response
    const mockSession = {
      user: testUser,
      expires: expires || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    // Set the session cookie
    const response = NextResponse.json(mockSession);

    // Set NextAuth session token cookie with proper JWT
    response.cookies.set("next-auth.session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30 minutes
      path: "/",
    });

    // Set CSRF token cookie
    response.cookies.set("next-auth.csrf-token", "mock-csrf-token", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Test login error:", error);

    // Provide more specific error information for debugging
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Invalid request",
        details:
          process.env.NODE_ENV !== "production" ? errorMessage : undefined,
      },
      { status: 400 }
    );
  }
}

// Logout endpoint for tests
export async function DELETE() {
  // Only allow in test environment
  if (process.env.NODE_ENV === "production" && !process.env.CYPRESS) {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ success: true });

  // Clear session cookies
  response.cookies.delete("next-auth.session-token");
  response.cookies.delete("next-auth.csrf-token");

  return response;
}
