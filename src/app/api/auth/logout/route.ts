import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session_token")?.value;

    if (token) {
      await deleteSession(token);
      cookies().delete("session_token");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist beim Abmelden aufgetreten" },
      { status: 500 }
    );
  }
}
