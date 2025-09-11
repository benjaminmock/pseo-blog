describe("Event Editing Debug", () => {
  beforeEach(() => {
    cy.loginAsTeacher();
  });

  it("debugs the editing flow step by step", () => {
    // Create an event first
    const timestamp = Date.now();
    const eventName = `Debug Event ${timestamp}`;

    cy.visit("/event/neu");
    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type(eventName);
    cy.get('[data-testid="description-textarea"]').type("Debug description");
    cy.get('[data-testid="start-date-input"]').type("2025-12-15");
    cy.get('[data-testid="start-time-input"]').type("10:00");

    // Configure as online-only event
    cy.get("#is_in_person").uncheck();
    cy.get("#is_online").check();
    cy.get("#online_url").type("https://zoom.us/j/123456789");

    cy.get('[data-testid="submit-button"]').click();

    // Wait for redirect and navigate to edit
    cy.url().should("include", "/events/");
    cy.url().then((url) => {
      const eventSlug = url.split("/events/")[1];
      cy.log(`Event slug: ${eventSlug}`);
      cy.visit(`/events/${eventSlug}/bearbeiten`);
    });

    // Check if the form loads correctly
    cy.get('input[name="event_name"]').should("exist");
    cy.get("#is_online").should("exist");
    cy.get("#is_in_person").should("exist");

    // Log current state
    cy.get("#is_online").then(($checkbox) => {
      cy.log(`Online checkbox checked: ${$checkbox.is(":checked")}`);
    });

    cy.get("#is_in_person").then(($checkbox) => {
      cy.log(`In-person checkbox checked: ${$checkbox.is(":checked")}`);
    });

    // Try to clear online URL and submit to test validation
    cy.get("#online_url").should("be.visible").clear();
    
    // Log what we're about to click
    cy.contains("button", "Änderungen speichern").should("exist").then(($btn) => {
      cy.log(`Found submit button: ${$btn.text()}`);
    });

    // Submit and see what happens
    cy.contains("button", "Änderungen speichern").click();

    // Wait a moment and check for any error messages
    cy.wait(2000);
    
    // Log the current URL
    cy.url().then((url) => {
      cy.log(`Current URL after submit: ${url}`);
    });

    // Check if any error message appears anywhere on the page
    cy.get("body").then(($body) => {
      const text = $body.text();
      cy.log(`Page content includes error: ${text.includes("Online-URL ist für Online-Events erforderlich")}`);
      cy.log(`Page content includes validation: ${text.includes("erforderlich")}`);
      cy.log(`Page content includes URL: ${text.includes("URL")}`);
    });

    // Check for any error divs - use a different approach
    cy.get("body").then(($body) => {
      if ($body.find("div:contains('Online-URL')").length > 0) {
        cy.log("Found error message div");
      } else {
        cy.log("No error message div found");
      }
    });
  });

  it("debugs event name change and redirect", () => {
    // Create an event first
    const timestamp = Date.now();
    const originalName = `Original ${timestamp}`;
    const newName = `Updated ${timestamp}`;

    cy.visit("/event/neu");
    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type(originalName);
    cy.get('[data-testid="description-textarea"]').type("Debug description");
    cy.get('[data-testid="start-date-input"]').type("2025-12-15");
    cy.get('[data-testid="start-time-input"]').type("10:00");

    // Configure as online-only event
    cy.get("#is_in_person").uncheck();
    cy.get("#is_online").check();
    cy.get("#online_url").type("https://zoom.us/j/123456789");

    cy.get('[data-testid="submit-button"]').click();

    // Wait for redirect and navigate to edit
    cy.url().should("include", "/events/");
    cy.url().then((url) => {
      const eventSlug = url.split("/events/")[1];
      cy.log(`Original event slug: ${eventSlug}`);
      cy.visit(`/events/${eventSlug}/bearbeiten`);
    });

    // Change the event name
    cy.get('input[name="event_name"]').clear().type(newName);

    // Intercept the API call to see what's happening
    cy.intercept("PUT", "/api/events/update").as("updateEvent");

    // Submit the changes
    cy.contains("button", "Änderungen speichern").click();

    // Wait for the API call and log the response
    cy.wait("@updateEvent").then((interception) => {
      cy.log(`API Response: ${JSON.stringify(interception.response?.body)}`);
    });

    // Wait a moment and check the URL
    cy.wait(3000);
    cy.url().then((url) => {
      cy.log(`URL after edit: ${url}`);
    });
  });
});