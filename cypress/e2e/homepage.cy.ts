describe("Homepage", () => {
  it("should render the homepage correctly for unauthenticated users", () => {
    // Visit the homepage
    cy.visit("/");

    // Check that the page loads successfully
    cy.get("body").should("be.visible");

    // Check for key elements that should be present on the homepage for unauthenticated users
    // Hero section should be visible
    cy.get('[data-testid="hero-section"]').should("be.visible");

    // Search section should be visible
    cy.get('[data-testid="search-section"]').should("be.visible");

    // Benefits section should be visible
    cy.contains("Für Yoga Schüler*innne").should("be.visible");
    cy.contains("Für Yoga Lehrer*innen").should("be.visible");

    // Why Yoga section should be visible
    cy.get('[data-testid="why-yoga-section"]').should("be.visible");

    // CTA section should be visible
    cy.contains("Bereit, deine Yoga-Reise zu beginnen?").should("be.visible");
    cy.contains("Kurse finden").should("be.visible");
    cy.contains("Als Lehrer registrieren").should("be.visible");
  });

  it("should have correct page title and meta description", () => {
    cy.visit("/");

    // Check page title - using the actual title from the config
    cy.title().should("contain", "YogaPilates24.de");

    // Check meta description - using the actual description from the config
    cy.get('meta[name="description"]')
      .should("have.attr", "content")
      .and("contain", "Finde Yoga- und Pilates-Kurse in Deiner Nähe");
  });

  it("should have working navigation", () => {
    cy.visit("/");

    // Check that header is visible
    cy.get("header").should("be.visible");

    // Check that footer is visible
    cy.get("footer").should("be.visible");
  });

  it("should be responsive", () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.visit("/");
    cy.get("body").should("be.visible");

    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.visit("/");
    cy.get("body").should("be.visible");

    // Test desktop viewport
    cy.viewport(1920, 1080);
    cy.visit("/");
    cy.get("body").should("be.visible");
  });

  it("should have functional hero section buttons", () => {
    cy.visit("/");

    // Check that hero section buttons are clickable
    cy.get('[data-testid="hero-section"]').within(() => {
      cy.contains("Kurse finden").should("be.visible").and("have.attr", "href");
      cy.contains("Als Lehrer beitreten")
        .should("be.visible")
        .and("have.attr", "href");
    });
  });

  it("should have functional search section", () => {
    cy.visit("/");

    // Check search functionality
    cy.get('[data-testid="search-section"]').within(() => {
      cy.get('input[placeholder="Gib deinen Standort ein"]').should(
        "be.visible"
      );
      cy.contains("Kurse suchen").should("be.visible");
      cy.contains("Filter anzeigen").should("be.visible");
    });
  });
});
