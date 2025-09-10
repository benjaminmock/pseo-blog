import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  // Only allow this endpoint in test/development environments
  if (process.env.NODE_ENV === "production" && process.env.CYPRESS !== "true") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    // Find the test user in the database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: "Test user not found" }, { status: 404 });
    }

    // Create a JWT token for the session
    const token = await encode({
      token: {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      },
      secret: process.env.NEXTAUTH_SECRET!,
    });

    // Create the response and set the session cookie
    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    
    // Set the NextAuth session cookie
    response.cookies.set("next-auth.session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error creating test session:", error);
    return NextResponse.json({ error: "Failed to create test session" }, { status: 500 });
  }
}