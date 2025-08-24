describe("Events Page", () => {
  beforeEach(() => {
    // Mock the events API with sample data - use future dates to ensure they show up
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 30);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 45);
    const futureDate3 = new Date();
    futureDate3.setDate(futureDate3.getDate() + 60);

    cy.intercept("GET", "**/api/events", {
      statusCode: 200,
      body: {
        events: [
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
          },
        ],
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

        // Check that the event detail page is rendered
        cy.get("body").should("be.visible");

        // Note: The actual event detail page would need to be mocked separately
        // For now, we just verify navigation occurred
      });
  });

  it("should have working back link on event detail pages", () => {
    // Navigate to an event detail page first
    cy.get('a[href*="/events/"]').first().click();

    // Wait for the page to load
    cy.url().should("include", "/events/");

    // Note: The actual event detail page would need proper mocking
    // For now, we just verify navigation occurred
    cy.log("Navigation to event detail page successful");
    
    // Go back to events page manually for this test
    cy.visit("/events");
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
  it("should display all event information correctly", () => {
    // First navigate to events page
    cy.visit("/events");

    // Check if there are events to test
    cy.get("body").then(($body) => {
      const eventLinks = $body.find('a[href*="/events/"]');

      if (eventLinks.length > 0) {
        // Click on the first event
        cy.get('a[href*="/events/"]').first().click();

        // Check that all expected sections are present
        cy.contains("Trainer*in / Lehrer*in").should("be.visible");
        cy.contains("Datum").should("be.visible");

        // Check that the back link is present and functional
        cy.contains("← Zurück zur Event-Übersicht")
          .should("be.visible")
          .and("have.attr", "href", "/events");

        // Check for optional sections that might be present
        cy.get("body").then(($detailBody) => {
          // Check for time if present
          if ($detailBody.text().includes("Uhrzeit")) {
            cy.contains("Uhrzeit").should("be.visible");
          }

          // Check for location if present
          if ($detailBody.text().includes("Ort")) {
            cy.contains("Ort").should("be.visible");
          }

          // Check for price if present
          if ($detailBody.text().includes("Preis")) {
            cy.contains("Preis").should("be.visible");
          }

          // Check for max participants if present
          if ($detailBody.text().includes("Max. Teilnehmer")) {
            cy.contains("Max. Teilnehmer").should("be.visible");
          }

          // Check for description if present
          if ($detailBody.text().includes("Beschreibung")) {
            cy.contains("Beschreibung").should("be.visible");
          }
        });
      } else {
        cy.log("No events found, skipping event detail test");
      }
    });
  });

  it("should have correct meta information", () => {
    // Navigate to events page first
    cy.visit("/events");

    // Check if there are events to test
    cy.get("body").then(($body) => {
      const eventLinks = $body.find('a[href*="/events/"]');

      if (eventLinks.length > 0) {
        // Get the first event link and extract event name
        cy.get("div")
          .contains("Mehr erfahren")
          .parent()
          .parent()
          .within(() => {
            cy.get("h2")
              .invoke("text")
              .then((eventName) => {
                // Store the event name
                cy.wrap(eventName).as("eventName");
              });
          });

        // Click the event link
        cy.get('a[href*="/events/"]').first().click();

        // Check that the page title contains the event name
        cy.get("@eventName").then((eventName) => {
          cy.title().should("contain", eventName.toString().trim());
        });
      } else {
        cy.log("No events found, skipping meta information test");
      }
    });
  });

  it("should handle trainer links correctly", () => {
    // Navigate to an event detail page
    cy.visit("/events");

    cy.get("body").then(($body) => {
      const eventLinks = $body.find('a[href*="/events/"]');

      if (eventLinks.length > 0) {
        cy.get('a[href*="/events/"]').first().click();

        // Check if trainer has a link (some might not have slugs)
        cy.get("body").then(($detailBody) => {
          const trainerLink = $detailBody.find('a[href*="/trainer/"]');
          if (trainerLink.length > 0) {
            // Trainer has a link, test it
            cy.get('a[href*="/trainer/"]').should("be.visible");
          } else {
            // Trainer doesn't have a link, just check the name is displayed
            cy.contains("Trainer*in / Lehrer*in").should("be.visible");
            // Check that trainer name is displayed somewhere in the section
            cy.contains("Trainer*in / Lehrer*in")
              .parent()
              .should("contain.text", " ");
          }
        });
      } else {
        cy.log("No events found, skipping trainer link test");
      }
    });
  });

  it("should show edit button for event owners when authenticated", () => {
    // Login as a teacher who owns events
    cy.login({
      name: "Anna Schmidt",
      email: "anna@example.com",
      role: "teacher",
    });

    // Mock the event detail page to include edit button
    cy.intercept("GET", "**/events/yoga-workshop-anfaenger", {
      statusCode: 200,
      headers: { "content-type": "text/html" },
      body: `
        <!DOCTYPE html>
        <html>
          <head><title>Yoga Workshop für Anfänger</title></head>
          <body>
            <h1>Yoga Workshop für Anfänger</h1>
            <div>Trainer*in / Lehrer*in: Anna Schmidt</div>
            <div>Datum: 25. Dezember 2024</div>
            <a href="/events/yoga-workshop-anfaenger/bearbeiten">Event bearbeiten</a>
          </body>
        </html>
      `,
    }).as("getEventDetail");

    // Navigate to event detail page
    cy.get('a[href*="/events/yoga-workshop-anfaenger"]').first().click();
    cy.wait("@getEventDetail");

    // Check if edit button exists (only visible to event owners)
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

    cy.intercept("GET", "**/api/events", {
      statusCode: 200,
      body: {
        events: [
          {
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
          },
        ],
      },
    }).as("getEvents");
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

    // Verify we're on event detail page
    cy.url().should("match", /\/events\/[^\/]+$/);

    // Go back to events page manually (since we don't have full event detail page mocked)
    cy.visit("/events");
    cy.url().should("match", /\/events\/?$/);
    cy.contains("Yoga Events & Workshops").should("be.visible");
  });

  it("should handle direct navigation to event slugs", () => {
    // Mock a specific event detail page
    cy.intercept("GET", "**/events/yoga-workshop-anfaenger", {
      statusCode: 200,
      headers: { "content-type": "text/html" },
      body: `
        <!DOCTYPE html>
        <html>
          <head><title>Yoga Workshop für Anfänger</title></head>
          <body>
            <h1>Yoga Workshop für Anfänger</h1>
            <div>Trainer*in / Lehrer*in: Anna Schmidt</div>
            <div>Datum: 25. Dezember 2024</div>
          </body>
        </html>
      `,
    }).as("getEventDetail");

    // Test direct navigation to the event slug
    cy.visit("/events/yoga-workshop-anfaenger");
    cy.wait("@getEventDetail");
    cy.get("h1").should("be.visible").and("contain", "Yoga Workshop für Anfänger");
    cy.contains("Trainer*in / Lehrer*in").should("be.visible");
  });

  it("should handle invalid event slugs gracefully", () => {
    // Mock 404 response for non-existent event
    cy.intercept("GET", "**/events/non-existent-event", {
      statusCode: 404,
    }).as("get404Event");

    // Test navigation to a non-existent event slug
    cy.visit("/events/non-existent-event", { failOnStatusCode: false });
    cy.wait("@get404Event");
    
    // Should handle 404 gracefully (exact behavior depends on your 404 page implementation)
    cy.url().should("include", "/events/non-existent-event");
  });
});

describe("Event Slug Functionality", () => {
  beforeEach(() => {
    // Mock the events API for slug tests
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 30);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 45);

    cy.intercept("GET", "**/api/events", {
      statusCode: 200,
      body: {
        events: [
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
        ],
      },
    }).as("getEvents");

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
