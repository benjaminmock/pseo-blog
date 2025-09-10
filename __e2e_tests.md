# End-to-End Testing Implementation Plan for Event Features

## Overview
This document outlines the strategy for implementing Cypress end-to-end tests for the event creation flow (authenticated) and public event pages. The focus is on reliable, maintainable tests that handle NextAuth authentication without relying on social providers.

## Authentication Strategy

### Mock Authentication Commands
Create custom Cypress commands in [`cypress/support/commands.ts`](cypress/support/commands.ts:1) to handle authentication:

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('loginAsTeacher', () => {
  cy.setCookie('next-auth.session-token', 'mock-teacher-token');
  cy.intercept('/api/auth/session', {
    body: {
      user: {
        email: 'teacher@test.com',
        name: 'Test Teacher',
        role: 'teacher',
        image: null
      },
      expires: '2025-12-31T23:59:59.999Z'
    }
  });
});

Cypress.Commands.add('loginAsStudent', () => {
  cy.setCookie('next-auth.session-token', 'mock-student-token');
  cy.intercept('/api/auth/session', {
    body: {
      user: {
        email: 'student@test.com',
        name: 'Test Student',
        role: 'student',
        image: null
      },
      expires: '2025-12-31T23:59:59.999Z'
    }
  });
});

Cypress.Commands.add('logout', () => {
  cy.clearCookie('next-auth.session-token');
});
```

## Test File Structure

```
cypress/
  e2e/
    events/
      event-creation.cy.ts    # Tests for /event/neu
      event-listing.cy.ts     # Tests for /events
      event-details.cy.ts     # Tests for /events/[eventSlug]
  fixtures/
    events.json               # Sample event data
  support/
    commands.ts               # Custom commands (augment existing)
    e2e.ts                    # Support file
```

## Implementation Steps

### 1. Set Up Test Data Fixtures
Create [`cypress/fixtures/events.json`](cypress/fixtures/events.json:1) with sample data:

```json
{
  "events": [
    {
      "event_id": 1,
      "event_name": "Future Yoga Workshop",
      "description": "A wonderful yoga workshop",
      "start_date": "2025-12-15",
      "start_time": "10:00:00",
      "city_slug": "hamburg",
      "slug": "future-yoga-workshop",
      "max_participants": 20,
      "price": 49.99,
      "first_name": "Anna",
      "last_name": "Müller",
      "trainer_bio": "Experienced yoga teacher"
    },
    {
      "event_id": 2,
      "event_name": "Past Yoga Workshop",
      "description": "A past yoga workshop",
      "start_date": "2024-01-15",
      "start_time": "10:00:00",
      "city_slug": "berlin",
      "slug": "past-yoga-workshop",
      "max_participants": 15,
      "price": 39.99,
      "first_name": "Tom",
      "last_name": "Schmidt",
      "trainer_bio": "Yoga enthusiast"
    }
  ]
}
```

### 2. Enhance Prisma Seed Files
Modify [`prisma/seed-e2e-test.ts`](prisma/seed-e2e-test.ts:1) to include test users and events:

```typescript
// prisma/seed-e2e-test.ts
export async function seedTestData() {
  // Create test users
  await prisma.user.createMany({
    data: [
      {
        email: 'teacher@test.com',
        name: 'Test Teacher',
        role: 'teacher',
      },
      {
        email: 'student@test.com',
        name: 'Test Student',
        role: 'student',
      }
    ]
  });

  // Create test events
  await prisma.event.createMany({
    data: [
      {
        event_name: 'Future Yoga Workshop',
        description: 'A wonderful yoga workshop',
        start_date: new Date(Date.now() + 86400000), // Tomorrow
        start_time: '10:00:00',
        city_slug: 'hamburg',
        slug: 'future-yoga-workshop',
        max_participants: 20,
        price: 49.99,
        trainer_id: 1, // Assuming trainer ID 1 exists
        active: true
      },
      {
        event_name: 'Past Yoga Workshop',
        description: 'A past yoga workshop',
        start_date: new Date(Date.now() - 86400000), // Yesterday
        start_time: '10:00:00',
        city_slug: 'berlin',
        slug: 'past-yoga-workshop',
        max_participants: 15,
        price: 39.99,
        trainer_id: 1,
        active: true
      }
    ]
  });
}
```

### 3. Implement Event Creation Tests
Create [`cypress/e2e/events/event-creation.cy.ts`](cypress/e2e/events/event-creation.cy.ts:1):

```typescript
describe('Event Creation Flow', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/event/neu');
  });

  it('successfully creates a new event', () => {
    cy.intercept('POST', '/api/event/create', {
      statusCode: 200,
      body: { success: true, eventId: 123, slug: 'test-yoga-workshop' }
    }).as('createEvent');

    // Fill out the form
    cy.get('input[name="event_name"]').type('Test Yoga Workshop');
    cy.get('textarea[name="description"]').type('A wonderful yoga workshop');
    cy.get('input[name="start_date"]').type('2025-12-15');
    cy.get('input[name="start_time"]').type('10:00');
    
    cy.get('button[type="submit"]').click();
    
    cy.wait('@createEvent');
    cy.url().should('include', '/events/test-yoga-workshop');
  });

  it('shows permission error for non-teacher users', () => {
    cy.loginAsStudent();
    cy.visit('/event/neu');
    cy.contains('Sie haben nicht die Berechtigung').should('be.visible');
  });

  it('redirects unauthenticated users to login', () => {
    cy.logout();
    cy.visit('/event/neu');
    cy.url().should('include', '/login');
  });
});
```

### 4. Implement Event Listing Tests
Create [`cypress/e2e/events/event-listing.cy.ts`](cypress/e2e/events/event-listing.cy.ts:1):

```typescript
describe('Event Listing Page', () => {
  beforeEach(() => {
    cy.intercept('/api/events', { fixture: 'events.json' }).as('getEvents');
    cy.visit('/events');
    cy.wait('@getEvents');
  });

  it('displays future events only', () => {
    cy.get('[data-testid="event-card"]').should('have.length', 1);
    cy.contains('Future Yoga Workshop').should('be.visible');
    cy.contains('Past Yoga Workshop').should('not.exist');
  });

  it('navigates to event details', () => {
    cy.get('[data-testid="event-card"] a').first().click();
    cy.url().should('include', '/events/future-yoga-workshop');
  });

  it('displays event information correctly', () => {
    cy.get('[data-testid="event-card"]').first().within(() => {
      cy.contains('Future Yoga Workshop').should('be.visible');
      cy.contains('49,99 €').should('be.visible');
      cy.contains('Max. 20 Teilnehmer').should('be.visible');
    });
  });
});
```

### 5. Implement Event Details Tests
Create [`cypress/e2e/events/event-details.cy.ts`](cypress/e2e/events/event-details.cy.ts:1):

```typescript
describe('Event Details Page', () => {
  beforeEach(() => {
    cy.intercept('/api/events/future-yoga-workshop', {
      fixture: 'event-details.json'
    }).as('getEvent');
    
    cy.visit('/events/future-yoga-workshop');
    cy.wait('@getEvent');
  });

  it('displays complete event information', () => {
    cy.get('h1').should('contain', 'Future Yoga Workshop');
    cy.contains('Trainer').should('be.visible');
    cy.contains('Datum').should('be.visible');
    cy.contains('49,99 €').should('be.visible');
  });

  it('shows payment section for paid events', () => {
    cy.get('[data-testid="payment-section"]').should('be.visible');
  });

  it('shows edit button for event owner', () => {
    cy.loginAsTeacher();
    cy.visit('/events/future-yoga-workshop');
    cy.contains('Event bearbeiten').should('be.visible');
  });

  it('does not show edit button for non-owners', () => {
    cy.loginAsStudent();
    cy.visit('/events/future-yoga-workshop');
    cy.contains('Event bearbeiten').should('not.exist');
  });
});
```

### 6. Add Data Test IDs to Components
Enhance your React components with `data-testid` attributes for reliable testing:

```tsx
// In event card component
<div data-testid="event-card">
  {/* content */}
</div>

// In payment section
<div data-testid="payment-section">
  {/* payment form */}
</div>
```

## Running the Tests

1. **Start the development server**: `npm run dev`
2. **Seed test data**: `npx prisma db seed -- --test`
3. **Run Cypress**:
   - Interactive mode: `npx cypress open`
   - Headless mode: `npx cypress run`
4. **Clean up** (optional): `npx tsx prisma/cleanup-e2e-test.ts`

## Best Practices

- **Mock API responses** to avoid test flakiness and external dependencies
- **Use fixtures** for consistent test data across runs
- **Add data-testid attributes** instead of relying on CSS selectors
- **Test both success and error scenarios** comprehensively
- **Run tests in CI/CD** with headless mode for automation
- **Clean up test data** after test runs to maintain database state

## Next Steps

1. Implement the custom commands in [`cypress/support/commands.ts`](cypress/support/commands.ts:1)
2. Create the test fixture files
3. Enhance the Prisma seed file for test data
4. Implement the three test files in `cypress/e2e/events/`
5. Add data-testid attributes to key components
6. Test the implementation and refine as needed

This plan provides a comprehensive foundation for end-to-end testing of your event features with proper authentication handling.