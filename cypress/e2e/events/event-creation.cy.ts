describe("Event Creation Flow", () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit("/event/neu");
  });

  it("successfully creates a new event", () => {
    // Generate a unique event name to avoid conflicts
    const timestamp = Date.now();
    const eventName = `Test Yoga Workshop ${timestamp}`;
    const expectedSlug = `test-yoga-workshop-${timestamp}`;

    // Wait for form to be visible and fill out the form using data-testid
    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type(eventName);
    cy.get('[data-testid="description-textarea"]').type(
      "A wonderful yoga workshop for testing"
    );
    cy.get('[data-testid="start-date-input"]').type("2025-12-15");
    cy.get('[data-testid="start-time-input"]').type("10:00");

    // Configure as online-only event to avoid city selection requirement
    cy.get("#is_in_person").uncheck();
    cy.get("#is_online").check();

    // Fill in required online fields
    cy.get("#online_url").type("https://zoom.us/j/123456789");

    cy.get('[data-testid="submit-button"]').click();

    // Wait for redirect to event detail page (real backend call)
    cy.url().should("include", "/events/");
    cy.url().should("include", "test-yoga-workshop");

    // Verify the event page loads and shows our created event
    cy.contains(eventName).should("be.visible");
    cy.contains("A wonderful yoga workshop for testing").should("be.visible");
  });

  it("shows validation errors for empty required fields", () => {
    // Wait for form to be visible then click submit without filling fields
    cy.get('[data-testid="submit-button"]').should("be.visible").click();

    // Check for HTML5 validation or custom validation messages
    cy.get('[data-testid="event-name-input"]').then(($input) => {
      expect($input[0].validationMessage).to.not.be.empty;
    });
  });

  it("shows permission error for non-teacher users", () => {
    cy.loginAsStudent();
    cy.visit("/event/neu");
    cy.contains("Sie haben nicht die Berechtigung, Events zu erstellen", { timeout: 10000 }).should(
      "be.visible"
    );
  });

  it("redirects unauthenticated users to login", () => {
    cy.logout();
    cy.visit("/event/neu");
    // The redirect might go through the dashboard first, so we check for either
    cy.url().should("satisfy", (url) => {
      return url.includes("/login") || url.includes("/anbieter-dashboard");
    });
  });

  it("handles server errors gracefully", () => {
    cy.intercept("POST", "/api/event/create", {
      statusCode: 500,
      body: { error: "Internal server error" },
    }).as("createEventError");

    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type("Test Event");
    cy.get('[data-testid="description-textarea"]').type("Test description");
    cy.get('[data-testid="start-date-input"]').type("2025-12-15");
    cy.get('[data-testid="start-time-input"]').type("10:00");

    // Configure as online-only event to avoid city selection requirement
    cy.get("#is_in_person").uncheck();
    cy.get("#is_online").check();
    cy.get("#online_url").type("https://zoom.us/j/123456789");

    cy.get('[data-testid="submit-button"]').click();

    cy.wait("@createEventError");
    // Check for error message in the form - look for any error indication
    cy.get('body').should('satisfy', ($body) => {
      const text = $body.text();
      return text.includes('Fehler') || text.includes('Error') || text.includes('Internal server error');
    });
  });

  it("validates date is in the future", () => {
    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type("Test Event");
    cy.get('[data-testid="description-textarea"]').type("Test description");
    cy.get('[data-testid="start-date-input"]').type("2020-01-01"); // Past date
    cy.get('[data-testid="start-time-input"]').type("10:00");

    cy.get('[data-testid="submit-button"]').click();

    // This validation might be client-side or server-side
    cy.contains("Das Startdatum muss in der Zukunft liegen").should(
      "be.visible"
    );
  });

  it("allows setting optional fields", () => {
    // Generate a unique event name to avoid conflicts
    const timestamp = Date.now();
    const eventName = `Advanced Yoga Workshop ${timestamp}`;

    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type(eventName);
    cy.get('[data-testid="description-textarea"]').type(
      "An advanced yoga workshop"
    );
    cy.get('[data-testid="start-date-input"]').type("2025-12-20");
    cy.get('[data-testid="start-time-input"]').type("14:00");
    cy.get('[data-testid="max-participants-input"]').type("15");
    cy.get('[data-testid="price-input"]').type("75.00");

    // Configure as online-only event to avoid city selection requirement
    cy.get("#is_in_person").uncheck();
    cy.get("#is_online").check();
    cy.get("#online_url").type("https://zoom.us/j/123456789");

    cy.get('[data-testid="submit-button"]').click();

    // Wait for redirect to event detail page (real backend call)
    cy.url().should("include", "/events/");
    cy.url().should("include", "advanced-yoga-workshop");
  });
});
