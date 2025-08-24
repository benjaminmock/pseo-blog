describe("Event CRUD Operations", () => {
  beforeEach(() => {
    cy.logoutViaAPI();

    // Handle uncaught exceptions from Next.js redirects and 404s
    cy.on("uncaught:exception", (err, runnable) => {
      if (
        err.message.includes("NEXT_REDIRECT") ||
        err.message.includes("NEXT_NOT_FOUND")
      ) {
        return false;
      }
    });
  });

  afterEach(() => {
    // Cleanup trainer data after each test
    cy.cleanupTrainer("teacher@example.com");
  });

  describe("Event Creation", () => {
    it("should create a new event successfully", () => {
      // Seed trainer data and login as teacher (seedTrainer now handles both)
      cy.seedTrainer("teacher@example.com", "Test", "Teacher");

      // Mock API endpoints
      cy.intercept("GET", "/api/courses/my", {
        statusCode: 200,
        body: [],
      }).as("getMyCourses");

      cy.intercept("GET", "/api/events/my", {
        statusCode: 200,
        body: [],
      }).as("getMyEvents");

      // Mock trainer data and empty events list
      cy.mockUserData({
        courses: [],
        events: [],
      });

      // // Mock cities API for the city combobox
      // cy.intercept("GET", "/api/cities", {
      //   statusCode: 200,
      //   body: [
      //     { id: 1, city: "Hamburg", slug: "hamburg" },
      //     { id: 2, city: "Berlin", slug: "berlin" },
      //   ],
      // }).as("getCities");

      // Mock successful event creation
      cy.intercept("POST", "/api/event/create", {
        statusCode: 201,
        body: {
          event_id: 1,
          slug: "test-yoga-workshop",
        },
      }).as("createEvent");

      // Navigate to event creation page
      cy.visit("/event/neu");

      // Should be on event creation page
      cy.url().should("include", "/event/neu");

      // Wait for page to load and check if form is visible
      cy.contains("h1", "Event erstellen").should("be.visible");

      // Fill out the event form
      cy.get('input[id="event_name"]').type("Test Yoga Workshop");
      cy.get('textarea[id="description"]').type(
        "Ein wunderbarer Yoga Workshop für Anfänger und Fortgeschrittene."
      );

      // Set date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split("T")[0];
      cy.get('input[id="start_date"]').type(dateString);

      cy.get('input[id="start_time"]').type("10:00");
      cy.get('input[id="max_participants"]').type("20");
      cy.get('input[id="price"]').type("89.00");

      // Submit the form
      cy.get('button[type="submit"]').contains("Event erstellen").click();

      // Verify API call was made
      cy.wait("@createEvent").then((interception) => {
        expect(interception.request.body).to.include({
          event_name: "Test Yoga Workshop",
          description:
            "Ein wunderbarer Yoga Workshop für Anfänger und Fortgeschrittene.",
          start_date: dateString,
          start_time: "10:00",
          max_participants: 20,
          price: 89.0,
        });
      });

      // Should redirect to the new event page
      cy.url().should("include", "/events/test-yoga-workshop");
    });

    it("should handle API errors during event creation", () => {
      // Seed trainer data and login as teacher (seedTrainer now handles both)
      cy.seedTrainer("teacher@example.com", "Test", "Teacher");

      // Mock API endpoints
      cy.intercept("GET", "/api/courses/my", {
        statusCode: 200,
        body: [],
      }).as("getMyCourses");

      cy.intercept("GET", "/api/events/my", {
        statusCode: 200,
        body: [],
      }).as("getMyEvents");

      // Mock trainer data and empty events list
      cy.mockUserData({
        courses: [],
        events: [],
      });

      // Mock API error
      cy.intercept("POST", "/api/event/create", {
        statusCode: 400,
        body: { error: "Event-Name bereits vergeben" },
      }).as("createEventError");

      // Navigate directly to event creation page
      cy.visit("/event/neu");

      // Should be on event creation page
      cy.url().should("include", "/event/neu");

      // Wait for form to load
      cy.contains("h1", "Event erstellen").should("be.visible");

      // Fill out form
      cy.get('input[id="event_name"]').type("Duplicate Event");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      cy.get('input[id="start_date"]').type(
        tomorrow.toISOString().split("T")[0]
      );

      cy.get('button[type="submit"]').contains("Event erstellen").click();

      cy.wait("@createEventError");

      // Should show error message
      cy.contains("Event-Name bereits vergeben").should("be.visible");
    });
  });

  describe("Event Editing", () => {
    it("should edit an existing event successfully", () => {
      // Seed trainer data and login as teacher (seedTrainer now handles both)
      cy.seedTrainer("teacher@example.com", "Test", "Teacher");

      // Initially mock API endpoints for event creation page
      cy.intercept("GET", "/api/courses/my", {
        statusCode: 200,
        body: [],
      }).as("getMyCourses");

      cy.intercept("GET", "/api/events/my", {
        statusCode: 200,
        body: [],
      }).as("getMyEvents");

      cy.mockUserData({
        courses: [],
        events: [],
      });

      // Create event first through the actual API (not mocked)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      cy.visit("/event/neu");
      cy.contains("h1", "Event erstellen").should("be.visible");
      cy.get('input[id="event_name"]').type("Event to Edit");
      cy.get('input[id="start_date"]').type(
        tomorrow.toISOString().split("T")[0]
      );
      cy.get('textarea[id="description"]').type("Original description");
      cy.get('button[type="submit"]').contains("Event erstellen").click();

      // Wait for redirect to event page (this means event was created successfully)
      cy.url().should("include", "/events/");

      // Clear the mocked API endpoints so intern page can fetch real data
      cy.intercept("GET", "/api/events/my").as("getRealEvents");
      cy.intercept("GET", "/api/courses/my").as("getRealCourses");

      // Mock successful event update for the edit operation
      cy.intercept("PUT", "/api/events/update", {
        statusCode: 200,
        body: { success: true },
      }).as("updateEvent");

      // Now visit the intern page to find the edit link
      cy.visit("/intern");

      // Wait for the real events to load
      cy.wait("@getRealEvents");

      // Debug: Check if events are loaded
      cy.get("body").then(($body) => {
        if ($body.text().includes("Events werden geladen")) {
          cy.log("Events are still loading");
        }
        if ($body.text().includes("Sie haben noch keine Events erstellt")) {
          cy.log("No events found message is displayed");
        }
      });

      // Find the event and click edit button with more specific selector
      cy.get(".bg-white.border.rounded-lg", { timeout: 15000 })
        .contains("h3", "Event to Edit")
        .closest(".bg-white.border.rounded-lg")
        .within(() => {
          cy.contains("a", "Bearbeiten").click();
        });

      // Should navigate to edit page
      cy.url().should("include", "/event/");
      cy.url().should("include", "/bearbeiten");

      // Wait for form to load
      cy.contains("Event bearbeiten").should("be.visible");

      // Edit the event
      cy.get('input[id="event_name"]')
        .should("be.visible")
        .clear()
        .type("Updated Event Name");
      cy.get('textarea[id="description"]')
        .should("be.visible")
        .clear()
        .type("Updated description with more details");

      // Submit the form
      cy.get('button[type="submit"]').contains("Änderungen speichern").click();

      // Verify API call was made with updated data
      cy.wait("@updateEvent").then((interception) => {
        expect(interception.request.body).to.include({
          event_name: "Updated Event Name",
          description: "Updated description with more details",
        });
      });
    });

    it("should handle API errors during event update", () => {
      // Seed trainer data and login as teacher (seedTrainer now handles both)
      cy.seedTrainer("teacher@example.com", "Test", "Teacher");

      // Initially mock API endpoints for event creation page
      cy.intercept("GET", "/api/courses/my", {
        statusCode: 200,
        body: [],
      }).as("getMyCourses");

      cy.intercept("GET", "/api/events/my", {
        statusCode: 200,
        body: [],
      }).as("getMyEvents");

      cy.mockUserData({
        courses: [],
        events: [],
      });

      // Create event first through the actual API (not mocked)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      cy.visit("/event/neu");
      cy.contains("h1", "Event erstellen").should("be.visible");
      cy.get('input[id="event_name"]').type("Event for Error Test");
      cy.get('input[id="start_date"]').type(
        tomorrow.toISOString().split("T")[0]
      );
      cy.get('textarea[id="description"]').type("Test description");
      cy.get('button[type="submit"]').contains("Event erstellen").click();

      // Wait for redirect to event page (this means event was created successfully)
      cy.url().should("include", "/events/");

      // Clear the mocked API endpoints so intern page can fetch real data
      cy.intercept("GET", "/api/events/my").as("getRealEvents");
      cy.intercept("GET", "/api/courses/my").as("getRealCourses");

      // Mock API error for the update operation
      cy.intercept("PUT", "/api/events/update", {
        statusCode: 403,
        body: {
          error: "Sie sind nicht berechtigt, dieses Event zu bearbeiten",
        },
      }).as("updateEventError");

      // Now visit the intern page to find the edit link
      cy.visit("/intern");

      // Wait for the real events to load
      cy.wait("@getRealEvents");

      // Find the event and click edit button with more specific selector
      cy.get(".bg-white.border.rounded-lg", { timeout: 15000 })
        .contains("h3", "Event for Error Test")
        .closest(".bg-white.border.rounded-lg")
        .within(() => {
          cy.contains("a", "Bearbeiten").click();
        });

      // Should navigate to edit page
      cy.url().should("include", "/event/");
      cy.url().should("include", "/bearbeiten");

      // Wait for form to load
      cy.contains("Event bearbeiten").should("be.visible");

      cy.get('input[id="event_name"]').clear().type("Updated Name");
      cy.get('button[type="submit"]').contains("Änderungen speichern").click();

      cy.wait("@updateEventError");

      // Should show error message
      cy.contains(
        "Sie sind nicht berechtigt, dieses Event zu bearbeiten"
      ).should("be.visible");
    });
  });

  describe("Event Deletion", () => {
    it("should delete an event successfully", () => {
      // Login as teacher
      cy.login({
        name: "Test Teacher",
        email: "teacher@example.com",
        role: "teacher",
      });

      // Mock user events data with one event
      const mockEvents = [
        {
          event_id: 1,
          event_name: "Event to Delete",
          description: "This event will be deleted",
          start_date: "2024-12-25",
          slug: "event-to-delete",
          trainer_id: 1,
          active: 1,
        },
      ];

      cy.mockUserData({
        courses: [],
        events: mockEvents,
      });

      // Mock successful deletion
      cy.intercept("DELETE", "/api/events/delete", {
        statusCode: 200,
        body: {
          success: true,
          message: 'Event "Event to Delete" wurde erfolgreich gelöscht',
        },
      }).as("deleteEvent");

      // Handle browser confirmation dialog
      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(true);
        cy.stub(win, "alert").as("windowAlert");
      });

      // Visit intern page where events are listed
      cy.visit("/intern");

      // Find the event and click delete button
      cy.contains("Event to Delete").should("be.visible");

      // Find the event card and click the delete button
      cy.contains("Event to Delete")
        .closest(".bg-white.border.rounded-lg")
        .within(() => {
          cy.contains("button", "Löschen").click();
        });

      // Verify API call was made
      cy.wait("@deleteEvent").then((interception) => {
        expect(interception.request.body).to.include({
          event_id: 1,
        });
      });
    });

    it("should navigate to edit page from intern dashboard", () => {
      cy.login({
        name: "Test Teacher",
        email: "teacher@example.com",
        role: "teacher",
      });

      const mockEvents = [
        {
          event_id: 1,
          event_name: "Editable Event",
          description: "This event can be edited",
          start_date: "2024-12-25",
          slug: "editable-event",
          trainer_id: 1,
          active: 1,
        },
      ];

      cy.mockUserData({
        courses: [],
        events: mockEvents,
      });

      cy.visit("/intern");

      // Find the event and click edit button
      cy.contains("Editable Event")
        .closest(".bg-white.border.rounded-lg")
        .within(() => {
          cy.contains("a", "Bearbeiten").click();
        });

      // Should navigate to edit page (ID-based route as used by intern page)
      cy.url().should("include", "/event/");
      cy.url().should("include", "/bearbeiten");
    });
  });

  describe("Event Access via Slug", () => {
    it("should access event via slug after creation", () => {
      // Seed trainer data and login as teacher (seedTrainer now handles both)
      cy.seedTrainer("teacher@example.com", "Test", "Teacher");

      // Mock API endpoints
      cy.intercept("GET", "/api/courses/my", {
        statusCode: 200,
        body: [],
      }).as("getMyCourses");

      cy.intercept("GET", "/api/events/my", {
        statusCode: 200,
        body: [],
      }).as("getMyEvents");

      // Mock trainer data and empty events list
      cy.mockUserData({
        courses: [],
        events: [],
      });

      // Mock successful event creation with slug
      cy.intercept("POST", "/api/event/create", {
        statusCode: 201,
        body: {
          event_id: 1,
          slug: "mein-neues-yoga-event",
        },
      }).as("createEvent");

      // Navigate directly to event creation page
      cy.visit("/event/neu");

      // Should be on event creation page
      cy.url().should("include", "/event/neu");

      // Create event
      cy.contains("h1", "Event erstellen").should("be.visible");
      cy.get('input[id="event_name"]').type("Mein neues Yoga Event");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      cy.get('input[id="start_date"]').type(
        tomorrow.toISOString().split("T")[0]
      );

      cy.get('button[type="submit"]').contains("Event erstellen").click();

      cy.wait("@createEvent");

      // Should redirect to event page with slug
      cy.url().should("include", "/events/mein-neues-yoga-event");
    });
  });

  describe("Event Form Validation", () => {
    beforeEach(() => {
      // Seed trainer data and login as teacher (seedTrainer now handles both)
      cy.seedTrainer("teacher@example.com", "Test", "Teacher");

      // Mock API endpoints
      cy.intercept("GET", "/api/courses/my", {
        statusCode: 200,
        body: [],
      }).as("getMyCourses");

      cy.intercept("GET", "/api/events/my", {
        statusCode: 200,
        body: [],
      }).as("getMyEvents");

      // Mock trainer data and empty events list
      cy.mockUserData({
        courses: [],
        events: [],
      });
    });

    it("should validate date is not in the past", () => {
      // Navigate directly to event creation page
      cy.visit("/event/neu");

      // Wait for form to load
      cy.contains("h1", "Event erstellen").should("be.visible");

      // Try to set date to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split("T")[0];

      cy.get('input[id="event_name"]').type("Past Event");
      cy.get('input[id="start_date"]').type(dateString);

      // Mock validation error
      cy.intercept("POST", "/api/event/create", {
        statusCode: 400,
        body: {
          error: "Das Startdatum darf nicht in der Vergangenheit liegen",
        },
      }).as("createEventPastDate");

      cy.get('button[type="submit"]').contains("Event erstellen").click();

      cy.wait("@createEventPastDate");

      cy.contains(
        "Das Startdatum darf nicht in der Vergangenheit liegen"
      ).should("be.visible");
    });

    it("should validate numeric fields", () => {
      // Navigate directly to event creation page
      cy.visit("/event/neu");

      // Wait for form to load
      cy.contains("h1", "Event erstellen").should("be.visible");

      cy.get('input[id="event_name"]').type("Test Event");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      cy.get('input[id="start_date"]').type(
        tomorrow.toISOString().split("T")[0]
      );

      // Test negative values
      cy.get('input[id="max_participants"]').type("-5");
      cy.get('input[id="price"]').type("-10.50");

      // HTML5 validation should prevent negative values
      cy.get('input[id="max_participants"]:invalid').should("exist");
      cy.get('input[id="price"]:invalid').should("exist");
    });
  });
});
