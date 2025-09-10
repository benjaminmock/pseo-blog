# Event Creation E2E Testing Guide

This guide explains how to test the event creation workflow behind social login authentication using Cypress.

## Overview

The event creation workflow testing simulates the complete user journey:
1. **Authentication**: Login as a teacher user (simulating LinkedIn social login)
2. **Event Creation**: Fill and submit the event creation form
3. **Verification**: Confirm the event was created successfully
4. **Public Access**: Logout and verify the event is publicly visible
5. **Cleanup**: Remove test data

## Test Files

- `cypress/e2e/event-creation-workflow.cy.ts` - Main event creation workflow tests
- `cypress/support/auth-commands.ts` - Enhanced authentication commands
- `src/app/api/test/auth/route.ts` - Test authentication API endpoint
- `prisma/seed-e2e-test.ts` - Test data seeding and cleanup

## Key Features

### Enhanced Authentication
- **NextAuth Compatible**: Test auth API creates proper NextAuth sessions
- **Cookie Management**: Properly sets and manages session cookies
- **Session Persistence**: Maintains authentication across page reloads
- **Debug Tools**: Built-in debugging for authentication issues

### Comprehensive Testing
- **Form Validation**: Tests both client-side and server-side validation
- **Multiple Event Types**: Tests both in-person and online events
- **Public Access**: Verifies events are visible to non-authenticated users
- **Permission Checks**: Ensures edit buttons only show for event owners

## Running the Tests

### Prerequisites
1. Ensure your development server is running:
   ```bash
   npm run dev
   ```

2. Make sure your database is set up and accessible

### Running Tests

#### Option 1: Interactive Mode (Recommended for Development)
```bash
# Open Cypress Test Runner
npm run test:e2e:open

# Or directly
npx cypress open
```

#### Option 2: Headless Mode (CI/CD)
```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx cypress run --spec "cypress/e2e/event-creation-workflow.cy.ts"

# Run with full lifecycle (seed + test + cleanup)
npm run test:e2e:full
```

#### Option 3: Manual Data Management
```bash
# Seed test data
npm run seed:e2e

# Run tests (keeping data)
npm run test:e2e

# Cleanup test data
npm run cleanup:e2e
```

## Test Structure

### Main Workflow Test
```typescript
it('should complete full event lifecycle: authenticate, create, view publicly, and verify')
```
This test covers:
- ✅ Teacher authentication
- ✅ Event form completion
- ✅ Event creation verification
- ✅ Owner permissions check
- ✅ Public logout and access
- ✅ Public viewing verification

### Additional Tests
- **Online Events**: Tests online-specific form fields
- **Form Validation**: Tests required field validation
- **Unauthorized Access**: Ensures login is required
- **Session Persistence**: Verifies authentication across reloads

## Authentication Flow

### How It Works
1. **Test API**: Uses `/api/test/auth` endpoint (only available in non-production)
2. **Session Creation**: Creates NextAuth-compatible session in database
3. **Cookie Setting**: Sets proper `next-auth.session-token` and CSRF cookies
4. **Verification**: Confirms authentication via `/api/auth/session`

### Test User
```typescript
const TEST_USER = {
  id: 'test-user-e2e-123',
  email: 'test-teacher@example.com',
  name: 'Test Teacher',
  role: 'teacher',
  trainerId: 999
};
```

## Debugging Authentication Issues

### Use the Debug Command
```typescript
cy.debugAuth(); // Shows cookies, localStorage, and session state
```

### Common Issues and Solutions

#### 1. Session Not Persisting
**Problem**: User gets logged out between pages
**Solution**: Check cookie domain and path settings in test auth API

#### 2. Form Submission Fails
**Problem**: Event creation returns 401/403
**Solution**: Verify trainer profile exists for test user

#### 3. City Selection Issues
**Problem**: City dropdown doesn't work
**Solution**: Ensure cities are seeded in test data

#### 4. Redirect Issues
**Problem**: Unexpected redirects to login
**Solution**: Check NextAuth session callback configuration

## Form Field Reference

### Required Fields
- `event_name` - Event title
- `start_date` - Event date
- Event type (at least one):
  - `is_in_person` - In-person event checkbox
  - `is_online` - Online event checkbox

### Optional Fields
- `description` - Event description
- `start_time` - Event start time
- `max_participants` - Maximum attendees
- `price` - Event price in euros

### Conditional Fields
**For In-Person Events:**
- City selection via CityCombobox

**For Online Events:**
- `online_url` - Meeting URL (required if online)
- `online_platform` - Platform name (Zoom, Teams, etc.)
- `online_instructions` - Additional instructions

## Data Cleanup

### Automatic Cleanup
- Test data is automatically cleaned up after test suite completion
- Each test starts with a clean state

### Manual Cleanup
```bash
npm run cleanup:e2e
```

### What Gets Cleaned Up
- Test user and associated sessions
- Test trainer profile
- Events created by test trainer
- User accounts and sessions

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` to ensure clean state
- Don't rely on data from previous tests

### 2. Realistic Data
- Use realistic event names and descriptions
- Set future dates for events
- Use valid URLs for online events

### 3. Error Handling
- Test both success and failure scenarios
- Verify proper error messages
- Check form validation

### 4. Performance
- Use `cy.intercept()` to mock slow API calls when needed
- Keep test data minimal but sufficient
- Clean up promptly after tests

## Troubleshooting

### Test Failures

#### Authentication Failures
1. Check if development server is running
2. Verify database connectivity
3. Ensure test user is properly seeded
4. Check NextAuth configuration

#### Form Submission Failures
1. Verify all required fields are filled
2. Check API endpoint availability
3. Ensure trainer profile exists
4. Verify database permissions

#### Navigation Issues
1. Check URL patterns in tests
2. Verify routing configuration
3. Ensure pages are accessible

### Environment Issues

#### Database Connection
- Ensure SQLite database file exists
- Check file permissions
- Verify database schema is up to date

#### NextAuth Configuration
- Check `NEXTAUTH_SECRET` environment variable
- Verify provider configuration
- Ensure session strategy is set to 'jwt'

## Contributing

When adding new tests:
1. Follow the existing naming conventions
2. Add proper cleanup for any new test data
3. Include both positive and negative test cases
4. Update this documentation if needed

## Security Notes

- Test authentication API is only available in non-production environments
- Test data uses predictable IDs for easy cleanup
- Session tokens are clearly marked as test tokens
- All test data is isolated from production data