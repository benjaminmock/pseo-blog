describe("Trainers Page", () => {
  beforeEach(() => {
    // Visit the trainers page before each test
    cy.visit("/trainer");
  });

  it("should render the trainers page correctly", () => {
    // Check that the page loads successfully
    cy.get("body").should("be.visible");

    // Check for the main heading
    cy.contains("Unsere Yoga Trainer").should("be.visible");

    // Check that the page has the correct title
    cy.title().should("contain", "Unsere Trainer");

    // Check that the main content container is present
    cy.get("main").should("be.visible").and("have.class", "max-w-4xl");
  });

  it("should display trainer cards with correct information", () => {
    // Check that trainer cards are displayed
    cy.get('[href*="/trainer/"]').should("exist");

    // Check that each trainer card has the required elements
    cy.get('[href*="/trainer/"]')
      .first()
      .within(() => {
        // Trainer name should be visible
        cy.get("h2").should("be.visible");

        // "Profil ansehen" link should be visible
        cy.contains("Profil ansehen →").should("be.visible");
      });
  });

  it("should navigate to a trainer detail page when clicking a trainer link", () => {
    // Get the first trainer link and click it
    cy.get('[href*="/trainer/"]')
      .first()
      .then(($link) => {
        const href = $link.attr("href");

        // Click the trainer link
        cy.wrap($link).click();

        // Check that we navigated to the correct trainer page
        cy.url().should("include", href);

        // Check that the trainer detail page is rendered
        cy.get("body").should("be.visible");

        // Check for trainer detail page elements
        cy.get("h2").should("be.visible");
        cy.contains("🧘‍♂️").should("be.visible");
      });
  });

  it("should have working breadcrumb navigation on trainer detail pages", () => {
    // Navigate to a trainer detail page first
    cy.get('[href*="/trainer/"]').first().click();

    // Wait for the page to load
    cy.url().should("include", "/trainer/");

    // Check breadcrumb navigation
    cy.get('nav[aria-label="Breadcrumb"]').should("be.visible");

    // Test breadcrumb links
    cy.get('nav[aria-label="Breadcrumb"]').within(() => {
      cy.contains("home").should("be.visible").and("have.attr", "href", "/");
      cy.contains("Trainer")
        .should("be.visible")
        .and("have.attr", "href", "/trainer");
    });

    // Click the trainer breadcrumb link to go back
    cy.get('nav[aria-label="Breadcrumb"]').within(() => {
      cy.contains("Trainer").click();
    });

    // Check that we're back on the trainers overview page
    cy.url().should("match", /\/trainer\/?$/);
    cy.contains("Unsere Yoga Trainer").should("be.visible");
  });

  it("should display pagination when there are multiple pages", () => {
    // Check if pagination exists (only if there are multiple pages)
    cy.get("body").then(($body) => {
      if (
        $body.find('a:contains("Nächste"), a:contains("Vorherige")').length > 0
      ) {
        // Pagination exists, test it
        cy.get('span:contains("Seite")').should("be.visible");

        // Test next page if available
        cy.get('a:contains("Nächste")').then(($nextLink) => {
          if ($nextLink.length > 0) {
            cy.wrap($nextLink).click();
            cy.url().should("include", "page=2");
            cy.contains("Unsere Yoga Trainer").should("be.visible");
          }
        });
      }
    });
  });

  it("should be responsive on different screen sizes", () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.contains("Unsere Yoga Trainer").should("be.visible");
    cy.get("main").should("be.visible");

    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.contains("Unsere Yoga Trainer").should("be.visible");
    cy.get("main").should("be.visible");

    // Test desktop viewport
    cy.viewport(1920, 1080);
    cy.contains("Unsere Yoga Trainer").should("be.visible");
    cy.get("main").should("be.visible");
  });

  it("should handle empty state gracefully", () => {
    // This test assumes there might be no trainers
    // The page should still render properly even with no trainers
    cy.get("main").should("be.visible");
    cy.contains("Unsere Yoga Trainer").should("be.visible");
  });
});

describe("Trainer Detail Page", () => {
  it("should display all trainer information correctly", () => {
    // First navigate to trainers page
    cy.visit("/trainer");

    // Click on the first trainer
    cy.get('[href*="/trainer/"]').first().click();

    // Check that all expected sections are present
    cy.get("h2").should("be.visible");
    cy.contains("🧘‍♂️").should("be.visible");

    // Check that the breadcrumb navigation is present
    cy.get('nav[aria-label="Breadcrumb"]').should("be.visible");

    // Check for trainer profile sections
    cy.get("body").then(($body) => {
      // Check if bio section exists
      if ($body.find('h3:contains("Über mich")').length > 0) {
        cy.contains("Über mich").should("be.visible");
      }

      // Check if contact section exists
      if ($body.find('h3:contains("Kontakt")').length > 0) {
        cy.contains("Kontakt").should("be.visible");
      }
    });
  });

  it("should display trainer events and courses sections", () => {
    // Navigate to trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check for events section
    cy.contains("Workshops & Events").should("be.visible");

    // Check for courses section
    cy.contains("Kurse").should("be.visible");

    // Check if there are events or courses, or empty state messages
    cy.get("body").then(($body) => {
      // Check events section
      if (
        $body.find('p:contains("Derzeit keine Events verfügbar")').length > 0
      ) {
        cy.contains("Derzeit keine Events verfügbar").should("be.visible");
      } else {
        // If events exist, check for event cards
        cy.get('h3:contains("Workshops & Events")')
          .parent()
          .within(() => {
            cy.get("div").should("exist");
          });
      }

      // Check courses section
      if (
        $body.find('p:contains("Derzeit keine Kurse verfügbar")').length > 0
      ) {
        cy.contains("Derzeit keine Kurse verfügbar").should("be.visible");
      } else {
        // If courses exist, check for course cards
        cy.get('h3:contains("Kurse")')
          .parent()
          .within(() => {
            cy.get("div").should("exist");
          });
      }
    });
  });

  it("should have correct meta information", () => {
    // Navigate to trainers page first
    cy.visit("/trainer");

    // Get the first trainer link and extract trainer name
    cy.get('[href*="/trainer/"]')
      .first()
      .within(() => {
        cy.get("h2")
          .invoke("text")
          .then((trainerName) => {
            // Store the trainer name
            cy.wrap(trainerName).as("trainerName");
          });
      });

    // Click the trainer link from the parent context
    cy.get('[href*="/trainer/"]').first().click();

    // Check that the page title contains the trainer name
    cy.get("@trainerName").then((trainerName) => {
      cy.title().should("contain", trainerName.toString().trim());
    });
  });

  it("should handle trainer contact information correctly", () => {
    // Navigate to a trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check if contact section exists
    cy.get("body").then(($body) => {
      if ($body.find('h3:contains("Kontakt")').length > 0) {
        cy.get('h3:contains("Kontakt")').should("be.visible");

        // Check for email link
        cy.get('a[href^="mailto:"]').should("exist").and("be.visible");

        // Check for phone link if it exists
        if ($body.find('a[href^="tel:"]').length > 0) {
          cy.get('a[href^="tel:"]').should("be.visible");
        }

        // Check for website link if it exists
        if ($body.find('a[target="_blank"]').length > 0) {
          cy.get('a[target="_blank"]')
            .should("be.visible")
            .and("have.attr", "rel", "noopener noreferrer");
        }
      }
    });
  });

  it("should handle course and event links correctly", () => {
    // Navigate to a trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check for course links
    cy.get("body").then(($body) => {
      // Check for course links
      const courseLinks = $body.find('a[href*="/kurse/"]');
      if (courseLinks.length > 0) {
        cy.get('a[href*="/kurse/"]').should("be.visible");
      }

      // Check for event links
      const eventLinks = $body.find('a[href*="/events/"]');
      if (eventLinks.length > 0) {
        cy.get('a[href*="/events/"]').should("be.visible");
      }
    });
  });

  it("should display events section with correct structure and content", () => {
    // Navigate to a trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check that events section exists
    cy.contains("Workshops & Events").should("be.visible");

    // Check events section structure
    cy.get("body").then(($body) => {
      if (
        $body.find('p:contains("Derzeit keine Events verfügbar")').length > 0
      ) {
        // No events case
        cy.contains("Derzeit keine Events verfügbar").should("be.visible");
      } else {
        // Events exist - check their structure
        cy.get('h3:contains("Workshops & Events")')
          .parent()
          .within(() => {
            // Check for event cards
            cy.get("div").should("exist");

            // Check each event card has required elements
            cy.get("div").each(($eventCard) => {
              cy.wrap($eventCard).within(() => {
                // Event name should be visible
                cy.get("h4").should("be.visible");

                // Date information should be visible (look in the metadata section)
                cy.get("div.flex.flex-wrap.gap-4.text-sm.text-gray-500").should(
                  "contain",
                  "📅"
                );

                // Check for price if present
                if ($eventCard.find('span:contains("€")').length > 0) {
                  cy.get('span:contains("€")').should("be.visible");
                }
              });
            });
          });
      }
    });
  });

  it("should display courses section with correct structure and content", () => {
    // Navigate to a trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check that courses section exists
    cy.contains("Kurse").should("be.visible");

    // Check courses section structure
    cy.get("body").then(($body) => {
      if (
        $body.find('p:contains("Derzeit keine Kurse verfügbar")').length > 0
      ) {
        // No courses case
        cy.contains("Derzeit keine Kurse verfügbar").should("be.visible");
      } else {
        // Courses exist - check their structure
        cy.get('h3:contains("Kurse")')
          .parent()
          .within(() => {
            // Check for course cards
            cy.get("div").should("exist");

            // Check each course card has required elements
            cy.get("div").each(($courseCard) => {
              cy.wrap($courseCard).within(() => {
                // Course name should be visible
                cy.get("h4").should("be.visible");

                // Date information should be visible (look in the metadata section)
                cy.get("div.flex.flex-wrap.gap-4.text-sm.text-gray-500").should(
                  "contain",
                  "📅"
                );

                // Check for price if present
                if ($courseCard.find('span:contains("€")').length > 0) {
                  cy.get('span:contains("€")').should("be.visible");
                }

                // Check for course tags if present
                if (
                  $courseCard.find(
                    "span.bg-blue-100, span.bg-green-100, span.bg-purple-100"
                  ).length > 0
                ) {
                  cy.get('span[class*="bg-"]').should("be.visible");
                }
              });
            });
          });
      }
    });
  });

  it("should navigate to event detail pages when clicking event links", () => {
    // Navigate to a trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check for event links and test navigation
    cy.get("body").then(($body) => {
      const eventLinks = $body.find('a[href*="/events/"]');

      if (eventLinks.length > 0) {
        // Get the first event link
        cy.get('a[href*="/events/"]')
          .first()
          .then(($link) => {
            const href = $link.attr("href");
            const eventName = $link.text().trim();

            // Click the event link
            cy.wrap($link).click();

            // Verify we navigated to the correct event page
            cy.url().should("include", href);

            // Verify event detail page is rendered correctly
            cy.get("h1").should("be.visible").and("contain", eventName);
            cy.contains("Trainer*in / Lehrer*in").should("be.visible");
            cy.contains("Datum").should("be.visible");

            // Verify back link works
            cy.contains("← Zurück zur Event-Übersicht")
              .should("be.visible")
              .and("have.attr", "href", "/events");
          });
      } else {
        cy.log("No event links found on this trainer page");
      }
    });
  });

  it("should navigate to course detail pages when clicking course links", () => {
    // Navigate to a trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check for course links and test navigation
    cy.get("body").then(($body) => {
      const courseLinks = $body.find('a[href*="/kurse/"]');

      if (courseLinks.length > 0) {
        // Get the first course link
        cy.get('a[href*="/kurse/"]')
          .first()
          .then(($link) => {
            const href = $link.attr("href");
            const courseName = $link.text().trim();

            // Click the course link
            cy.wrap($link).click();

            // Verify we navigated to the correct course page
            cy.url().should("include", href);

            // Verify course detail page is rendered correctly
            cy.get("h1").should("be.visible").and("contain", courseName);
            cy.contains("Trainer*in / Lehrer*in").should("be.visible");
            cy.contains("Zeitraum").should("be.visible");

            // Verify back link works
            cy.contains("← Zurück zur Kursübersicht")
              .should("be.visible")
              .and("have.attr", "href", "/kurse");
          });
      } else {
        cy.log("No course links found on this trainer page");
      }
    });
  });

  it("should display event information correctly with all details", () => {
    // Navigate to a trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check events section for detailed information
    cy.get("body").then(($body) => {
      if (!$body.find('p:contains("Derzeit keine Events verfügbar")').length) {
        // Events exist, check their detailed information
        cy.get('h3:contains("Workshops & Events")')
          .parent()
          .within(() => {
            cy.get("div")
              .first()
              .within(() => {
                // Event name should be visible and clickable if it has a slug
                cy.get("h4").should("be.visible");

                // Date should be formatted correctly (German format)
                cy.get('div:contains("📅")')
                  .should("be.visible")
                  .and("contain.text", "📅");

                // Check for optional time information
                cy.get('div:contains("🕐")').then(($timeDiv) => {
                  if ($timeDiv.length > 0) {
                    cy.get('div:contains("🕐")').should("be.visible");
                  }
                });

                // Check for location information
                cy.get('div:contains("📍")').then(($locationDiv) => {
                  if ($locationDiv.length > 0) {
                    cy.get('div:contains("📍")').should("be.visible");
                  }
                });

                // Check for max participants information
                cy.get('div:contains("👥")').then(($participantsDiv) => {
                  if ($participantsDiv.length > 0) {
                    cy.get('div:contains("👥")').should("be.visible");
                  }
                });

                // Check for description if present
                cy.get("p.text-gray-600").then(($descriptionP) => {
                  if ($descriptionP.length > 0) {
                    cy.get("p.text-gray-600").should("be.visible");
                  }
                });
              });
          });
      }
    });
  });

  it("should display course information correctly with all details", () => {
    // Navigate to a trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check courses section for detailed information
    cy.get("body").then(($body) => {
      if (!$body.find('p:contains("Derzeit keine Kurse verfügbar")').length) {
        // Courses exist, check their detailed information
        cy.get('h3:contains("Kurse")')
          .parent()
          .within(() => {
            cy.get("div")
              .first()
              .within(() => {
                // Course name should be visible and clickable if it has a slug
                cy.get("h4").should("be.visible");

                // Date should be formatted correctly (German format)
                cy.get('div:contains("📅")')
                  .should("be.visible")
                  .and("contain.text", "📅");

                // Check for location information
                cy.get('div:contains("📍")').then(($locationDiv) => {
                  if ($locationDiv.length > 0) {
                    cy.get('div:contains("📍")').should("be.visible");
                  }
                });

                // Check for capacity information
                cy.get('div:contains("👥")').then(($capacityDiv) => {
                  if ($capacityDiv.length > 0) {
                    cy.get('div:contains("👥")').should("be.visible");
                  }
                });

                // Check for duration information
                cy.get('div:contains("⏱️")').then(($durationDiv) => {
                  if ($durationDiv.length > 0) {
                    cy.get('div:contains("⏱️")').should("be.visible");
                  }
                });

                // Check for course tags (style, level, language)
                cy.get("span.bg-blue-100").then(($styleSpan) => {
                  if ($styleSpan.length > 0) {
                    cy.get("span.bg-blue-100").should("be.visible");
                  }
                });
                cy.get("span.bg-green-100").then(($levelSpan) => {
                  if ($levelSpan.length > 0) {
                    cy.get("span.bg-green-100").should("be.visible");
                  }
                });
                cy.get("span.bg-purple-100").then(($languageSpan) => {
                  if ($languageSpan.length > 0) {
                    cy.get("span.bg-purple-100").should("be.visible");
                  }
                });

                // Check for description if present
                cy.get("p.text-gray-600").then(($descriptionP) => {
                  if ($descriptionP.length > 0) {
                    cy.get("p.text-gray-600").should("be.visible");
                  }
                });
              });
          });
      }
    });
  });

  it("should handle events and courses without slugs correctly", () => {
    // Navigate to a trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check that events without slugs are displayed but not clickable
    cy.get("body").then(($body) => {
      // Check events section
      if (!$body.find('p:contains("Derzeit keine Events verfügbar")').length) {
        cy.get('h3:contains("Workshops & Events")')
          .parent()
          .within(() => {
            cy.get("h4").each(($eventTitle) => {
              // If the event title is not wrapped in a link, it should still be visible
              if (!$eventTitle.closest("a").length) {
                cy.wrap($eventTitle).should("be.visible");
              }
            });
          });
      }

      // Check courses section
      if (!$body.find('p:contains("Derzeit keine Kurse verfügbar")').length) {
        cy.get('h3:contains("Kurse")')
          .parent()
          .within(() => {
            cy.get("h4").each(($courseTitle) => {
              // If the course title is not wrapped in a link, it should still be visible
              if (!$courseTitle.closest("a").length) {
                cy.wrap($courseTitle).should("be.visible");
              }
            });
          });
      }
    });
  });

  it("should display price information correctly for events and courses", () => {
    // Navigate to a trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check price formatting in events
    cy.get("body").then(($body) => {
      // Check events section for price information
      if (!$body.find('p:contains("Derzeit keine Events verfügbar")').length) {
        cy.get('h3:contains("Workshops & Events")')
          .parent()
          .within(() => {
            cy.get("span.text-green-600").each(($priceSpan) => {
              // Price should be formatted as "XXX€" or "Preis auf Anfrage"
              cy.wrap($priceSpan).should("satisfy", ($el) => {
                const text = $el.text();
                return text.includes("€") || text.includes("Preis auf Anfrage");
              });
            });
          });
      }

      // Check courses section for price information
      if (!$body.find('p:contains("Derzeit keine Kurse verfügbar")').length) {
        cy.get('h3:contains("Kurse")')
          .parent()
          .within(() => {
            cy.get("span.text-green-600").each(($priceSpan) => {
              // Price should be formatted as "XXX€" or "Preis auf Anfrage"
              cy.wrap($priceSpan).should("satisfy", ($el) => {
                const text = $el.text();
                return text.includes("€") || text.includes("Preis auf Anfrage");
              });
            });
          });
      }
    });
  });
});

describe("Trainer Navigation Flow", () => {
  it("should complete a full navigation flow from homepage to trainer and back", () => {
    // Start from homepage
    cy.visit("/");

    // Navigate to trainers page (assuming there's a link from homepage)
    cy.get("body").then(($body) => {
      // Look for any link that goes to trainers
      if ($body.find('a[href="/trainer"], a[href*="trainer"]').length > 0) {
        cy.get('a[href="/trainer"], a[href*="trainer"]').first().click();
      } else {
        // If no direct link, navigate directly
        cy.visit("/trainer");
      }
    });

    // Verify we're on trainers page
    cy.url().should("include", "/trainer");
    cy.contains("Unsere Yoga Trainer").should("be.visible");

    // Click on a trainer
    cy.get('[href*="/trainer/"]').first().click();

    // Verify we're on trainer detail page
    cy.url().should("match", /\/trainer\/[^\/]+$/);

    // Click back to trainers overview using breadcrumb
    cy.get('nav[aria-label="Breadcrumb"]').within(() => {
      cy.contains("Trainer").click();
    });

    // Verify we're back on trainers page
    cy.url().should("match", /\/trainer\/?$/);
    cy.contains("Unsere Yoga Trainer").should("be.visible");
  });

  it("should navigate from trainer detail to related courses", () => {
    // Navigate to a trainer detail page
    cy.visit("/trainer");
    cy.get('[href*="/trainer/"]').first().click();

    // Check if there are course links and test navigation
    cy.get("body").then(($body) => {
      const courseLinks = $body.find('a[href*="/kurse/"]');
      if (courseLinks.length > 0) {
        // Click on the first course link
        cy.get('a[href*="/kurse/"]').first().click();

        // Verify we're on a course detail page
        cy.url().should("include", "/kurse/");

        // Check that course detail page is rendered
        cy.get("body").should("be.visible");
      }
    });
  });
});
