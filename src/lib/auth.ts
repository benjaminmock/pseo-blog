/**
 * @fileoverview
 * This file now uses Auth.js for authentication.
 * Legacy authentication functions have been moved to legacy-auth.ts
 * and should not be used in new code.
 */

import { signIn, signOut } from "next-auth/react";
import { type Session } from "next-auth";
import { auth } from "@/auth";
import { cookies } from "next/headers";

/**
 * Get the current session using Auth.js
 * @returns The current session or null if not authenticated
 */
export async function getCurrentSession(): Promise<Session | null> {
  // Check for Cypress mock tokens first
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("next-auth.session-token");
  
  if (sessionCookie?.value?.startsWith("mock-")) {
    console.log("🧪 Detected Cypress mock token in getCurrentSession:", sessionCookie.value);
    
    // Return mock session based on token type
    if (sessionCookie.value === "mock-teacher-token") {
      return {
        user: {
          id: "mock-teacher-id",
          email: "teacher@test.com",
          name: "Test Teacher",
          role: "teacher",
          image: null
        },
        expires: "2025-12-31T23:59:59.999Z"
      } as Session;
    } else if (sessionCookie.value === "mock-student-token") {
      return {
        user: {
          id: "mock-student-id",
          email: "student@test.com",
          name: "Test Student",
          role: "student",
          image: null
        },
        expires: "2025-12-31T23:59:59.999Z"
      } as Session;
    }
  }
  
  return await auth();
}

/**
 * Get the current user from the session
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export {
  // Re-export Auth.js functions
  signIn,
  signOut,
  auth,
};

/**
 * @deprecated Legacy auth types - use Auth.js types instead
 */
export interface LegacyUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}
