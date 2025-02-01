import { NextResponse } from "next/server";
import { createUser, createSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser(email, password, name);
    
    // Create session
    const token = await createSession(user.id);
    
    // Set cookie
    cookies().set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    // Check for unique constraint violation
    if (error.message?.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "Diese Email-Adresse wird bereits verwendet" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Ein Fehler ist bei der Registrierung aufgetreten" },
      { status: 500 }
    );
  }
}
