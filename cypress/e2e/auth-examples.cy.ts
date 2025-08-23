describe("Authentication Examples", () => {
  beforeEach(() => {
    cy.logout();
  });

  describe("Method 1: Session Mocking (Fast)", () => {
    it("should login using session mocking", () => {
      cy.login({
        name: "Mock User",
        email: "mock@example.com",
        role: "teacher",
      });

      cy.mockUserData({
        courses: [
          {
            course_id: 1,
            course_name: "Mocked Course",
            description: "This is a mocked course",
            start_date: "2024-01-15",
            end_date: null,
            city_slug: "hamburg",
            slug: "mocked-course",
            active: 1,
            first_name: "Mock",
            last_name: "User",
          },
        ],
        events: [],
      });

      // cy.visit("/intern");
      cy.visit("/kurs/neu");
      cy.contains("Willkommen, Mock User!").should("be.visible");
      // cy.contains("Rolle: Lehrer*in/Trainer*in").should("be.visible");
      cy.contains("Mocked Course").should("be.visible");

      // gogo
      cy.visit("/kurs/neu");
      cy.contains("Mocked Coursemmm").should("be.visible");
    });

    it("should logout using session clearing", () => {
      cy.login();
      cy.mockUserData({ courses: [], events: [] });
      cy.visit("/intern");
      cy.contains("Interner Bereich").should("be.visible");

      cy.logout();
      cy.visit("/intern");
      cy.url().should("include", "/login");
    });
  });

  describe("Method 2: API Endpoint (More Realistic)", () => {
    it("should login using test API endpoint", () => {
      cy.loginViaAPI({
        name: "API User",
        email: "api@example.com",
        role: "student",
      });

      // Mock the data endpoints since API login doesn't include these
      cy.mockUserData({ courses: [], events: [] });

      cy.visit("/intern");
      cy.contains("Willkommen, API User!").should("be.visible");
      cy.contains("Rolle: Student").should("be.visible");
    });

    it("should logout using test API endpoint", () => {
      cy.loginViaAPI();
      cy.mockUserData({ courses: [], events: [] });
      cy.visit("/intern");
      cy.contains("Interner Bereich").should("be.visible");

      cy.logoutViaAPI();
      cy.visit("/intern");
      cy.url().should("include", "/login");
    });
  });

  describe("Social Login Simulation", () => {
    it("should simulate Google OAuth flow", () => {
      // Mock the OAuth callback
      cy.intercept("POST", "/api/auth/signin/google", {
        statusCode: 200,
        body: { ok: true, url: "/intern" },
      }).as("googleSignin");

      // Mock successful session after OAuth
      cy.login({
        name: "Google User",
        email: "google@example.com",
        role: "teacher",
        image: "https://example.com/avatar.jpg",
      });

      cy.mockUserData({ courses: [], events: [] });

      cy.visit("/login");

      // Check that Google login button exists (using actual button text)
      // cy.contains("Mit Google anmelden").should("be.visible");

      // For this example, we'll just navigate directly after mocking
      cy.visit("/intern");
      cy.contains("Willkommen, Google User!").should("be.visible");
    });

    it("should simulate LinkedIn OAuth flow", () => {
      // Mock the OAuth callback
      cy.intercept("POST", "/api/auth/signin/linkedin", {
        statusCode: 200,
        body: { ok: true, url: "/intern" },
      }).as("linkedinSignin");

      // Mock successful session after OAuth
      cy.login({
        name: "LinkedIn User",
        email: "linkedin@example.com",
        role: "student",
        image: "https://example.com/linkedin-avatar.jpg",
      });

      cy.mockUserData({ courses: [], events: [] });

      cy.visit("/login");

      // Check that LinkedIn login button exists (using actual button text)
      cy.contains("Mit LinkedIn anmelden").should("be.visible");

      // For this example, we'll just navigate directly after mocking
      cy.visit("/intern");
      cy.contains("Willkommen, LinkedIn User!").should("be.visible");
    });
  });

  describe("Role-based Access Control", () => {
    it("should show different content for students vs teachers", () => {
      // Test as student
      cy.login({
        name: "Student User",
        role: "student",
      });
      cy.mockUserData({ courses: [], events: [] });

      cy.visit("/intern");
      cy.contains("Rolle: Student").should("be.visible");
      cy.contains("Sie sind noch nicht als Trainer registriert").should(
        "be.visible"
      );

      cy.logout();

      // Test as teacher
      cy.login({
        name: "Teacher User",
        role: "teacher",
      });
      cy.mockUserData({ courses: [], events: [] });

      cy.visit("/intern");
      cy.contains("Rolle: Lehrer*in/Trainer*in").should("be.visible");
      cy.contains("Sie haben noch keine Kurse erstellt").should("be.visible");
      cy.get('a[href="/kurs/neu"]')
        .contains("Ersten Kurs erstellen")
        .should("be.visible");
    });
  });

  describe("Error Handling", () => {
    it("should handle authentication errors gracefully", () => {
      // Mock failed session
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 401,
        body: { error: "Unauthorized" },
      }).as("failedSession");

      cy.visit("/intern");
      cy.url().should("include", "/login");
    });

    it("should handle API errors for user data", () => {
      cy.login({ role: "teacher" });

      // Mock failed API calls
      cy.intercept("GET", "/api/courses/my", {
        statusCode: 500,
        body: { error: "Server error" },
      }).as("failedCourses");

      cy.intercept("GET", "/api/events/my", {
        statusCode: 500,
        body: { error: "Server error" },
      }).as("failedEvents");

      cy.visit("/intern");

      // Should still show the page but without data
      cy.contains("Interner Bereich").should("be.visible");
      cy.wait("@failedCourses");
      cy.wait("@failedEvents");
    });
  });

  describe("Session Persistence", () => {
    it("should maintain session across page reloads", () => {
      cy.login({
        name: "Persistent User",
        email: "persistent@example.com",
      });

      cy.mockUserData({ courses: [], events: [] });

      cy.visit("/intern");
      cy.contains("Willkommen, Persistent User!").should("be.visible");

      // Reload the page
      cy.reload();
      cy.contains("Willkommen, Persistent User!").should("be.visible");
    });

    it("should handle session expiration", () => {
      // Mock session that expires immediately
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 200,
        body: {},
      }).as("expiredSession");

      cy.visit("/intern");
      // Should redirect to login due to no session
      cy.url().should("include", "/login");
    });
  });
});
