# Authentication Architecture Documentation

## Overview

This document describes the comprehensive authentication and authorization system implemented for the yoga course platform. The system uses a single authentication table with role-based access control (RBAC) to support both students and teachers.

## Architecture Decision

**✅ Single Authentication System** - We use one unified authentication system for all user types rather than separate systems for students and teachers.

### Why Single Authentication?

1. **Simplified Management**: One auth flow, one session system, one set of security policies
2. **Better User Experience**: Users can potentially switch roles without creating new accounts
3. **Reduced Complexity**: Less code duplication and maintenance overhead
4. **Scalability**: Easy to add new roles (admin, moderator, etc.) in the future
5. **NextAuth Optimization**: The library is designed around a single user model

## Database Schema

### User Table
```prisma
enum UserRole {
  student
  teacher
  admin
}

model User {
  id            String        @id @default(cuid())
  name          String?
  email         String?       @unique
  emailVerified DateTime?
  image         String?
  role          UserRole      @default(student)
  password_hash String?
  accounts      Account[]
  sessions      Session[]
  participants  Participant[]
}
```

### Role-Specific Data Models

- **Trainer**: Contains teacher-specific information (bio, phone, etc.)
- **Participant**: Contains student-specific information (emergency contacts, medical notes, etc.)

## Authentication Flow

### 1. Login Process

1. **Role Selection**: User selects role (student/teacher) on login page
2. **OAuth Flow**: User authenticates via Google/LinkedIn
3. **Role Assignment**: Selected role is stored and applied to user account
4. **Profile Creation**: Appropriate profile (Trainer/Participant) is created automatically

### 2. Session Management

- Uses NextAuth.js with JWT strategy
- Session includes user ID and role
- Role is fetched fresh from database on each session validation

### 3. Post-Login Redirection

After successful authentication, users are redirected based on their role:

- **Students**: Redirected to `/student-dashboard` - a dedicated student interface
- **Teachers/Admins**: Redirected to `/` (homepage) - shows the internal teacher area
- **Auth Route Access**: When authenticated users try to access auth routes, they are redirected to their appropriate dashboard

## Authorization System

### Route Protection

#### Middleware (`src/middleware.ts`)
```typescript
// Route categories
const routeProtection = {
  protected: ["/profil", "/student-dashboard"], // Requires authentication
  teacherOnly: ["/intern", "/kurs/neu"], // Requires teacher role
  adminOnly: ["/admin"],            // Requires admin role
  public: ["/", "/kurse"],          // No authentication required
  auth: ["/login", "/register"]     // Auth pages
};

// Role-based redirection logic
if (pathname === "/" && sessionToken) {
  const user = await getUserFromRequest(request);
  if (user?.role === "student") {
    return NextResponse.redirect(new URL("/student-dashboard", request.url));
  }
}
```

#### Protection Levels
1. **Public Routes**: No authentication required
2. **Protected Routes**: Authentication required, any role
3. **Teacher Routes**: Teacher or admin role required
4. **Admin Routes**: Admin role only
5. **Student Dashboard**: Protected route accessible to all authenticated users, but students are automatically redirected here from homepage

### API Route Protection

#### Utility Functions (`src/lib/api-auth.ts`)
```typescript
// Wrapper functions for API routes
export const withAuth = (handler) => { /* ... */ };
export const withTeacher = (handler) => { /* ... */ };
export const withAdmin = (handler) => { /* ... */ };
```

#### Usage Examples
```typescript
// Teacher-only API route
export const POST = withTeacher(async (user, request) => {
  // Handler logic with authenticated teacher user
});

// Admin-only API route
export const POST = withAdmin(async (user, request) => {
  // Handler logic with authenticated admin user
});
```

## Key Components

### 1. Authentication Configuration (`src/auth.ts`)

- NextAuth configuration with Google/LinkedIn providers
- Role assignment logic in signIn callback
- Automatic trainer profile creation for teachers
- Session callback with fresh role data

### 2. Login Page (`src/app/login/page.tsx`)

- Role selection UI (student/teacher)
- OAuth provider buttons
- Role storage in localStorage before OAuth flow
- Post-authentication role setting via API

### 3. Role Setting API (`src/app/api/auth/set-role/route.ts`)

- Validates and updates user roles
- Creates trainer profiles for teacher roles
- Handles role transitions

### 4. Middleware (`src/middleware.ts`)

- Route-based access control
- Role validation for protected routes
- Automatic redirects for unauthorized access
- Role-based post-login redirection (students → `/student-dashboard`, teachers → `/`)

### 5. Student Dashboard (`src/app/student-dashboard/page.tsx`)

- Dedicated interface for students
- Student-specific content and navigation
- Placeholder sections for enrolled courses and registered events
- Links to discover new courses and events

### 6. User Sub-Navigation (`src/components/UserSubNav.tsx`)

- Role-based navigation rendering
- **Student Navigation**: Dashboard, Kurse entdecken, Events entdecken, Lehrer finden, Profil
- **Teacher Navigation**: Dashboard, Kurse, Events, Teilnehmer, Anmeldungen, Zahlungen, Anwesenheit, Profil

### 7. Unauthorized Page (`src/app/unauthorized/page.tsx`)

- User-friendly error page for insufficient permissions
- Navigation options back to login or home

## Security Features

### 1. Role Validation
- Server-side role checks on every request
- Fresh role data from database (not cached in JWT)
- Middleware-level route protection

### 2. API Security
- Wrapper functions ensure consistent auth checks
- Proper error responses (401, 403)
- Type-safe user objects in handlers

### 3. Session Security
- JWT tokens with expiration
- Secure cookie settings
- CSRF protection via NextAuth

## Testing Strategy

### 1. Unit Tests
- Role validation functions
- API auth wrappers
- Middleware logic

### 2. Integration Tests (`cypress/e2e/authentication.cy.ts`)
- Login flow with role selection
- Route protection verification
- API endpoint security
- Role-based access control

### 3. Test Utilities (`cypress/support/auth-commands.ts`)
- Mock user sessions with different roles
- Test user creation and cleanup
- Authentication state management

## Usage Examples

### Frontend Role Checking
```typescript
import { useSession } from "next-auth/react";

function TeacherOnlyComponent() {
  const { data: session } = useSession();
  
  if (session?.user?.role !== "teacher") {
    return <div>Access denied</div>;
  }
  
  return <div>Teacher content</div>;
}

function StudentOnlyComponent() {
  const { data: session } = useSession();
  
  if (session?.user?.role !== "student") {
    return <div>Access denied</div>;
  }
  
  return <div>Student content</div>;
}
```

### Role-Based Navigation
```typescript
// In UserSubNav component
const userRole = session.user.role;

if (userRole === "student") {
  // Render student navigation
  return <StudentNavigation />;
}

// Render teacher/admin navigation
return <TeacherNavigation />;
```

### API Route Protection
```typescript
import { withTeacher } from "@/lib/api-auth";

export const POST = withTeacher(async (user, request) => {
  // user.role is guaranteed to be "teacher" or "admin"
  const data = await request.json();
  // Handle teacher-specific logic
});
```

### Middleware Configuration
```typescript
// Add new protected routes
const routeProtection = {
  teacherOnly: [
    "/intern",
    "/new-teacher-route"  // Add new routes here
  ]
};
```

## Migration Guide

### Adding New Roles

1. **Update Enum**: Add role to `UserRole` enum in schema
2. **Update Types**: Add role to TypeScript types
3. **Update Middleware**: Add route protection rules
4. **Update API**: Add role validation where needed
5. **Create Migration**: Run `npx prisma migrate dev`

### Example: Adding "moderator" Role

```prisma
enum UserRole {
  student
  teacher
  moderator  // New role
  admin
}
```

```typescript
// Update route protection
const routeProtection = {
  moderatorOnly: ["/moderate"],
  teacherOrModerator: ["/content-management"]
};
```

## Best Practices

### 1. Always Use Server-Side Validation
- Never trust client-side role checks
- Always validate roles in API routes and middleware

### 2. Principle of Least Privilege
- Grant minimum necessary permissions
- Use specific role checks rather than broad access

### 3. Consistent Error Handling
- Use standard HTTP status codes (401, 403)
- Provide clear error messages
- Redirect to appropriate pages

### 4. Testing
- Test all role combinations
- Verify unauthorized access is blocked
- Test role transitions

## Troubleshooting

### Common Issues

1. **Role Not Updating**: Clear browser cache and cookies
2. **Middleware Loops**: Check route protection configuration
3. **API 401 Errors**: Verify session is valid and role is correct

### Debug Tools

1. **Session Inspection**: Check `/api/auth/session`
2. **Database Queries**: Verify role in database
3. **Middleware Logs**: Enable debug mode in NextAuth

## Future Enhancements

1. **Role Hierarchies**: Implement role inheritance (admin > teacher > student)
2. **Permission System**: Fine-grained permissions beyond roles
3. **Multi-tenancy**: Organization-based access control
4. **Audit Logging**: Track role changes and access attempts

## Conclusion

This authentication architecture provides a robust, scalable foundation for the yoga course platform. The single authentication system with role-based access control ensures security while maintaining simplicity and user experience.