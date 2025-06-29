# Cypress Authentication Testing

This document explains how to test social login and authentication in your application using Cypress without actually logging in via third-party providers.

## Overview

We've implemented two approaches for testing authentication:

1. **Session Mocking** - Fast, client-side session simulation
2. **API Endpoint** - More realistic server-side authentication simulation

## Setup

The authentication testing setup includes:

- Custom Cypress commands in [`cypress/support/commands.ts`](./support/commands.ts)
- Test-specific authentication endpoint at [`/api/auth/test-login`](../src/app/api/auth/test-login/route.ts)
- Comprehensive test examples in [`cypress/e2e/intern.cy.ts`](./e2e/intern.cy.ts) and [`cypress/e2e/auth-examples.cy.ts`](./e2e/auth-examples.cy.ts)

## Method 1: Session Mocking (Recommended for most tests)

### Basic Usage

```typescript
// Login with default user (student role)
cy.login();

// Login with custom user data
cy.login({
  name: "Test Teacher",
  email: "teacher@example.com",
  role: "teacher",
});

// Mock user data (courses and events)
cy.mockUserData({
  courses: [
    {
      course_id: 1,
      course_name: "Yoga for Beginners",
      description: "A relaxing course for beginners",
      start_date: "2024-01-15",
      end_date: "2024-03-15",
      city_slug: "hamburg",
      slug: "yoga-for-beginners",
      active: 1,
      first_name: "Test",
      last_name: "Teacher",
    },
  ],
  events: [],
});

// Logout
cy.logout();
```

### How it works

- Sets NextAuth.js cookies to simulate authenticated state
- Mocks `/api/auth/session` endpoint responses
- Stores session data in browser window for client-side access
- Intercepts API calls for courses, events, and other user data

## Method 2: API Endpoint (For more realistic testing)

### Basic Usage

```typescript
// Login using test API endpoint
cy.loginViaAPI({
  name: "API User",
  email: "api@example.com",
  role: "teacher",
});

// Logout using test API endpoint
cy.logoutViaAPI();
```

### How it works

- Uses a real API endpoint (`/api/auth/test-login`) that sets actual cookies
- More closely simulates real authentication flow
- Only available in test/development environments

## Testing the /intern Page

The [`cypress/e2e/intern.cy.ts`](./e2e/intern.cy.ts) file contains comprehensive tests for the internal area page:

### Test Categories

1. **Unauthenticated Access**

   - Redirects to login page when not authenticated

2. **Student Role Tests**

   - Displays correct welcome message and role
   - Shows appropriate navigation links
   - Handles empty states for courses and events

3. **Teacher Role Tests**

   - Shows teacher-specific content
   - Displays courses and events when available
   - Tests course/event management actions (toggle status, delete)

4. **Loading States**

   - Tests loading indicators for session, courses, and events

5. **Role Update Functionality**
   - Tests localStorage-based role updates

### Example Test

```typescript
describe("Authenticated Access - Teacher Role", () => {
  beforeEach(() => {
    cy.login({
      id: "teacher-456",
      name: "Anna Lehrerin",
      email: "anna@example.com",
      role: "teacher",
    });
  });

  it("should display courses when teacher has courses", () => {
    const mockCourses = [
      {
        course_id: 1,
        course_name: "Yoga für Anfänger",
        description: "Ein entspannender Kurs für Einsteiger",
        start_date: "2024-01-15",
        end_date: "2024-03-15",
        city_slug: "hamburg",
        slug: "yoga-fuer-anfaenger",
        active: 1,
        first_name: "Anna",
        last_name: "Lehrerin",
      },
    ];

    cy.mockUserData({
      courses: mockCourses,
      events: [],
    });

    cy.visit("/intern");

    cy.contains("Yoga für Anfänger").should("be.visible");
    cy.contains("Ein entspannender Kurs für Einsteiger").should("be.visible");
    cy.contains("Aktiv").should("be.visible");
  });
});
```

## Simulating Social Login Flows

### Google OAuth Simulation

```typescript
it("should simulate Google OAuth flow", () => {
  // Mock the OAuth callback
  cy.intercept("POST", "/api/auth/signin/google", {
    statusCode: 200,
    body: { ok: true, url: "/intern" },
  }).as("googleSignin");

  // Mock successful session after OAuth
  cy.login({
    name: "Google User",
    email: "google@example.com",
    role: "teacher",
    image: "https://example.com/avatar.jpg",
  });

  cy.visit("/login");
  // Test would click Google login button here
  cy.visit("/intern");
  cy.contains("Willkommen, Google User!").should("be.visible");
});
```

### LinkedIn OAuth Simulation

```typescript
it("should simulate LinkedIn OAuth flow", () => {
  // Mock the OAuth callback
  cy.intercept("POST", "/api/auth/signin/linkedin", {
    statusCode: 200,
    body: { ok: true, url: "/intern" },
  }).as("linkedinSignin");

  // Mock successful session after OAuth
  cy.login({
    name: "LinkedIn User",
    email: "linkedin@example.com",
    role: "student",
  });

  cy.visit("/intern");
  cy.contains("Willkommen, LinkedIn User!").should("be.visible");
});
```

## Available Custom Commands

| Command             | Description                      | Parameters                   |
| ------------------- | -------------------------------- | ---------------------------- |
| `cy.login()`        | Mock user session                | `UserOptions` (optional)     |
| `cy.logout()`       | Clear user session               | None                         |
| `cy.mockUserData()` | Mock API responses for user data | `MockDataOptions` (optional) |
| `cy.loginViaAPI()`  | Login using test API endpoint    | `UserOptions` (optional)     |
| `cy.logoutViaAPI()` | Logout using test API endpoint   | None                         |

## UserOptions Interface

```typescript
interface UserOptions {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string | null;
  expires?: string;
}
```

## MockDataOptions Interface

```typescript
interface MockDataOptions {
  courses?: any[];
  events?: any[];
}
```

## Best Practices

1. **Always clear session before tests**:

   ```typescript
   beforeEach(() => {
     cy.logout();
   });
   ```

2. **Use appropriate method for your test**:

   - Session mocking for UI tests
   - API endpoint for integration tests

3. **Test different user roles**:

   ```typescript
   ["student", "teacher"].forEach((role) => {
     it(`should work for ${role} role`, () => {
       cy.login({ role });
       // Test logic here
     });
   });
   ```

4. **Mock realistic data**:

   ```typescript
   cy.mockUserData({
     courses: [
       // Use realistic course data structure
     ],
   });
   ```

5. **Test error scenarios**:
   ```typescript
   cy.intercept("GET", "/api/auth/session", {
     statusCode: 401,
     body: { error: "Unauthorized" },
   });
   ```

## Security Considerations

- The test authentication endpoint is only available in test/development environments
- Never expose real credentials in test code
- Use environment variables for test-specific configuration
- Guard test endpoints with `process.env.CYPRESS === 'true'`

## Running the Tests

```bash
# Run all authentication tests
npx cypress run --spec "cypress/e2e/intern.cy.ts,cypress/e2e/auth-examples.cy.ts"

# Run specific test file
npx cypress run --spec "cypress/e2e/intern.cy.ts"

# Open Cypress UI for interactive testing
npx cypress open
```
