import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export type UserRole = "student" | "teacher" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Get user session and role from JWT token
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    console.log("🔍 getUserFromRequest: Starting user lookup");
    
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    console.log("🔍 JWT Token:", token ? { sub: token.sub, email: token.email, role: (token as any).role } : "No token");
    
    if (!token?.sub || !token?.email) {
      console.log("❌ No token.sub or email found");
      return null;
    }

    // Use role from JWT token instead of database lookup to avoid Prisma in middleware
    // The role should be set in the JWT token during the session callback
    const role = (token as any).role || "student"; // Default to student if no role
    
    const authUser = {
      id: token.sub,
      email: token.email,
      role: role as UserRole
    };

    console.log("✅ Returning auth user from JWT:", authUser);
    return authUser;
  } catch (error) {
    console.error("❌ Error getting user from request:", error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === "admin";
}

/**
 * Check if user has teacher privileges (teacher or admin)
 */
export function isTeacher(userRole: UserRole): boolean {
  return userRole === "teacher" || userRole === "admin";
}

/**
 * Route protection configuration
 */
export const routeProtection = {
  // Routes that require authentication but no specific role
  protected: ["/profil", "/student-dashboard"],
  
  // Routes that require teacher role
  teacherOnly: [
    "/intern",
    "/kurs/neu",
    "/event/neu",
    "/trainer/neu",
    "/intern/kurse",
    "/intern/events",
    "/intern/participants",
    "/intern/payments",
    "/intern/attendance",
    "/intern/enrollments"
  ],
  
  // Routes that require admin role
  adminOnly: ["/admin"],
  
  // Public routes that don't require authentication
  public: ["/", "/kurse", "/events", "/trainer", "/p", "/seite", "/suche"],
  
  // Auth routes
  auth: ["/login", "/register", "/auth"]
};