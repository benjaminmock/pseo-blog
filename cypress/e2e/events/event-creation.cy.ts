describe("Event Creation Flow", () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit("/event/neu");
  });

  it("successfully creates a new event", () => {
    cy.intercept("POST", "/api/event/create", {
      statusCode: 200,
      body: { success: true, eventId: 123, slug: "test-yoga-workshop" },
    }).as("createEvent");

    // Wait for form to be visible and fill out the form using data-testid
    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type("Test Yoga Workshop");
    cy.get('[data-testid="description-textarea"]').type(
      "A wonderful yoga workshop"
    );
    cy.get('[data-testid="start-date-input"]').type("2025-12-15");
    cy.get('[data-testid="start-time-input"]').type("10:00");

    // Configure as online-only event to avoid city selection requirement
    cy.get('#is_in_person').uncheck();
    cy.get('#is_online').check();
    
    // Fill in required online fields
    cy.get('#online_url').type('https://zoom.us/j/123456789');

    cy.get('[data-testid="submit-button"]').click();

    cy.wait("@createEvent");
    cy.url().should("include", "/events/test-yoga-workshop");
  });

  // it('shows validation errors for empty required fields', () => {
  //   // Wait for form to be visible then click submit without filling fields
  //   cy.get('[data-testid="submit-button"]').should('be.visible').click();

  //   // Check for HTML5 validation or custom validation messages
  //   cy.get('[data-testid="event-name-input"]').then(($input) => {
  //     expect($input[0].validationMessage).to.not.be.empty;
  //   });
  // });

  // it('shows permission error for non-teacher users', () => {
  //   cy.loginAsStudent();
  //   cy.visit('/event/neu');
  //   cy.contains('Sie haben nicht die Berechtigung, Events zu erstellen').should('be.visible');
  // });

  // it('redirects unauthenticated users to login', () => {
  //   cy.logout();
  //   cy.visit('/event/neu');
  //   cy.url().should('include', '/login');
  // });

  // it('handles server errors gracefully', () => {
  //   cy.intercept('POST', '/api/event/create', {
  //     statusCode: 500,
  //     body: { error: 'Internal server error' }
  //   }).as('createEventError');

  //   cy.get('[data-testid="event-name-input"]').should('be.visible').type('Test Event');
  //   cy.get('[data-testid="description-textarea"]').type('Test description');
  //   cy.get('[data-testid="start-date-input"]').type('2025-12-15');
  //   cy.get('[data-testid="start-time-input"]').type('10:00');

  //   cy.get('[data-testid="submit-button"]').click();

  //   cy.wait('@createEventError');
  //   // Check for error message in the form
  //   cy.contains('Ein Fehler ist aufgetreten').should('be.visible');
  // });

  // it('validates date is in the future', () => {
  //   cy.get('[data-testid="event-name-input"]').should('be.visible').type('Test Event');
  //   cy.get('[data-testid="description-textarea"]').type('Test description');
  //   cy.get('[data-testid="start-date-input"]').type('2020-01-01'); // Past date
  //   cy.get('[data-testid="start-time-input"]').type('10:00');

  //   cy.get('[data-testid="submit-button"]').click();

  //   // This validation might be client-side or server-side
  //   cy.contains('Das Startdatum muss in der Zukunft liegen').should('be.visible');
  // });

  // it('allows setting optional fields', () => {
  //   cy.intercept('POST', '/api/event/create', {
  //     statusCode: 200,
  //     body: { success: true, eventId: 124, slug: 'advanced-yoga-workshop' }
  //   }).as('createAdvancedEvent');

  //   cy.get('[data-testid="event-name-input"]').should('be.visible').type('Advanced Yoga Workshop');
  //   cy.get('[data-testid="description-textarea"]').type('An advanced yoga workshop');
  //   cy.get('[data-testid="start-date-input"]').type('2025-12-20');
  //   cy.get('[data-testid="start-time-input"]').type('14:00');
  //   cy.get('[data-testid="max-participants-input"]').type('15');
  //   cy.get('[data-testid="price-input"]').type('75.00');

  //   cy.get('[data-testid="submit-button"]').click();

  //   cy.wait('@createAdvancedEvent');
  //   cy.url().should('include', '/events/advanced-yoga-workshop');
  // });
});
