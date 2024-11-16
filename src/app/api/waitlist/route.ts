import { db } from "@/config";
import { NextResponse, NextRequest } from "next/server";
import { sendDiscordNotification } from "@/lib/discord";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { name, email, city } = await req.json();

    const stmt = db.prepare(
      "INSERT INTO waitlist (name, email, city) VALUES (?, ?, ?)"
    );
    stmt.run(name, email, city);

    // Send Discord notification
    await sendDiscordNotification(
      `🎯 New Waitlist Entry\nName: ${name}\nEmail: ${email}\nCity: ${city}`
    );

    return NextResponse.json(
      { message: "Successfully added to waitlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to add to waitlist" },
      { status: 500 }
    );
  }
}

export async function methodNotAllowed(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
