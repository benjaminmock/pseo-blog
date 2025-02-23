/**
 * @deprecated These functions are from the legacy authentication system.
 * Please use the new Auth.js based authentication system instead.
 * See src/auth.ts for the new implementation.
 */

import { db } from "@/config";
import { randomBytes, pbkdf2Sync } from "crypto";
import { cookies } from "next/headers";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const ITERATIONS = 10000;
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

/** @deprecated */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = pbkdf2Sync(
    password,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    "sha512"
  ).toString("hex");
  return `${salt}:${hash}`;
}

/** @deprecated */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [salt, hash] = storedHash.split(":");
  const verifyHash = pbkdf2Sync(
    password,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    "sha512"
  ).toString("hex");
  return hash === verifyHash;
}

/** @deprecated */
export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const passwordHash = await hashPassword(password);

  const stmt = db.prepare(`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (?, ?, ?, 'user')
    RETURNING id, email, name, role
  `);

  return stmt.get(email, passwordHash, name) as User;
}

/** @deprecated */
export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const stmt = db.prepare(`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `);

  stmt.run(userId, token, expiresAt.toISOString());
  return token;
}

/** @deprecated */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const stmt = db.prepare(
    "SELECT id, email, name, role FROM users WHERE email = ?"
  );
  return stmt.get(email) as User | undefined;
}

/** @deprecated */
export async function getUserByToken(token: string): Promise<User | undefined> {
  const stmt = db.prepare(`
    SELECT u.id, u.email, u.name, u.role
    FROM users u
    JOIN sessions s ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `);

  return stmt.get(token) as User | undefined;
}

/** @deprecated */
export async function getCurrentUser(): Promise<User | undefined> {
  const cookieStore = cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return undefined;
  }

  return getUserByToken(token);
}

/** @deprecated */
export async function deleteSession(token: string): Promise<void> {
  const stmt = db.prepare("DELETE FROM sessions WHERE token = ?");
  stmt.run(token);
}
