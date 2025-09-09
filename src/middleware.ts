import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest, routeProtection, hasRole } from "./lib/auth-utils";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("---°middleware", pathname);
  // Debug logging for intern routes
  if (pathname.startsWith("/intern")) {
    console.log(`🔍 Middleware: Checking access to ${pathname}`);
  }

  // Check route type
  const isAuthRoute = routeProtection.auth.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = routeProtection.public.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isProtectedRoute = routeProtection.protected.some((route) =>
    pathname.startsWith(route)
  );
  const isTeacherRoute = routeProtection.teacherOnly.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = routeProtection.adminOnly.some((route) =>
    pathname.startsWith(route)
  );

  // Debug logging for intern routes
  if (pathname.startsWith("/intern")) {
    console.log(
      `🔍 Route classification: isTeacherRoute=${isTeacherRoute}, isProtectedRoute=${isProtectedRoute}, isPublicRoute=${isPublicRoute}`
    );
  }

  // Get session token for quick auth check
  const sessionToken =
    request.cookies.get("next-auth.session-token") || // Development
    request.cookies.get("__Secure-next-auth.session-token"); // Production

  // Debug logging for intern routes
  if (pathname.startsWith("/intern")) {
    console.log(`🔍 Session token present: ${!!sessionToken}`);
  }

  // If user is logged in and tries to access auth routes, redirect based on role
  if (isAuthRoute && sessionToken) {
    try {
      const user = await getUserFromRequest(request);
      if (user?.role === "student") {
        return NextResponse.redirect(
          new URL("/student-dashboard", request.url)
        );
      }
      return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
      // If we can't get user info, default to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If route requires authentication and user is not logged in, redirect to login
  if ((isProtectedRoute || isTeacherRoute || isAdminRoute) && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect students from homepage to student dashboard
  if (pathname === "/" && sessionToken) {
    try {
      const user = await getUserFromRequest(request);
      if (user?.role === "student") {
        return NextResponse.redirect(
          new URL("/student-dashboard", request.url)
        );
      }
    } catch (error) {
      console.error("Error checking user role for homepage redirect:", error);
    }
  }

  // For role-based routes, check user role
  if (isTeacherRoute || isAdminRoute) {
    if (pathname.startsWith("/intern")) {
      console.log(`🔍 Checking role for teacher/admin route: ${pathname}`);
    }

    try {
      const user = await getUserFromRequest(request);

      if (pathname.startsWith("/intern")) {
        console.log(`🔍 User from request:`, user);
      }

      if (!user) {
        if (pathname.startsWith("/intern")) {
          console.log(`❌ No user found, redirecting to login`);
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check admin routes
      if (isAdminRoute && !hasRole(user.role, "admin")) {
        if (pathname.startsWith("/intern")) {
          console.log(`❌ User ${user.role} doesn't have admin access`);
        }
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Check teacher routes (teachers and admins can access)
      if (isTeacherRoute && !hasRole(user.role, ["teacher", "admin"])) {
        if (pathname.startsWith("/intern")) {
          console.log(`❌ User ${user.role} doesn't have teacher access`);
        }
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (pathname.startsWith("/intern")) {
        console.log(`✅ Access granted for user ${user.role} to ${pathname}`);
      }
    } catch (error) {
      console.error("Error in middleware role check:", error);
      if (pathname.startsWith("/intern")) {
        console.log(`❌ Error in role check, redirecting to login`);
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/callback (auth callback routes)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|api/auth/callback).*)",
  ],
};
