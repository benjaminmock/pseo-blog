import { cookies } from "next/headers";
import { db } from "@/config";

// This function should only be used in Server Components or API Routes
export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const session = db
      .prepare(
        `SELECT sessions.*, users.name, users.email, users.role
         FROM sessions
         JOIN users ON sessions.user_id = users.id
         WHERE sessions.token = ? AND sessions.expires_at > datetime('now')`
      )
      .get(token) as {
        id: number;
        user_id: number;
        token: string;
        expires_at: string;
        created_at: string;
        name: string;
        email: string;
        role: string;
      } | undefined;

    if (!session) {
      return null;
    }

    return {
      name: session.name,
      email: session.email,
      role: session.role,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Use this in API routes to require authentication
export async function requireAuth(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((cookie) => cookie.split("="))
  );
  const token = cookies.session_token;

  if (!token) {
    return null;
  }

  try {
    const session = db
      .prepare(
        `SELECT sessions.*, users.name, users.email, users.role
         FROM sessions
         JOIN users ON sessions.user_id = users.id
         WHERE sessions.token = ? AND sessions.expires_at > datetime('now')`
      )
      .get(token) as {
        id: number;
        user_id: number;
        token: string;
        expires_at: string;
        created_at: string;
        name: string;
        email: string;
        role: string;
      } | undefined;

    if (!session) {
      return null;
    }

    return {
      id: session.user_id,
      name: session.name,
      email: session.email,
      role: session.role,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
