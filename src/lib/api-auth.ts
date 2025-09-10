import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "./prisma";
import { UserRole, hasRole } from "./auth-utils";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Get authenticated user from API request
 */
export async function getAuthenticatedUser(request?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return null;
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, role: true }
    });

    if (!user || !user.email) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole
    };
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
}

/**
 * Require authentication for API route
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  return user;
}

/**
 * Require specific role for API route
 */
export async function requireRole(requiredRole: UserRole | UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  
  if (!hasRole(user.role, requiredRole)) {
    throw new Error(`Role ${Array.isArray(requiredRole) ? requiredRole.join(" or ") : requiredRole} required`);
  }
  
  return user;
}

/**
 * Require teacher role (teacher or admin)
 */
export async function requireTeacher(): Promise<AuthenticatedUser> {
  return requireRole(["teacher", "admin"]);
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  return requireRole("admin");
}

/**
 * Create standardized API error responses
 */
export function createErrorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/**
 * Handle API authentication errors
 */
export function handleAuthError(error: Error) {
  if (error.message === "Authentication required") {
    return createErrorResponse("Authentication required", 401);
  }
  
  if (error.message.includes("Role") && error.message.includes("required")) {
    return createErrorResponse("Insufficient permissions", 403);
  }
  
  console.error("API Auth Error:", error);
  return createErrorResponse("Internal server error", 500);
}

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth<T extends any[]>(
  handler: (user: AuthenticatedUser, ...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      const user = await requireAuth();
      return handler(user, ...args);
    } catch (error) {
      return handleAuthError(error as Error);
    }
  };
}

/**
 * Wrapper for API routes that require specific role
 */
export function withRole<T extends any[]>(
  requiredRole: UserRole | UserRole[],
  handler: (user: AuthenticatedUser, ...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      const user = await requireRole(requiredRole);
      return handler(user, ...args);
    } catch (error) {
      return handleAuthError(error as Error);
    }
  };
}

/**
 * Wrapper for API routes that require teacher role
 */
export function withTeacher<T extends any[]>(
  handler: (user: AuthenticatedUser, ...args: T) => Promise<Response>
) {
  return withRole(["teacher", "admin"], handler);
}

/**
 * Wrapper for API routes that require admin role
 */
export function withAdmin<T extends any[]>(
  handler: (user: AuthenticatedUser, ...args: T) => Promise<Response>
) {
  return withRole("admin", handler);
}