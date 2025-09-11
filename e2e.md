## E2E Testing Workflow Explanation

You now have a complete real end-to-end testing setup! Here's how to use it effectively:

### Available Scripts (from your `package.json`):

- **`npm run seed:e2e`** - Seeds the test database with users, trainers, cities, and sample events
- **`npm run cleanup:e2e`** - Cleans up all test data from the database
- **`npm run test:e2e`** - Runs Cypress tests in headless mode
- **`npm run test:e2e:open`** - Opens Cypress UI for interactive testing
- **`npm run test:e2e:full`** - **Recommended**: Full automated workflow (seed → run tests → cleanup)
- **`npm run test:e2e:full -- --spec "cypress/e2e/events/event-editing.cy.ts"`** - for one specific spec

### Recommended Usage:

**For most cases, use the full automated script:**

```bash
npm run test:e2e:full
```

This handles everything in one command:

1. Seeds fresh test data
2. Runs all Cypress tests
3. Cleans up afterwards (removes test events, users, etc.)

### Manual Control (if needed):

```bash
# 1. Seed test data
npm run seed:e2e

# 2. Run tests (choose one)
npm run test:e2e          # Headless mode
npm run test:e2e:open     # Interactive UI

# 3. Clean up when done
npm run cleanup:e2e
```

### What's in the Test Data:

The seed script creates:

- ✅ Teacher user: `teacher@test.com` / `testpassword123`
- ✅ Student user: `student@test.com` / `testpassword123`
- ✅ Trainer profile for the teacher
- ✅ Sample cities (Hamburg, Berlin, etc.)
- ✅ Sample events for testing

### Why Cleanup Matters:

- Prevents test data accumulation that could affect future tests
- Ensures consistent starting conditions for each test run
- Avoids conflicts (e.g., duplicate event slugs)

### Development Workflow:

1. Make code changes
2. Run `npm run test:e2e:full` to verify everything works
3. Repeat as needed

The tests now use **real database operations** and **actual authentication**, making them true end-to-end tests that validate your complete application flow from UI to database!
