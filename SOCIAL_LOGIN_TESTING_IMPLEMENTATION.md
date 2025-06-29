# Social Login Testing Implementation

This document provides a complete implementation for testing social login in your application with Cypress without actually logging in via third-party providers.

## 🎯 Overview

We've implemented a comprehensive authentication testing solution that allows you to:

- Test social login flows without real OAuth providers
- Mock user sessions and authentication states
- Test role-based access control
- Verify protected route behavior
- Test the `/intern` page functionality with different user roles

## 📁 Files Created/Modified

### 1. Cypress Commands (`cypress/support/commands.ts`)

Enhanced with custom authentication commands:

- `cy.login()` - Mock user session with NextAuth.js cookies
- `cy.logout()` - Clear user session
- `cy.mockUserData()` - Mock API responses for courses and events
- `cy.loginViaAPI()` - Login using test API endpoint
- `cy.logoutViaAPI()` - Logout using test API endpoint

### 2. Test Authentication Endpoint (`src/app/api/auth/test-login/route.ts`)

A test-only API endpoint that:

- Only works in test/development environments
- Sets real NextAuth.js cookies
- Provides more realistic authentication simulation
- Supports both login (POST) and logout (DELETE)

### 3. Intern Page Tests (`cypress/e2e/intern.cy.ts`)

Comprehensive tests for the internal area page covering:

- **Unauthenticated Access**: Redirects to login
- **Student Role Tests**: Appropriate content and permissions
- **Teacher Role Tests**: Course/event management functionality
- **Loading States**: Session, courses, and events loading
- **Role Updates**: localStorage-based role switching
- **Interactive Features**: Course/event status toggle and deletion

### 4. Authentication Examples (`cypress/e2e/auth-examples.cy.ts`)

Demonstration tests showing:

- Both authentication methods (session mocking vs API)
- Social login flow simulation
- Role-based access control
- Error handling scenarios
- Session persistence and expiration

### 5. Documentation (`cypress/README.md`)

Complete guide with:

- Usage examples for all commands
- Best practices for authentication testing
- Security considerations
- Troubleshooting tips

## 🚀 Key Features

### Two Authentication Methods

#### Method 1: Session Mocking (Fast)

```typescript
cy.login({
  name: "Test User",
  email: "test@example.com",
  role: "teacher",
});
```

**Pros:**

- Very fast execution
- No server-side dependencies
- Perfect for UI testing

**Cons:**

- Less realistic than real authentication
- Doesn't test actual cookie handling

#### Method 2: API Endpoint (Realistic)

```typescript
cy.loginViaAPI({
  name: "API User",
  email: "api@example.com",
  role: "student",
});
```

**Pros:**

- More realistic authentication flow
- Tests actual cookie setting
- Better for integration testing

**Cons:**

- Slightly slower
- Requires test endpoint

### Social Login Simulation

```typescript
// Mock OAuth providers
cy.intercept("POST", "/api/auth/signin/google", {
  statusCode: 200,
  body: { ok: true, url: "/intern" },
}).as("googleSignin");

// Simulate successful authentication
cy.login({
  name: "Google User",
  email: "google@example.com",
  role: "teacher",
});
```

### Role-Based Testing

```typescript
// Test different user roles
["student", "teacher"].forEach((role) => {
  it(`should work for ${role} role`, () => {
    cy.login({ role });
    cy.visit("/intern");
    // Role-specific assertions
  });
});
```

## 🧪 Test Coverage

### `/intern` Page Tests

1. **Authentication Guard**

   - Redirects unauthenticated users to login
   - Allows authenticated users to access the page

2. **User Interface**

   - Displays correct welcome message with user name
   - Shows appropriate role badge (Student/Teacher)
   - Renders navigation links correctly

3. **Role-Based Content**

   - **Students**: Shows "not registered as trainer" message
   - **Teachers**: Shows course/event creation options

4. **Data Management**

   - Displays courses and events when available
   - Shows empty states when no data
   - Handles loading states appropriately

5. **Interactive Features**

   - Course status toggle (activate/deactivate)
   - Event status toggle (activate/deactivate)
   - Course deletion with confirmation
   - Event deletion with confirmation

6. **Error Handling**
   - Graceful handling of API failures
   - Proper loading state management

## 🔧 Usage Examples

### Basic Authentication Test

```typescript
describe("Protected Route", () => {
  it("should require authentication", () => {
    cy.visit("/intern");
    cy.url().should("include", "/login");
  });

  it("should allow authenticated access", () => {
    cy.login();
    cy.mockUserData({ courses: [], events: [] });
    cy.visit("/intern");
    cy.contains("Interner Bereich").should("be.visible");
  });
});
```

### Role-Based Access Test

```typescript
describe("Role-Based Access", () => {
  it("should show teacher-specific content", () => {
    cy.login({ role: "teacher" });
    cy.mockUserData({ courses: [], events: [] });
    cy.visit("/intern");

    cy.contains("Rolle: Lehrer*in/Trainer*in").should("be.visible");
    cy.contains("Ersten Kurs erstellen").should("be.visible");
  });
});
```

### Data Interaction Test

```typescript
describe("Course Management", () => {
  it("should toggle course status", () => {
    cy.login({ role: "teacher" });
    cy.mockUserData({
      courses: [
        {
          course_id: 1,
          course_name: "Test Course",
          active: 1,
          // ... other required fields
        },
      ],
    });

    cy.visit("/intern");
    cy.contains("Deaktivieren").click();
    cy.wait("@toggleCourseStatus");
  });
});
```

## 🛡️ Security Considerations

1. **Environment Protection**

   - Test endpoint only works in test/development
   - Guarded by `process.env.CYPRESS` check
   - Never exposes real credentials

2. **Test Isolation**

   - Each test starts with clean session
   - No cross-test contamination
   - Proper cleanup after tests

3. **Data Mocking**
   - All API responses are mocked
   - No real database interactions in tests
   - Realistic but safe test data

## 🎯 Best Practices

1. **Always Clear Session**

   ```typescript
   beforeEach(() => {
     cy.logout();
   });
   ```

2. **Mock Required Data**

   ```typescript
   cy.mockUserData({
     courses: [], // Always provide expected structure
     events: [],
   });
   ```

3. **Test Error Scenarios**

   ```typescript
   cy.intercept("GET", "/api/auth/session", {
     statusCode: 401,
     body: { error: "Unauthorized" },
   });
   ```

4. **Use Appropriate Method**
   - Session mocking for UI tests
   - API endpoint for integration tests

## 🚀 Running the Tests

```bash
# Run all authentication tests
npx cypress run --spec "cypress/e2e/intern.cy.ts,cypress/e2e/auth-examples.cy.ts"

# Run specific test
npx cypress run --spec "cypress/e2e/intern.cy.ts"

# Interactive mode
npx cypress open
```

## 🔍 Troubleshooting

### Common Issues

1. **Session Not Persisting**

   - Ensure cookies are set correctly
   - Check domain configuration
   - Verify NextAuth.js setup

2. **API Mocks Not Working**

   - Confirm intercept patterns match actual requests
   - Check timing of mock setup
   - Verify response structure

3. **Role-Based Tests Failing**
   - Ensure role is set correctly in session
   - Check role validation logic
   - Verify UI role display logic

### Debug Tips

1. **Check Session State**

   ```typescript
   cy.window().then((win) => {
     console.log("Session:", win.__NEXT_AUTH_SESSION);
   });
   ```

2. **Verify Cookies**

   ```typescript
   cy.getCookie("next-auth.session-token").should("exist");
   ```

3. **Monitor Network Requests**
   ```typescript
   cy.intercept("GET", "/api/auth/session").as("getSession");
   cy.wait("@getSession");
   ```

## 📈 Benefits

1. **Fast Test Execution**: No real OAuth flows
2. **Reliable Testing**: No external dependencies
3. **Comprehensive Coverage**: All authentication scenarios
4. **Easy Maintenance**: Simple mock setup
5. **Realistic Simulation**: Proper session handling
6. **Security**: No real credentials needed

This implementation provides a robust foundation for testing authentication flows in your application while maintaining security and reliability.
