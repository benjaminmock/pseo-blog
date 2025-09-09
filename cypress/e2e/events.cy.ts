// Helper function to create test event data
function createTestEventData() {
  const futureDate1 = new Date();
  futureDate1.setDate(futureDate1.getDate() + 30);
  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 45);
  const futureDate3 = new Date();
  futureDate3.setDate(futureDate3.getDate() + 60);

  return [
    {
      event_id: 1,
      event_name: "Yoga Workshop für Anfänger",
      description: "Ein entspannender Workshop für alle, die neu im Yoga sind.",
      start_date: futureDate1.toISOString().split('T')[0],
      start_time: "10:00",
      city_slug: "hamburg",
      slug: "yoga-workshop-anfaenger",
      max_participants: 15,
      price: 45.0,
      first_name: "Anna",
      last_name: "Schmidt",
      trainer_bio: "Erfahrene Yoga-Lehrerin",
      trainer_id: 1,
      active: 1,
    },
    {
      event_id: 2,
      event_name: "Fortgeschrittenes Vinyasa",
      description: "Dynamisches Yoga für erfahrene Praktizierende.",
      start_date: futureDate2.toISOString().split('T')[0],
      start_time: "18:00",
      city_slug: "berlin",
      slug: "fortgeschrittenes-vinyasa",
      max_participants: 12,
      price: 65.0,
      first_name: "Michael",
      last_name: "Weber",
      trainer_bio: "Yoga-Experte mit 10 Jahren Erfahrung",
      trainer_id: 2,
      active: 1,
    },
    {
      event_id: 3,
      event_name: "Event ohne Slug",
      description: "Ein Event ohne Slug zum Testen.",
      start_date: futureDate3.toISOString().split('T')[0],
      start_time: "14:00",
      city_slug: "münchen",
      slug: null,
      max_participants: 20,
      price: 35.0,
      first_name: "Sarah",
      last_name: "Müller",
      trainer_bio: "Zertifizierte Trainerin",
      trainer_id: 3,
      active: 1,
    },
  ];
}

describe("Events Page", () => {
  beforeEach(() => {
    // Mock the events API with sample data - use future dates to ensure they show up
    const eventData = createTestEventData();

    cy.intercept("GET", "**/api/events", {
      statusCode: 200,
      body: {
        events: eventData,
      },
    }).as("getEvents");

    // Visit the events page before each test
    cy.visit("/events");
    cy.wait("@getEvents");
  });

  it("should render the events page correctly", () => {
    // Check that the page loads successfully
    cy.get("body").should("be.visible");

    // Check for the main heading
    cy.contains("Yoga Events & Workshops").should("be.visible");

    // Check that the page has the correct title (it might be the site name)
    cy.title().should("not.be.empty");

    // Check that the main content container is present
    cy.get("main").should("be.visible").and("have.class", "max-w-6xl");

    // Check for the description text
    cy.contains(
      "Entdecken Sie besondere Yoga-Events, Workshops und Retreats"
    ).should("be.visible");
  });

  it("should display event cards with correct information", () => {
    // Check that event cards are displayed
    cy.get('[href*="/events/"]').should("have.length.at.least", 1);

    // Check the first event card structure
    cy.get("div")
      .contains("Mehr erfahren")
      .first()
      .parent()
      .parent()
      .within(() => {
        // Event name should be visible
        cy.get("h2").should("be.visible").and("contain", "Yoga Workshop für Anfänger");

        // Date information should be visible (calendar icon + date)
        cy.get("svg").should("be.visible");

        // Trainer information should be visible (person icon + name)
        cy.contains("Anna Schmidt").should("be.visible");

        // "Mehr erfahren" button should be visible
        cy.contains("Mehr erfahren").should("be.visible");

        // Price should be visible
        cy.contains("45.00 €").should("be.visible");

        // Max participants should be visible
        cy.contains("Max. 15 Teilnehmer").should("be.visible");
      });
  });

  it("should navigate to event detail page when clicking 'Mehr erfahren' button", () => {
    // Get the first event link and click it
    cy.get('a[href*="/events/"]')
      .first()
      .then(($link) => {
        const href = $link.attr("href");

        // Click the event link
        cy.wrap($link).click();

        // Check that we navigated to the correct event page
        cy.url().should("include", href);
        cy.url().should("include", "/events/yoga-workshop-anfaenger");

        // Check that the event detail page is rendered with expected content
        cy.get("h1").should("be.visible").and("contain", "Yoga Workshop für Anfänger");
        cy.contains("Trainer*in / Lehrer*in").should("be.visible");
        cy.contains("Anna Schmidt").should("be.visible");
        cy.contains("Datum").should("be.visible");
        cy.contains("← Zurück zur Event-Übersicht").should("be.visible");
      });
  });

  it("should have working back link on event detail pages", () => {
    // Navigate to an event detail page first
    cy.get('a[href*="/events/"]').first().click();

    // Wait for the page to load and verify we're on the detail page
    cy.url().should("include", "/events/yoga-workshop-anfaenger");
    cy.get("h1").should("be.visible").and("contain", "Yoga Workshop für Anfänger");

    // Check that the back link is present and functional
    cy.contains("← Zurück zur Event-Übersicht")
      .should("be.visible")
      .and("have.attr", "href", "/events");
    
    // Click the back link to return to events page
    cy.contains("← Zurück zur Event-Übersicht").click();
    cy.url().should("match", /\/events\/?$/);
    cy.contains("Yoga Events & Workshops").should("be.visible");
  });

  it("should display event information correctly", () => {
    // Test the first event card
    cy.get("div")
      .contains("Yoga Workshop für Anfänger")
      .closest(".bg-white.border.border-gray-200")
      .within(() => {
        // Event name should be visible
        cy.get("h2").should("be.visible").and("contain", "Yoga Workshop für Anfänger");

        // Date should be displayed with calendar icon
        cy.get("svg").should("be.visible");

        // Check for date format (should contain day, month, year)
        cy.contains(/\w+,\s+\d{1,2}\.\s+\w+\s+\d{4}/).should("be.visible");

        // Trainer name should be visible with person icon
        cy.contains("Anna Schmidt").should("be.visible");

        // Price should be visible
        cy.contains("45.00 €").should("be.visible");
      });
  });

  it("should handle events without slugs gracefully", () => {
    // Check for the event without slug (third event in our mock data)
    cy.contains("Event ohne Slug")
      .closest(".bg-white.border.border-gray-200")
      .within(() => {
        // Should have a disabled button
        cy.get('button:disabled')
          .should("contain", "Mehr erfahren")
          .and("have.class", "cursor-not-allowed")
          .and("have.class", "bg-gray-400");
      });
  });

  it("should be responsive on different screen sizes", () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.contains("Yoga Events & Workshops").should("be.visible");
    cy.get("main").should("be.visible");

    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.contains("Yoga Events & Workshops").should("be.visible");
    cy.get("main").should("be.visible");

    // Test desktop viewport
    cy.viewport(1920, 1080);
    cy.contains("Yoga Events & Workshops").should("be.visible");
    cy.get("main").should("be.visible");
  });

  it("should handle loading and error states", () => {
    // Check that the page doesn't show loading state indefinitely
    cy.contains("Events werden geladen...").should("not.exist");

    // Check that no error messages are displayed on successful load
    cy.get(".text-red-600").should("not.exist");
  });
});

describe("Event Detail Page", () => {
  beforeEach(() => {
    // Mock the events API for this test suite
    const eventData = createTestEventData()[0]; // Use first event

    cy.intercept("GET", "**/api/events", {
      statusCode: 200,
      body: { events: [eventData] },
    }).as("getEvents");
  });

  it("should display all event information correctly", () => {
    // Navigate to events page first
    cy.visit("/events");
    cy.wait("@getEvents");

    // Click on the first event to test the real Next.js page
    cy.get('a[href*="/events/"]').first().click();

    // Check that all expected sections are present in the real application
    cy.get("h1").should("be.visible").and("contain", "Yoga Workshop für Anfänger");
    cy.contains("Trainer*in / Lehrer*in").should("be.visible");
    cy.contains("Anna Schmidt").should("be.visible");
    cy.contains("Datum").should("be.visible");
    cy.contains("Uhrzeit").should("be.visible");
    cy.contains("10:00").should("be.visible");
    cy.contains("Ort").should("be.visible");
    cy.contains("hamburg").should("be.visible");
    cy.contains("Preis").should("be.visible");
    cy.contains("45,00 €").should("be.visible"); // Real app uses German currency formatting
    cy.contains("Max. Teilnehmer").should("be.visible");
    cy.contains("15 Teilnehmer").should("be.visible");
    cy.contains("Beschreibung").should("be.visible");

    // Check that the back link is present and functional
    cy.contains("← Zurück zur Event-Übersicht")
      .should("be.visible")
      .and("have.attr", "href", "/events");
  });

  it("should have correct meta information", () => {
    // Navigate to events page first
    cy.visit("/events");
    cy.wait("@getEvents");

    // Click the event link to test real Next.js metadata generation
    cy.get('a[href*="/events/"]').first().click();

    // Check that the page title contains the event name (generated by real app)
    cy.title().should("contain", "Yoga Workshop für Anfänger");
  });

  it("should handle trainer links correctly", () => {
    // Navigate to events page first
    cy.visit("/events");
    cy.wait("@getEvents");

    // Click on the event to test real trainer link logic
    cy.get('a[href*="/events/"]').first().click();

    // Check that trainer name is displayed (real app handles trainer links conditionally)
    cy.contains("Trainer*in / Lehrer*in").should("be.visible");
    cy.contains("Anna Schmidt").should("be.visible");
  });

  it("should show edit button for event owners when authenticated", () => {
    // Login as a teacher who owns events
    cy.login({
      name: "Anna Schmidt",
      email: "anna@example.com",
      role: "teacher",
    });

    // Navigate to events page and click on event to test real authentication logic
    cy.visit("/events");
    cy.wait("@getEvents");
    cy.get('a[href*="/events/yoga-workshop-anfaenger"]').first().click();

    // Check if edit button exists (real app checks user ownership)
    // Note: This test may fail if the real app doesn't have the trainer in the database
    // In a real scenario, you'd need to set up proper test data in the database
    cy.get('a[href*="/bearbeiten"]')
      .should("be.visible")
      .and("contain", "Event bearbeiten");
  });
});

describe("Event Navigation Flow", () => {
  beforeEach(() => {
    // Mock the events API for navigation tests
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const eventData = {
      event_id: 1,
      event_name: "Yoga Workshop für Anfänger",
      description: "Ein entspannender Workshop für alle, die neu im Yoga sind.",
      start_date: futureDate.toISOString().split('T')[0],
      start_time: "10:00",
      city_slug: "hamburg",
      slug: "yoga-workshop-anfaenger",
      max_participants: 15,
      price: 45.0,
      first_name: "Anna",
      last_name: "Schmidt",
      trainer_bio: "Erfahrene Yoga-Lehrerin",
    };

    cy.intercept("GET", "**/api/events", {
      statusCode: 200,
      body: { events: [eventData] },
    }).as("getEvents");

    // Mock event detail page
    // No longer mocking event detail pages - test the real Next.js application
  });

  it("should complete a full navigation flow from events list to event detail and back", () => {
    // Start from events page
    cy.visit("/events");
    cy.wait("@getEvents");

    // Verify we're on events page
    cy.url().should("include", "/events");
    cy.contains("Yoga Events & Workshops").should("be.visible");

    // Click on an event
    cy.get('a[href*="/events/"]').first().click();
    cy.wait("@getEventDetail");

    // Verify we're on event detail page
    cy.url().should("match", /\/events\/[^\/]+$/);
    cy.get("h1").should("be.visible").and("contain", "Yoga Workshop für Anfänger");

    // Use the back link to return to events page
    cy.contains("← Zurück zur Event-Übersicht").click();
    cy.url().should("match", /\/events\/?$/);
    cy.contains("Yoga Events & Workshops").should("be.visible");
  });

  it("should handle direct navigation to event slugs", () => {
    // Test direct navigation to the event slug
    cy.visit("/events/yoga-workshop-anfaenger");
    cy.wait("@getEventDetail");
    cy.get("h1").should("be.visible").and("contain", "Yoga Workshop für Anfänger");
    cy.contains("Trainer*in / Lehrer*in").should("be.visible");
    cy.contains("Anna Schmidt").should("be.visible");
  });

  it("should handle invalid event slugs gracefully", () => {
    // Mock 404 response for non-existent event with proper HTML content-type
    cy.intercept("GET", "**/events/non-existent-event", {
      statusCode: 404,
      headers: { "content-type": "text/html" },
      body: `
        <!DOCTYPE html>
        <html>
          <head><title>Event nicht gefunden</title></head>
          <body>
            <h1>404 - Event nicht gefunden</h1>
            <p>Das angeforderte Event wurde nicht gefunden.</p>
          </body>
        </html>
      `,
    }).as("get404Event");

    // Test navigation to a non-existent event slug
    cy.visit("/events/non-existent-event", { failOnStatusCode: false });
    cy.wait("@get404Event");
    
    // Should handle 404 gracefully with proper content
    cy.url().should("include", "/events/non-existent-event");
    cy.get("body").should("be.visible");
  });
});

describe("Event Slug Functionality", () => {
  beforeEach(() => {
    // Mock the events API for slug tests
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 30);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 45);

    const eventData = [
      {
        event_id: 1,
        event_name: "Yoga Workshop für Anfänger",
        description: "Ein entspannender Workshop für alle, die neu im Yoga sind.",
        start_date: futureDate1.toISOString().split('T')[0],
        start_time: "10:00",
        city_slug: "hamburg",
        slug: "yoga-workshop-anfaenger",
        max_participants: 15,
        price: 45.0,
        first_name: "Anna",
        last_name: "Schmidt",
        trainer_bio: "Erfahrene Yoga-Lehrerin",
      },
      {
        event_id: 2,
        event_name: "Fortgeschrittenes Vinyasa",
        description: "Dynamisches Yoga für erfahrene Praktizierende.",
        start_date: futureDate2.toISOString().split('T')[0],
        start_time: "18:00",
        city_slug: "berlin",
        slug: "fortgeschrittenes-vinyasa",
        max_participants: 12,
        price: 65.0,
        first_name: "Michael",
        last_name: "Weber",
        trainer_bio: "Yoga-Experte mit 10 Jahren Erfahrung",
      },
    ];

    cy.intercept("GET", "**/api/events", {
      statusCode: 200,
      body: { events: eventData },
    }).as("getEvents");

    // No longer mocking event detail pages - test the real Next.js application

    cy.visit("/events");
    cy.wait("@getEvents");
  });

  it("should use clean, SEO-friendly URLs", () => {
    // Check that event URLs follow slug pattern
    cy.get('a[href*="/events/"]').each(($link) => {
      const href = $link.attr("href");
      // Should match pattern /events/[slug] where slug contains only lowercase letters, numbers, and hyphens
      expect(href).to.match(/^\/events\/[a-z0-9-]+$/);
    });
  });

  it("should maintain consistent slug format", () => {
    cy.get('a[href*="/events/"]')
      .first()
      .then(($link) => {
        const href = $link.attr("href");
        if (href) {
          const slug = href.split("/events/")[1];

          // Slug should not start or end with hyphens
          expect(slug).to.not.match(/^-|-$/);

          // Slug should not contain consecutive hyphens
          expect(slug).to.not.match(/--/);

          // Slug should not contain uppercase letters or special characters
          expect(slug).to.match(/^[a-z0-9-]+$/);

          // Verify specific slug format
          expect(slug).to.equal("yoga-workshop-anfaenger");
        }
      });
  });
});
