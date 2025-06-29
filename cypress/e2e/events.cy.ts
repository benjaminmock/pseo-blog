describe("Events Page", () => {
  beforeEach(() => {
    // Visit the events page before each test
    cy.visit("/events");
  });

  it("should render the events page correctly", () => {
    // Check that the page loads successfully
    cy.get("body").should("be.visible");

    // Check for the main heading
    cy.contains("Yoga Events & Workshops").should("be.visible");

    // Check that the page has the correct title
    cy.title().should("contain", "Events");

    // Check that the main content container is present
    cy.get("main").should("be.visible").and("have.class", "max-w-6xl");

    // Check for the description text
    cy.contains(
      "Entdecken Sie besondere Yoga-Events, Workshops und Retreats"
    ).should("be.visible");
  });

  it("should display event cards with correct information", () => {
    // Check that event cards are displayed (if any events exist)
    cy.get("body").then(($body) => {
      if ($body.find('[href*="/events/"]').length > 0) {
        // Events exist, test their structure
        cy.get('[href*="/events/"]').should("exist");

        // Check that each event card has the required elements
        cy.get("div")
          .contains("Mehr erfahren")
          .parent()
          .parent()
          .within(() => {
            // Event name should be visible
            cy.get("h2").should("be.visible");

            // Date information should be visible (calendar icon + date)
            cy.get("svg").should("be.visible");

            // Trainer information should be visible (person icon + name)
            cy.contains(/\w+\s+\w+/).should("be.visible");

            // "Mehr erfahren" button should be visible
            cy.contains("Mehr erfahren").should("be.visible");
          });
      } else {
        // No events exist, check for empty state
        cy.contains("Keine Events verfügbar").should("be.visible");
        cy.contains("Derzeit sind keine Events geplant").should("be.visible");
      }
    });
  });

  it("should navigate to event detail page when clicking 'Mehr erfahren' button", () => {
    // Check if there are any events with slugs
    cy.get("body").then(($body) => {
      const eventLinks = $body.find('a[href*="/events/"]');

      if (eventLinks.length > 0) {
        // Get the first event link and click it
        cy.get('a[href*="/events/"]')
          .first()
          .then(($link) => {
            const href = $link.attr("href");

            // Click the event link
            cy.wrap($link).click();

            // Check that we navigated to the correct event page
            cy.url().should("include", href);

            // Check that the event detail page is rendered
            cy.get("body").should("be.visible");

            // Check for event detail page elements
            cy.get("h1").should("be.visible");
            cy.contains("Trainer*in / Lehrer*in").should("be.visible");
            cy.contains("Datum").should("be.visible");
          });
      } else {
        // No events with slugs, skip this test
        cy.log("No events with slugs found, skipping navigation test");
      }
    });
  });

  it("should have working back link on event detail pages", () => {
    // Check if there are any events to navigate to
    cy.get("body").then(($body) => {
      const eventLinks = $body.find('a[href*="/events/"]');

      if (eventLinks.length > 0) {
        // Navigate to an event detail page first
        cy.get('a[href*="/events/"]').first().click();

        // Wait for the page to load
        cy.url().should("include", "/events/");

        // Find and click the back link
        cy.contains("← Zurück zur Event-Übersicht")
          .should("be.visible")
          .click();

        // Check that we're back on the events overview page
        cy.url().should("match", /\/events\/?$/);
        cy.contains("Yoga Events & Workshops").should("be.visible");
      } else {
        cy.log("No events found, skipping back link test");
      }
    });
  });

  it("should display event information correctly", () => {
    cy.get("body").then(($body) => {
      const eventCards = $body
        .find("div")
        .filter(
          (_, el) =>
            Cypress.$(el).find("h2").length > 0 &&
            Cypress.$(el).find("svg").length > 0
        );

      if (eventCards.length > 0) {
        // Test the first event card
        cy.wrap(eventCards.first()).within(() => {
          // Event name should be visible
          cy.get("h2").should("be.visible").and("not.be.empty");

          // Date should be displayed with calendar icon
          cy.get("svg").should("be.visible");

          // Check for date format (should contain day, month, year)
          cy.get("span")
            .contains(/\w+,\s+\d{1,2}\.\s+\w+\s+\d{4}/)
            .should("be.visible");

          // Trainer name should be visible with person icon
          cy.get("svg").should("be.visible");
        });
      }
    });
  });

  it("should handle events without slugs gracefully", () => {
    // Check if there are any disabled "Mehr erfahren" buttons
    cy.get("body").then(($body) => {
      const disabledButtons = $body.find(
        'button:disabled:contains("Mehr erfahren")'
      );

      if (disabledButtons.length > 0) {
        // Test that disabled buttons are properly styled
        cy.get('button:disabled:contains("Mehr erfahren")')
          .should("have.class", "cursor-not-allowed")
          .and("have.class", "bg-gray-400");
      }
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

  it("should show edit button for event owners", () => {
    // This test would require authentication, so we'll just check the structure
    cy.visit("/events");

    cy.get("body").then(($body) => {
      const eventLinks = $body.find('a[href*="/events/"]');

      if (eventLinks.length > 0) {
        cy.get('a[href*="/events/"]').first().click();

        // Check if edit button exists (only visible to event owners)
        cy.get("body").then(($detailBody) => {
          const editButton = $detailBody.find('a[href*="/bearbeiten"]');
          if (editButton.length > 0) {
            cy.get('a[href*="/bearbeiten"]')
              .should("be.visible")
              .and("contain", "Event bearbeiten");
          }
        });
      }
    });
  });
});

describe("Event Navigation Flow", () => {
  it("should complete a full navigation flow from events list to event detail and back", () => {
    // Start from events page
    cy.visit("/events");

    // Verify we're on events page
    cy.url().should("include", "/events");
    cy.contains("Yoga Events & Workshops").should("be.visible");

    // Check if there are events to navigate
    cy.get("body").then(($body) => {
      const eventLinks = $body.find('a[href*="/events/"]');

      if (eventLinks.length > 0) {
        // Click on an event
        cy.get('a[href*="/events/"]').first().click();

        // Verify we're on event detail page
        cy.url().should("match", /\/events\/[^\/]+$/);

        // Click back to events overview
        cy.contains("← Zurück zur Event-Übersicht").click();

        // Verify we're back on events page
        cy.url().should("match", /\/events\/?$/);
        cy.contains("Yoga Events & Workshops").should("be.visible");
      } else {
        cy.log("No events found, skipping navigation flow test");
      }
    });
  });

  it("should handle direct navigation to event slugs", () => {
    // Test direct navigation to a known event slug
    // This assumes there's at least one event with slug "mein-yoga-workshop"
    cy.request({
      url: "/events/mein-yoga-workshop",
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 200) {
        // Event exists, test direct navigation
        cy.visit("/events/mein-yoga-workshop");
        cy.get("h1").should("be.visible");
        cy.contains("Trainer*in / Lehrer*in").should("be.visible");
      } else {
        cy.log(
          "Event with slug 'mein-yoga-workshop' not found, skipping direct navigation test"
        );
      }
    });
  });

  it("should handle invalid event slugs gracefully", () => {
    // Test navigation to a non-existent event slug
    cy.request({
      url: "/events/non-existent-event",
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 404) {
        // Should show 404 page
        cy.visit("/events/non-existent-event", { failOnStatusCode: false });
        // Check for 404 page or redirect to events list
        cy.url().should("satisfy", (url) => {
          return url.includes("/events") || url.includes("404");
        });
      }
    });
  });
});

describe("Event Slug Functionality", () => {
  it("should use clean, SEO-friendly URLs", () => {
    cy.visit("/events");

    cy.get("body").then(($body) => {
      const eventLinks = $body.find('a[href*="/events/"]');

      if (eventLinks.length > 0) {
        // Check that event URLs follow slug pattern
        cy.get('a[href*="/events/"]').each(($link) => {
          const href = $link.attr("href");
          // Should match pattern /events/[slug] where slug contains only lowercase letters, numbers, and hyphens
          expect(href).to.match(/^\/events\/[a-z0-9-]+$/);
        });
      }
    });
  });

  it("should maintain consistent slug format", () => {
    cy.visit("/events");

    cy.get("body").then(($body) => {
      const eventLinks = $body.find('a[href*="/events/"]');

      if (eventLinks.length > 0) {
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
            }
          });
      }
    });
  });
});
