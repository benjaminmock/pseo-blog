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
