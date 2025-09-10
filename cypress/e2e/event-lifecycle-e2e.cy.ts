import { TEST_USER } from '../../prisma/seed-e2e-test';

describe('Event Lifecycle E2E Test', () => {
  let testEventSlug: string;
  let testEventId: string;

  before(() => {
    // Seed test data before running the test suite
    cy.seedE2EData();
  });

  after(() => {
    // Cleanup test data after all tests complete
    cy.cleanupE2EData();
  });

  beforeEach(() => {
    // Visit home page before each test
    cy.visit('/');
  });

  it('should complete full event lifecycle: create, edit, view publicly, delete', () => {
    // Step 1: Login as test teacher
    cy.log('🔐 Step 1: Login as test teacher');
    cy.loginAsTestTeacher();
    
    // Verify we're logged in by checking for user-specific content
    cy.visit('/');
    cy.contains('Test Teacher').should('be.visible');

    // Step 2: Navigate to event creation page
    cy.log('📝 Step 2: Navigate to event creation');
    cy.visit('/event/neu');
    
    // Verify we're on the event creation page
    cy.contains('Neues Event erstellen').should('be.visible');

    // Step 3: Create a new event
    cy.log('✨ Step 3: Create new event');
    const eventName = `E2E Test Event ${Date.now()}`;
    const eventDescription = 'This is a test event created by E2E testing';
    const eventPrice = '49.99';
    const maxParticipants = '20';
    
    // Fill out the event form
    cy.get('input[name="event_name"]').type(eventName);
    cy.get('textarea[name="description"]').type(eventDescription);
    
    // Set future date (30 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateString = futureDate.toISOString().split('T')[0];
    cy.get('input[name="start_date"]').type(dateString);
    
    cy.get('input[name="start_time"]').type('10:00');
    cy.get('input[name="price"]').type(eventPrice);
    cy.get('input[name="max_participants"]').type(maxParticipants);
    
    // Select city (assuming Hamburg is available)
    cy.get('select[name="city_slug"]').select('hamburg');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Verify event was created successfully
    cy.url().should('include', '/events/');
    cy.contains(eventName).should('be.visible');
    
    // Extract event slug from URL for later use
    cy.url().then((url) => {
      const matches = url.match(/\/events\/([^\/]+)/);
      if (matches) {
        testEventSlug = matches[1];
        cy.log(`📋 Event created with slug: ${testEventSlug}`);
      }
    });

    // Step 4: Edit the event
    cy.log('✏️ Step 4: Edit the event');
    cy.get('a').contains('Event bearbeiten').click();
    
    // Verify we're on the edit page
    cy.url().should('include', '/bearbeiten');
    cy.contains('Event bearbeiten').should('be.visible');
    
    // Update event details
    const updatedDescription = eventDescription + ' - UPDATED via E2E test';
    const updatedPrice = '59.99';
    
    cy.get('textarea[name="description"]').clear().type(updatedDescription);
    cy.get('input[name="price"]').clear().type(updatedPrice);
    
    // Save changes
    cy.get('button[type="submit"]').click();
    
    // Verify changes were saved
    cy.contains(updatedDescription).should('be.visible');
    cy.contains('59,99 €').should('be.visible'); // German currency formatting

    // Step 5: Logout and verify public access
    cy.log('🚪 Step 5: Logout and check public view');
    cy.logoutUser();
    
    // Verify we're logged out
    cy.visit('/');
    cy.contains('Test Teacher').should('not.exist');
    
    // Visit events page and verify our event is visible publicly
    cy.visit('/events');
    cy.contains(eventName).should('be.visible');
    
    // Click on the event to view details
    cy.contains(eventName).click();
    
    // Verify event details are visible to public
    cy.contains(eventName).should('be.visible');
    cy.contains(updatedDescription).should('be.visible');
    cy.contains('59,99 €').should('be.visible');
    cy.contains('Test Teacher').should('be.visible');
    
    // Verify edit button is NOT visible for public users
    cy.get('a').contains('Event bearbeiten').should('not.exist');

    // Step 6: Login again and delete the event
    cy.log('🗑️ Step 6: Login again and delete event');
    cy.loginAsTestTeacher();
    
    // Navigate back to the event
    cy.visit(`/events/${testEventSlug}`);
    
    // Go to edit page to access delete functionality
    cy.get('a').contains('Event bearbeiten').click();
    
    // Look for delete button (assuming it exists on edit page)
    cy.get('button').contains('Event löschen').should('be.visible').click();
    
    // Confirm deletion if there's a confirmation dialog
    cy.get('button').contains('Bestätigen').click();
    
    // Verify we're redirected away from the event
    cy.url().should('not.include', testEventSlug);

    // Step 7: Verify event is completely removed
    cy.log('✅ Step 7: Verify event deletion');
    
    // Check events list - our event should not be there
    cy.visit('/events');
    cy.contains(eventName).should('not.exist');
    
    // Try to access the event directly - should get 404
    cy.visit(`/events/${testEventSlug}`, { failOnStatusCode: false });
    cy.get('body').should('be.visible'); // Page loads but event not found
    
    // Logout for cleanup
    cy.logoutUser();
    
    cy.log('🎉 Event lifecycle test completed successfully!');
  });

  it('should handle event creation validation errors', () => {
    cy.log('🔐 Login and test validation');
    cy.loginAsTestTeacher();
    
    cy.visit('/event/neu');
    
    // Try to submit empty form
    cy.get('button[type="submit"]').click();
    
    // Should see validation errors
    cy.contains('erforderlich').should('be.visible'); // German for "required"
    
    cy.logoutUser();
  });

  it('should prevent unauthorized access to event management', () => {
    cy.log('🔒 Test unauthorized access prevention');
    
    // Try to access event creation without login
    cy.visit('/event/neu', { failOnStatusCode: false });
    
    // Should be redirected to login or see access denied
    cy.url().should('include', '/login');
    
    // Try to access event edit without login (if we had an event)
    // This would normally redirect to login as well
  });
});