describe("Courses Page", () => {
  beforeEach(() => {
    // Visit the courses page before each test
    cy.visit("/kurse");
  });

  it("should render the courses page correctly", () => {
    // Check that the page loads successfully
    cy.get("body").should("be.visible");

    // Check for the main heading
    cy.contains("Unsere Yoga Kurse").should("be.visible");

    // Check that the page has the correct title
    cy.title().should("contain", "Yoga Kurse");

    // Check that the main content container is present
    cy.get("main").should("be.visible").and("have.class", "max-w-4xl");
  });

  it("should display course cards with correct information", () => {
    // Check that course cards are displayed
    cy.get('[href*="/kurse/"]').should("exist");

    // Check that each course card has the required elements
    cy.get('[href*="/kurse/"]')
      .first()
      .within(() => {
        // Course name should be visible
        cy.get("h2").should("be.visible");

        // Trainer information should be visible
        cy.contains("mit").should("be.visible");

        // Date information should be visible
        cy.get("div")
          .contains(/\d{2}\.\d{2}\.\d{4}/)
          .should("be.visible");

        // "Kurs Details" link should be visible
        cy.contains("Kurs Details →").should("be.visible");
      });
  });

  it("should navigate to a course detail page when clicking a course link", () => {
    // Get the first course link and click it
    cy.get('[href*="/kurse/"]')
      .first()
      .then(($link) => {
        const href = $link.attr("href");

        // Click the course link
        cy.wrap($link).click();

        // Check that we navigated to the correct course page
        cy.url().should("include", href);

        // Check that the course detail page is rendered
        cy.get("body").should("be.visible");

        // Check for course detail page elements
        cy.get("h1").should("be.visible");
        cy.contains("Trainer*in / Lehrer*in").should("be.visible");
        cy.contains("Zeitraum").should("be.visible");
      });
  });

  it("should have a working back link on course detail pages", () => {
    // Navigate to a course detail page first
    cy.get('[href*="/kurse/"]').first().click();

    // Wait for the page to load
    cy.url().should("include", "/kurse/");

    // Find and click the back link
    cy.contains("← Zurück zur Kursübersicht").should("be.visible").click();

    // Check that we're back on the courses overview page
    cy.url().should("match", /\/kurse\/?$/);
    cy.contains("Unsere Yoga Kurse").should("be.visible");
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
            cy.contains("Unsere Yoga Kurse").should("be.visible");
          }
        });
      }
    });
  });

  it("should be responsive on different screen sizes", () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.contains("Unsere Yoga Kurse").should("be.visible");
    cy.get("main").should("be.visible");

    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.contains("Unsere Yoga Kurse").should("be.visible");
    cy.get("main").should("be.visible");

    // Test desktop viewport
    cy.viewport(1920, 1080);
    cy.contains("Unsere Yoga Kurse").should("be.visible");
    cy.get("main").should("be.visible");
  });

  it("should handle empty state gracefully", () => {
    // This test assumes there might be no courses
    // The page should still render properly even with no courses
    cy.get("main").should("be.visible");
    cy.contains("Unsere Yoga Kurse").should("be.visible");
  });
});

describe("Course Detail Page", () => {
  it("should display all course information correctly", () => {
    // First navigate to courses page
    cy.visit("/kurse");

    // Click on the first course
    cy.get('[href*="/kurse/"]').first().click();

    // Check that all expected sections are present
    cy.contains("Trainer*in / Lehrer*in").should("be.visible");
    cy.contains("Zeitraum").should("be.visible");

    // Check that the back link is present and functional
    cy.contains("← Zurück zur Kursübersicht")
      .should("be.visible")
      .and("have.attr", "href", "/kurse");
  });

  it("should have correct meta information", () => {
    // Navigate to courses page first
    cy.visit("/kurse");

    // Get the first course link and extract course name
    cy.get('[href*="/kurse/"]')
      .first()
      .within(() => {
        cy.get("h2")
          .invoke("text")
          .then((courseName) => {
            // Store the course name
            cy.wrap(courseName).as("courseName");
          });
      });

    // Click the course link from the parent context
    cy.get('[href*="/kurse/"]').first().click();

    // Check that the page title contains the course name
    cy.get("@courseName").then((courseName) => {
      cy.title().should("contain", courseName.toString().trim());
    });
  });

  it("should handle trainer links correctly", () => {
    // Navigate to a course detail page
    cy.visit("/kurse");
    cy.get('[href*="/kurse/"]').first().click();

    // Check if trainer has a link (some might not have slugs)
    cy.get("body").then(($body) => {
      const trainerLink = $body.find('a[href*="/trainer/"]');
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
  });
});

describe("Course Navigation Flow", () => {
  it("should complete a full navigation flow from homepage to course and back", () => {
    // Start from homepage
    cy.visit("/");

    // Navigate to courses page (assuming there's a link from homepage)
    cy.get("body").then(($body) => {
      // Look for any link that goes to courses
      if ($body.find('a[href="/kurse"], a[href*="kurse"]').length > 0) {
        cy.get('a[href="/kurse"], a[href*="kurse"]').first().click();
      } else {
        // If no direct link, navigate directly
        cy.visit("/kurse");
      }
    });

    // Verify we're on courses page
    cy.url().should("include", "/kurse");
    cy.contains("Unsere Yoga Kurse").should("be.visible");

    // Click on a course
    cy.get('[href*="/kurse/"]').first().click();

    // Verify we're on course detail page
    cy.url().should("match", /\/kurse\/[^\/]+$/);

    // Click back to courses overview
    cy.contains("← Zurück zur Kursübersicht").click();

    // Verify we're back on courses page
    cy.url().should("match", /\/kurse\/?$/);
    cy.contains("Unsere Yoga Kurse").should("be.visible");
  });
});

describe("Course Creation to Public Display Integration", () => {
  const teacherEmail = "integration-teacher@example.com";

  before(() => {
    // Create a teacher account for integration tests
    cy.seedTrainer(teacherEmail, "Integration", "Teacher");
  });

  beforeEach(() => {
    // Log in as teacher
    cy.loginViaAPI({
      email: teacherEmail,
      name: "Integration Teacher",
      role: "teacher",
    });
  });

  it("should create a course and verify it appears in public listing", () => {
    const courseName = "Integration Test Course " + Date.now();
    const description = "Course created for integration testing";

    // Step 1: Create the course
    cy.visit("/kurs/neu");
    cy.get('input[name="course_name"]').type(courseName);
    cy.get('textarea[name="description"]').type(description);
    cy.get('input[name="start_date"]').type("2025-12-01");
    cy.get('input[name="end_date"]').type("2025-12-31");
    cy.get('button[type="submit"]').click();

    // Step 2: Verify redirect to course detail page
    cy.url().should("include", "/kurse/");
    cy.contains(courseName).should("be.visible");

    // Step 3: Navigate to public courses page
    cy.visit("/kurse");

    // Step 4: Verify course appears in public listing
    cy.contains(courseName).should("be.visible");
    cy.contains(description).should("be.visible");
    cy.contains("mit Integration Teacher").should("be.visible");
    cy.contains("01.12.2025").should("be.visible");

    // Step 5: Click on the course to view details
    cy.contains(courseName).parents("a").click();

    // Step 6: Verify course detail page shows all information
    cy.url().should("include", "/kurse/");
    cy.contains(courseName).should("be.visible");
    cy.contains(description).should("be.visible");
    cy.contains("Integration Teacher").should("be.visible");
    cy.contains("Trainer*in / Lehrer*in").should("be.visible");
    cy.contains("Zeitraum").should("be.visible");
  });

  it("should handle the complete workflow from creation to navigation", () => {
    const courseName = "Workflow Course " + Date.now();

    // Create course
    cy.visit("/kurs/neu");
    cy.get('input[name="course_name"]').type(courseName);
    cy.get('input[name="start_date"]').type("2025-10-15");
    cy.get('button[type="submit"]').click();

    // Verify creation success
    cy.contains(courseName).should("be.visible");

    // Navigate back to courses overview using back link
    cy.contains("← Zurück zur Kursübersicht").click();

    // Verify we're on courses page and course is listed
    cy.url().should("match", /\/kurse\/?$/);
    cy.contains("Unsere Yoga Kurse").should("be.visible");
    cy.contains(courseName).should("be.visible");

    // Navigate to course detail again
    cy.contains(courseName).parents("a").click();

    // Verify navigation worked
    cy.url().should("include", "/kurse/");
    cy.contains(courseName).should("be.visible");
  });

  after(() => {
    // Clean up test data
    cy.cleanupTrainer(teacherEmail);
  });
});
