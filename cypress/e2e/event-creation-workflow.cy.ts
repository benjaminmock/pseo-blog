import { TEST_USER } from '../fixtures/test-user';

describe('Event Creation Workflow with Authentication', () => {
  let createdEventSlug: string;

  before(() => {
    // Seed test data before running the test suite
    cy.seedE2EData();
  });

  after(() => {
    // Cleanup test data after all tests complete
    cy.cleanupE2EData();
  });

  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should complete full event lifecycle: authenticate, create, view publicly, and verify', () => {
    // Step 1: Login as test teacher using enhanced auth
    cy.log('🔐 Step 1: Login as test teacher');
    cy.loginAsTestTeacher();
    
    // Debug authentication state
    cy.debugAuth();
    
    // Verify we're logged in by checking the profile page
    cy.visit('/profil');
    cy.contains(TEST_USER.name).should('be.visible');
    cy.contains('Lehrer').should('be.visible');

    // Step 2: Navigate to event creation page
    cy.log('📝 Step 2: Navigate to event creation');
    cy.visit('/event/neu');
    
    // Verify we're on the event creation page and not redirected to login
    cy.url().should('include', '/event/neu');
    cy.contains('Event erstellen').should('be.visible');

    // Step 3: Fill and submit event creation form
    cy.log('✨ Step 3: Create new event');
    const eventName = `E2E Test Event ${Date.now()}`;
    const eventDescription = 'This is a test event created via E2E testing to verify the complete workflow from authentication to public viewing.';
    
    // Fill basic event information
    cy.get('input[name="event_name"]').type(eventName);
    cy.get('textarea[name="description"]').type(eventDescription);
    
    // Set future date (7 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateString = futureDate.toISOString().split('T')[0];
    cy.get('input[name="start_date"]').type(dateString);
    
    // Set time
    cy.get('input[name="start_time"]').type('10:00');
    
    // Set event as in-person (default) and ensure online is unchecked
    cy.get('input[id="is_in_person"]').should('be.checked');
    cy.get('input[id="is_online"]').should('not.be.checked');
    
    // Fill city using the combobox - we'll try to select Hamburg
    cy.get('input[placeholder*="Stadt"]').type('Hamburg');
    cy.wait(500); // Wait for dropdown to appear
    cy.contains('Hamburg').click();
    
    // Fill optional fields
    cy.get('input[name="max_participants"]').type('15');
    cy.get('input[name="price"]').type('49.99');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Step 4: Verify event was created successfully
    cy.log('✅ Step 4: Verify event creation');
    
    // Should be redirected to the event page
    cy.url().should('include', '/events/');
    cy.contains(eventName).should('be.visible');
    
    // Extract event slug for later use
    cy.url().then((url) => {
      const slugMatch = url.match(/\/events\/([^\/]+)/);
      if (slugMatch) {
        createdEventSlug = slugMatch[1];
        cy.log(`📋 Event created with slug: ${createdEventSlug}`);
      }
    });

    // Verify event details are displayed correctly
    cy.contains(eventName).should('be.visible');
    cy.contains(eventDescription).should('be.visible');
    cy.contains('49,99 €').should('be.visible'); // German currency formatting
    cy.contains('15 Teilnehmer').should('be.visible');
    cy.contains(TEST_USER.name).should('be.visible'); // Trainer name

    // Step 5: Verify edit button is visible for event owner
    cy.log('🔧 Step 5: Verify owner permissions');
    cy.contains('Event bearbeiten').should('be.visible');

    // Step 6: Logout and verify public access
    cy.log('🚪 Step 6: Logout and test public access');
    cy.logoutUser();
    
    // Verify we're logged out by visiting profile page
    cy.visit('/profil', { failOnStatusCode: false });
    cy.url().should('include', '/login');

    // Step 7: Verify event is publicly visible
    cy.log('👁️ Step 7: Verify public event access');
    
    // Visit events list page
    cy.visit('/events');
    cy.contains(eventName).should('be.visible');
    
    // Click on the event to view details
    cy.contains(eventName).click();
    
    // Verify we're on the correct event page
    cy.url().should('include', `/events/${createdEventSlug}`);
    
    // Verify all event details are visible to public
    cy.contains(eventName).should('be.visible');
    cy.contains(eventDescription).should('be.visible');
    cy.contains('49,99 €').should('be.visible');
    cy.contains('15 Teilnehmer').should('be.visible');
    cy.contains(TEST_USER.name).should('be.visible');
    
    // Verify edit button is NOT visible for public users
    cy.contains('Event bearbeiten').should('not.exist');
    
    // Verify back link works
    cy.contains('← Zurück zur Event-Übersicht').should('be.visible').click();
    cy.url().should('match', /\/events\/?$/);

    cy.log('🎉 Event creation workflow completed successfully!');
  });

  it('should handle event creation with online option', () => {
    cy.log('🔐 Login for online event test');
    cy.loginAsTestTeacher();
    
    cy.visit('/event/neu');
    
    const eventName = `Online E2E Test Event ${Date.now()}`;
    
    // Fill basic information
    cy.get('input[name="event_name"]').type(eventName);
    cy.get('textarea[name="description"]').type('Online test event');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const dateString = futureDate.toISOString().split('T')[0];
    cy.get('input[name="start_date"]').type(dateString);
    
    // Select online event
    cy.get('input[id="is_online"]').check();
    cy.get('input[id="is_in_person"]').uncheck();
    
    // Fill online-specific fields
    cy.get('input[name="online_url"]').type('https://zoom.us/j/123456789');
    cy.get('input[name="online_platform"]').type('Zoom');
    cy.get('textarea[name="online_instructions"]').type('Meeting-ID: 123 456 789');
    
    cy.get('input[name="price"]').type('29.99');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Verify creation
    cy.url().should('include', '/events/');
    cy.contains(eventName).should('be.visible');
    
    cy.logoutUser();
  });

  it('should handle form validation errors', () => {
    cy.log('🔐 Login for validation test');
    cy.loginAsTestTeacher();
    
    cy.visit('/event/neu');
    
    // Try to submit empty form
    cy.get('button[type="submit"]').click();
    
    // Should see validation errors (HTML5 validation will prevent submission)
    cy.get('input[name="event_name"]:invalid').should('exist');
    cy.get('input[name="start_date"]:invalid').should('exist');
    
    // Fill required fields but uncheck both event types
    cy.get('input[name="event_name"]').type('Test Event');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateString = futureDate.toISOString().split('T')[0];
    cy.get('input[name="start_date"]').type(dateString);
    
    cy.get('input[id="is_in_person"]').uncheck();
    cy.get('input[id="is_online"]').should('not.be.checked');
    
    cy.get('button[type="submit"]').click();
    
    // Should see custom validation error
    cy.contains('Event muss mindestens eine Veranstaltungsart unterstützen').should('be.visible');
    
    cy.logoutUser();
  });

  it('should prevent unauthorized access to event creation', () => {
    cy.log('🔒 Test unauthorized access prevention');
    
    // Try to access event creation without login
    cy.visit('/event/neu', { failOnStatusCode: false });
    
    // Should be redirected to login
    cy.url().should('include', '/login');
    
    // Verify we can't access the form
    cy.contains('Event erstellen').should('not.exist');
  });

  it('should handle authentication persistence across page reloads', () => {
    cy.log('🔄 Test session persistence');
    
    cy.loginAsTestTeacher();
    cy.visit('/event/neu');
    
    // Verify we're on the creation page
    cy.contains('Event erstellen').should('be.visible');
    
    // Reload the page
    cy.reload();
    
    // Should still be authenticated and on the creation page
    cy.contains('Event erstellen').should('be.visible');
    cy.url().should('include', '/event/neu');
    
    cy.logoutUser();
  });
});