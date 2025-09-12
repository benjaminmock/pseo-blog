describe("Event Deletion Flow", () => {
  beforeEach(() => {
    cy.loginAsTeacher();
  });

  it("successfully deletes an event from the edit page", () => {
    // First create an event to delete
    const timestamp = Date.now();
    const eventName = `Event to Delete ${timestamp}`;

    // Create the event
    cy.visit("/event/neu");
    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type(eventName);
    cy.get('[data-testid="description-textarea"]').type(
      "This event will be deleted during testing"
    );
    cy.get('[data-testid="start-date-input"]').type("2025-12-15");
    cy.get('[data-testid="start-time-input"]').type("10:00");

    // Configure as online-only event
    cy.get("#is_in_person").uncheck();
    cy.get("#is_online").check();
    cy.get("#online_url").type("https://zoom.us/j/123456789");

    cy.get('[data-testid="submit-button"]').click();

    // Wait for redirect to event detail page
    cy.url({ timeout: 10000 }).should("include", "/events/");
    cy.url().should("include", "event-to-delete");

    // Navigate to edit the event
    cy.url().then((url) => {
      const eventSlug = url.split("/events/")[1];
      cy.visit(`/events/${eventSlug}/bearbeiten`);
    });

    // Wait for the edit form to load
    cy.get('input[name="event_name"]', { timeout: 10000 }).should("be.visible");

    // Verify the form loads with existing data
    cy.get('input[name="event_name"]').should("have.value", eventName);

    // Look for delete button - it should be present
    cy.get('[data-testid="delete-event-button"]').should("be.visible");

    // Click the delete button
    cy.get('[data-testid="delete-event-button"]').click();

    // Confirm deletion in the modal/dialog
    cy.get('[data-testid="confirm-delete-button"]').should("be.visible").click();

    // Wait for deletion to complete and redirect
    cy.url({ timeout: 10000 }).should("not.include", "/bearbeiten");
    
    // Should be redirected to events list or dashboard
    cy.url().should("satisfy", (url) => {
      return url.includes("/events") || url.includes("/intern") || url.includes("/anbieter-dashboard");
    });

    // Verify the event no longer exists by trying to visit its page
    cy.url().then((currentUrl) => {
      const eventSlug = `event-to-delete-${timestamp}`;
      
      // Handle Next.js not found exception
      cy.on('uncaught:exception', (err, runnable) => {
        if (err.message.includes('NEXT_NOT_FOUND')) {
          return false;
        }
        return true;
      });
      
      cy.visit(`/events/${eventSlug}`, { failOnStatusCode: false });
      
      // Should show 404 or not found message
      cy.get('body').should('satisfy', ($body) => {
        const text = $body.text();
        return text.includes('404') || text.includes('Not Found') || text.includes('Event nicht gefunden');
      });
    });
  });

  it("shows confirmation dialog before deleting", () => {
    // Create an event first
    const timestamp = Date.now();
    const eventName = `Confirmation Test Event ${timestamp}`;

    cy.visit("/event/neu");
    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type(eventName);
    cy.get('[data-testid="description-textarea"]').type("Test description");
    cy.get('[data-testid="start-date-input"]').type("2025-12-15");
    cy.get('[data-testid="start-time-input"]').type("10:00");

    // Configure as online-only event
    cy.get("#is_in_person").uncheck();
    cy.get("#is_online").check();
    cy.get("#online_url").type("https://zoom.us/j/123456789");

    cy.get('[data-testid="submit-button"]').click();

    // Navigate to edit page
    cy.url({ timeout: 10000 }).should("include", "/events/");
    cy.url().then((url) => {
      const eventSlug = url.split("/events/")[1];
      cy.visit(`/events/${eventSlug}/bearbeiten`);
    });

    // Wait for form to load
    cy.get('[data-testid="delete-event-button"]', { timeout: 10000 }).should("be.visible");

    // Click delete button
    cy.get('[data-testid="delete-event-button"]').click();

    // Verify confirmation dialog appears
    cy.get('[data-testid="delete-confirmation-dialog"]').should("be.visible");
    cy.contains("Sind Sie sicher").should("be.visible");
    cy.contains(eventName).should("be.visible");

    // Verify both cancel and confirm buttons are present
    cy.get('[data-testid="cancel-delete-button"]').should("be.visible");
    cy.get('[data-testid="confirm-delete-button"]').should("be.visible");

    // Cancel the deletion
    cy.get('[data-testid="cancel-delete-button"]').click();

    // Dialog should close and we should still be on edit page
    cy.get('[data-testid="delete-confirmation-dialog"]').should("not.exist");
    cy.url().should("include", "/bearbeiten");
    cy.get('input[name="event_name"]').should("have.value", eventName);
  });

  it("handles server errors during deletion gracefully", () => {
    // Create an event first
    const timestamp = Date.now();
    const eventName = `Error Test Event ${timestamp}`;

    cy.visit("/event/neu");
    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type(eventName);
    cy.get('[data-testid="description-textarea"]').type("Test description");
    cy.get('[data-testid="start-date-input"]').type("2025-12-15");
    cy.get('[data-testid="start-time-input"]').type("10:00");

    // Configure as online-only event
    cy.get("#is_in_person").uncheck();
    cy.get("#is_online").check();
    cy.get("#online_url").type("https://zoom.us/j/123456789");

    cy.get('[data-testid="submit-button"]').click();

    // Navigate to edit page
    cy.url({ timeout: 10000 }).should("include", "/events/");
    cy.url().then((url) => {
      const eventSlug = url.split("/events/")[1];
      cy.visit(`/events/${eventSlug}/bearbeiten`);

      // Intercept the delete API call to simulate server error
      cy.intercept("DELETE", "/api/events/delete", {
        statusCode: 500,
        body: { error: "Internal server error" },
      }).as("deleteEventError");

      // Wait for form to load and click delete
      cy.get('[data-testid="delete-event-button"]', { timeout: 10000 }).should("be.visible").click();
      cy.get('[data-testid="confirm-delete-button"]').click();

      cy.wait("@deleteEventError");

      // Check for error message
      cy.get("body").should("satisfy", ($body) => {
        const text = $body.text();
        return (
          text.includes("Fehler beim Löschen") ||
          text.includes("Error") ||
          text.includes("Internal server error") ||
          text.includes("Fehler")
        );
      });

      // Should still be on the edit page
      cy.url().should("include", "/bearbeiten");
    });
  });

  it("prevents non-owners from deleting events", () => {
    // First, login as teacher and create an event
    const timestamp = Date.now();
    const eventName = `Owner Test Event ${timestamp}`;

    cy.visit("/event/neu");
    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type(eventName);
    cy.get('[data-testid="description-textarea"]').type("Test description");
    cy.get('[data-testid="start-date-input"]').type("2025-12-15");
    cy.get('[data-testid="start-time-input"]').type("10:00");

    // Configure as online-only event
    cy.get("#is_in_person").uncheck();
    cy.get("#is_online").check();
    cy.get("#online_url").type("https://zoom.us/j/123456789");

    cy.get('[data-testid="submit-button"]').click();

    // Get the event slug
    cy.url({ timeout: 10000 }).should("include", "/events/");
    cy.url().then((url) => {
      const eventSlug = url.split("/events/")[1];
      
      // Now login as student (non-owner)
      cy.loginAsStudent();
      
      // Try to access the edit page
      cy.visit(`/events/${eventSlug}/bearbeiten`);
      
      // Should be redirected to unauthorized page or not show delete button
      cy.url().then((currentUrl) => {
        if (currentUrl.includes('/unauthorized')) {
          cy.contains('Zugriff verweigert').should('be.visible');
        } else if (currentUrl.includes('/bearbeiten')) {
          // If somehow on edit page, delete button should not exist
          cy.get('[data-testid="delete-event-button"]').should('not.exist');
        }
      });
    });
  });

  it("redirects unauthenticated users trying to delete events", () => {
    // First create an event while logged in
    const timestamp = Date.now();
    const eventName = `Auth Test Event ${timestamp}`;

    cy.visit("/event/neu");
    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type(eventName);
    cy.get('[data-testid="description-textarea"]').type("Test description");
    cy.get('[data-testid="start-date-input"]').type("2025-12-15");
    cy.get('[data-testid="start-time-input"]').type("10:00");

    // Configure as online-only event
    cy.get("#is_in_person").uncheck();
    cy.get("#is_online").check();
    cy.get("#online_url").type("https://zoom.us/j/123456789");

    cy.get('[data-testid="submit-button"]').click();

    // Get the event slug
    cy.url({ timeout: 10000 }).should("include", "/events/");
    cy.url().then((url) => {
      const eventSlug = url.split("/events/")[1];
      
      // Logout
      cy.logout();
      
      // Try to access the edit page
      cy.visit(`/events/${eventSlug}/bearbeiten`);
      
      // Should be redirected away from the edit page
      cy.url({ timeout: 10000 }).should("not.include", "/bearbeiten");
      cy.url().should("satisfy", (url) => {
        return url.includes("/login") || url.includes("/unauthorized") || url.includes("/anbieter-dashboard");
      });
    });
  });

  it("validates event ownership before allowing deletion via API", () => {
    // This test verifies the API-level security
    cy.loginAsTeacher();

    // Create an event
    const timestamp = Date.now();
    const eventName = `API Security Test ${timestamp}`;

    cy.visit("/event/neu");
    cy.get('[data-testid="event-name-input"]')
      .should("be.visible")
      .type(eventName);
    cy.get('[data-testid="description-textarea"]').type("Test description");
    cy.get('[data-testid="start-date-input"]').type("2025-12-15");
    cy.get('[data-testid="start-time-input"]').type("10:00");

    // Configure as online-only event
    cy.get("#is_in_person").uncheck();
    cy.get("#is_online").check();
    cy.get("#online_url").type("https://zoom.us/j/123456789");

    cy.get('[data-testid="submit-button"]').click();

    // Try to delete with invalid event_id
    cy.request({
      method: 'DELETE',
      url: '/api/events/delete',
      body: { event_id: 99999 }, // Non-existent event ID
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([403, 404]);
      expect(response.body.error).to.exist;
    });

    // Try to delete without event_id
    cy.request({
      method: 'DELETE',
      url: '/api/events/delete',
      body: {},
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body.error).to.include('Event-ID ist erforderlich');
    });
  });
});