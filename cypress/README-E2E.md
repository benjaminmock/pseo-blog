# End-to-End Testing with Real Database Data

This directory contains comprehensive E2E tests that use real database data instead of mocked responses, providing true end-to-end testing of the application.

## Overview

The E2E testing system includes:
- **Real database seeding** with test users and trainers
- **Authentication commands** for login/logout
- **Complete event lifecycle testing** (create, edit, view, delete)
- **Automatic cleanup** to maintain test isolation

## Test Files

### Main E2E Test
- `event-lifecycle-e2e.cy.ts` - Comprehensive test covering the full event lifecycle

### Legacy Tests (Fixed)
- `events.cy.ts` - Updated to test real application instead of mocks

## Setup and Usage

### Prerequisites
1. Ensure your Next.js application is running on `http://localhost:3000`
2. Make sure the database is accessible and properly configured

### Running Tests

#### Quick Start
```bash
# Run the complete E2E test with automatic seeding and cleanup
npm run test:e2e:full
```

#### Manual Control
```bash
# Seed test data
npm run seed:e2e

# Run Cypress tests
npm run test:e2e

# Cleanup test data
npm run cleanup:e2e
```

#### Interactive Testing
```bash
# Seed data and open Cypress UI
npm run seed:e2e && npm run test:e2e:open
```

## Test User Credentials

The E2E tests use a dedicated test user:
- **Email**: `test-teacher@example.com`
- **Password**: `testpassword123`
- **Role**: `teacher`
- **Trainer ID**: `999`

## Test Flow

The main E2E test (`event-lifecycle-e2e.cy.ts`) performs the following actions:

1. **🔐 Login** as test teacher
2. **📝 Create Event** with form validation
3. **✏️ Edit Event** details and verify changes
4. **🚪 Logout** and verify public access
5. **👁️ Public View** - verify event is visible to non-authenticated users
6. **🔐 Login Again** for management actions
7. **🗑️ Delete Event** and confirm removal
8. **✅ Verify Deletion** - ensure event is completely removed

## Key Features

### Real Database Integration
- Tests interact with actual SQLite database
- No mocked API responses or fake HTML pages
- True validation of database queries and constraints

### Authentication Testing
- Custom Cypress commands for login/logout
- Session management with real NextAuth tokens
- Role-based access control validation

### Data Isolation
- Automatic test data seeding before tests
- Complete cleanup after test completion
- Unique test user to avoid conflicts

### Comprehensive Coverage
- Form validation testing
- Public vs. authenticated views
- CRUD operations (Create, Read, Update, Delete)
- Navigation and routing

## Custom Cypress Commands

### Authentication
```typescript
cy.loginAsTestTeacher()  // Login as the test teacher user
cy.logoutUser()          // Logout current user
```

### Data Management
```typescript
cy.seedE2EData()         // Seed test data in database
cy.cleanupE2EData()      // Remove test data from database
```

## Database Schema

The test system creates the following test data:

### Test User
```sql
User {
  id: 'test-user-e2e-123'
  email: 'test-teacher@example.com'
  name: 'Test Teacher'
  role: 'teacher'
  password_hash: [bcrypt hash]
}
```

### Test Trainer
```sql
Trainer {
  trainer_id: 999
  first_name: 'Test'
  last_name: 'Teacher'
  email: 'test-teacher@example.com'
  slug: 'test-teacher'
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure the SQLite database file exists
   - Check database permissions
   - Verify the application is running

2. **Authentication Failures**
   - Confirm NextAuth is properly configured
   - Check that the test API endpoint is accessible
   - Verify session cookies are being set

3. **Test Data Conflicts**
   - Run cleanup manually: `npm run cleanup:e2e`
   - Check for existing test data in database
   - Ensure unique test identifiers

### Debug Mode

To debug tests with more verbose output:
```bash
# Enable Cypress debug mode
DEBUG=cypress:* npm run test:e2e
```

### Manual Database Inspection

```bash
# Open Prisma Studio to inspect database
npm run db:studio
```

## Best Practices

1. **Always run cleanup** after tests to maintain isolation
2. **Use unique identifiers** for test data (timestamps, UUIDs)
3. **Test both positive and negative scenarios** (validation errors, unauthorized access)
4. **Verify public vs. authenticated views** to ensure proper access control
5. **Test the complete user journey** from start to finish

## Contributing

When adding new E2E tests:

1. Follow the existing pattern of seeding → testing → cleanup
2. Use the custom Cypress commands for authentication
3. Test real user workflows, not just technical functionality
4. Include both success and error scenarios
5. Document any new test data requirements

## Files Structure

```
cypress/
├── e2e/
│   ├── event-lifecycle-e2e.cy.ts    # Main E2E test
│   └── events.cy.ts                 # Legacy tests (fixed)
├── support/
│   ├── auth-commands.ts             # Authentication commands
│   ├── commands.ts                  # General Cypress commands
│   └── e2e.ts                       # Support file imports
└── README-E2E.md                    # This documentation

prisma/
├── seed-e2e-test.ts                 # Database seeding script
└── cleanup-e2e-test.ts              # Database cleanup script

src/app/api/test/
└── auth/route.ts                    # Test authentication endpoint
```

This E2E testing system provides comprehensive coverage of your application's event management functionality with real database integration, ensuring that your tests accurately reflect the user experience in production.