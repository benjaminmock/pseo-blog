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
      const eventLinks = $body.find('a[href*="/event/"]');
      if (eventLinks.length > 0) {
        cy.get('a[href*="/event/"]').should("be.visible");
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
