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
    it.only("should create a new event successfully", () => {
      // Seed trainer data for the logged-in user first
      cy.seedTrainer("teacher@example.com", "Test", "Teacher");

      // Login as teacher using API method (works with server-side auth)
      cy.loginViaAPI({
        name: "Test Teacher",
        email: "teacher@example.com",
        role: "teacher",
      });

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
      cy.login({
        name: "Test Teacher",
        email: "teacher@example.com",
        role: "teacher",
      });

      // Seed trainer data for the logged-in user
      cy.seedTrainer("teacher@example.com", "Test", "Teacher");

      cy.mockUserData({ courses: [], events: [] });

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
      // Login as teacher
      cy.login({
        name: "Test Teacher",
        email: "teacher@example.com",
        role: "teacher",
      });

      // Mock the edit page with event data
      cy.mockEventEditPage("original-event", {
        event_name: "Original Event Name",
        description: "Original description",
      });

      // Mock cities API
      cy.intercept("GET", "/api/cities", {
        statusCode: 200,
        body: [
          { id: 1, city: "Hamburg", slug: "hamburg" },
          { id: 2, city: "Berlin", slug: "berlin" },
        ],
      }).as("getCities");

      // Mock successful event update
      cy.intercept("PUT", "/api/events/update", {
        statusCode: 200,
        body: { success: true },
      }).as("updateEvent");

      // Visit event edit page
      cy.visit("/events/original-event/bearbeiten");

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
      cy.login({
        name: "Test Teacher",
        email: "teacher@example.com",
        role: "teacher",
      });

      // Mock the edit page with event data
      cy.mockEventEditPage("test-event", {
        event_name: "Test Event",
        description: "Test description",
      });

      // Mock API error
      cy.intercept("PUT", "/api/events/update", {
        statusCode: 403,
        body: {
          error: "Sie sind nicht berechtigt, dieses Event zu bearbeiten",
        },
      }).as("updateEventError");

      cy.visit("/events/test-event/bearbeiten");

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

      // Should navigate to edit page
      cy.url().should("include", "/event/1/bearbeiten");
    });
  });

  describe("Event Access via Slug", () => {
    it("should access event via slug after creation", () => {
      cy.login({
        name: "Test Teacher",
        email: "teacher@example.com",
        role: "teacher",
      });

      // Seed trainer data for the logged-in user
      cy.seedTrainer("teacher@example.com", "Test", "Teacher");

      cy.mockUserData({ courses: [], events: [] });

      // Mock successful event creation with slug
      cy.intercept("POST", "/api/event/create", {
        statusCode: 201,
        body: {
          event_id: 1,
          slug: "mein-neues-yoga-event",
        },
      }).as("createEvent");

      // Mock the event detail page
      cy.intercept("GET", "**/events/mein-neues-yoga-event", {
        statusCode: 200,
        headers: { "content-type": "text/html" },
        body: `
          <html>
            <body>
              <h1>Mein neues Yoga Event</h1>
              <p>Trainer*in / Lehrer*in</p>
              <p>Datum</p>
            </body>
          </html>
        `,
      }).as("getNewEvent");

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

      // Event page should load correctly
      cy.wait("@getNewEvent");
      cy.contains("Mein neues Yoga Event").should("be.visible");
    });
  });

  describe("Event Form Validation", () => {
    beforeEach(() => {
      cy.login({
        name: "Test Teacher",
        email: "teacher@example.com",
        role: "teacher",
      });

      // Seed trainer data for the logged-in user
      cy.seedTrainer("teacher@example.com", "Test", "Teacher");

      cy.mockUserData({ courses: [], events: [] });
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
