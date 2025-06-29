describe("Intern Page Authentication Tests", () => {
  beforeEach(() => {
    // Clear any existing session before each test
    cy.logout();
  });

  describe("Unauthenticated Access", () => {
    it("should redirect to login when accessing /intern without authentication", () => {
      cy.visit("/intern");
      cy.url().should("include", "/login");
    });
  });

  describe("Authenticated Access - Student Role", () => {
    beforeEach(() => {
      cy.login({
        id: "student-123",
        name: "Max Mustermann",
        email: "max@example.com",
        role: "student",
      });
      cy.mockUserData({
        courses: [],
        events: [],
      });
    });

    it("should display the intern page for authenticated student", () => {
      cy.visit("/intern");
      cy.url().should("include", "/intern");

      // Check page title
      cy.contains("h1", "Interner Bereich").should("be.visible");

      // Check welcome message
      cy.contains("Willkommen, Max Mustermann!").should("be.visible");

      // Check role badge
      cy.contains("Rolle: Student").should("be.visible");
    });

    it("should show navigation links for students", () => {
      cy.visit("/intern");

      // Check profile link
      cy.get('a[href="/profil"]').should("be.visible");
      cy.contains("Dein Profil").should("be.visible");

      // Check course creation link
      cy.get('a[href="/kurs/neu"]').should("be.visible");
      cy.contains("Kurs erstellen").should("be.visible");

      // Check event creation link
      cy.get('a[href="/event/neu"]').should("be.visible");
      cy.contains("Event erstellen").should("be.visible");
    });

    it("should show empty state for courses when student has no courses", () => {
      cy.visit("/intern");

      cy.contains("h2", "Meine Kurse").should("be.visible");
      cy.contains(
        "Sie sind noch nicht als Trainer registriert oder haben keine Kurse erstellt."
      ).should("be.visible");
    });

    it("should show empty state for events when student has no events", () => {
      cy.visit("/intern");

      cy.contains("h2", "Meine Events").should("be.visible");
      cy.contains(
        "Sie sind noch nicht als Trainer registriert oder haben keine Events erstellt."
      ).should("be.visible");
    });
  });

  describe("Authenticated Access - Teacher Role", () => {
    beforeEach(() => {
      cy.login({
        id: "teacher-456",
        name: "Anna Lehrerin",
        email: "anna@example.com",
        role: "teacher",
      });
    });

    it("should display the intern page for authenticated teacher", () => {
      cy.mockUserData({
        courses: [],
        events: [],
      });

      cy.visit("/intern");
      cy.url().should("include", "/intern");

      // Check welcome message
      cy.contains("Willkommen, Anna Lehrerin!").should("be.visible");

      // Check role badge
      cy.contains("Rolle: Lehrer*in/Trainer*in").should("be.visible");
    });

    it("should show create course button for teachers with no courses", () => {
      cy.mockUserData({
        courses: [],
        events: [],
      });

      cy.visit("/intern");

      cy.contains("Sie haben noch keine Kurse erstellt.").should("be.visible");
      cy.get('a[href="/kurs/neu"]')
        .contains("Ersten Kurs erstellen")
        .should("be.visible");
    });

    it("should show create event button for teachers with no events", () => {
      cy.mockUserData({
        courses: [],
        events: [],
      });

      cy.visit("/intern");

      cy.contains("Sie haben noch keine Events erstellt.").should("be.visible");
      cy.get('a[href="/event/neu"]')
        .contains("Erstes Event erstellen")
        .should("be.visible");
    });

    it("should display courses when teacher has courses", () => {
      const mockCourses = [
        {
          course_id: 1,
          course_name: "Yoga für Anfänger",
          description: "Ein entspannender Kurs für Einsteiger",
          start_date: "2024-01-15",
          end_date: "2024-03-15",
          city_slug: "hamburg",
          slug: "yoga-fuer-anfaenger",
          active: 1,
          first_name: "Anna",
          last_name: "Lehrerin",
        },
        {
          course_id: 2,
          course_name: "Fortgeschrittenes Yoga",
          description: "Für erfahrene Yogis",
          start_date: "2024-02-01",
          end_date: null,
          city_slug: "berlin",
          slug: "fortgeschrittenes-yoga",
          active: 0,
          first_name: "Anna",
          last_name: "Lehrerin",
        },
      ];

      cy.mockUserData({
        courses: mockCourses,
        events: [],
      });

      cy.visit("/intern");

      // Check first course
      cy.contains("Yoga für Anfänger").should("be.visible");
      cy.contains("Ein entspannender Kurs für Einsteiger").should("be.visible");
      cy.contains("Aktiv").should("be.visible");

      // Check second course (inactive)
      cy.contains("Fortgeschrittenes Yoga").should("be.visible");
      cy.contains("Deaktiviert").should("be.visible");

      // Check action buttons
      cy.contains("Bearbeiten").should("be.visible");
      cy.contains("Vorschau →").should("be.visible");
      cy.contains("Deaktivieren").should("be.visible");
      cy.contains("Aktivieren").should("be.visible");
      cy.contains("Löschen").should("be.visible");
    });

    it("should display events when teacher has events", () => {
      const mockEvents = [
        {
          event_id: 1,
          event_name: "Yoga Workshop",
          description: "Ein intensiver Workshop",
          start_date: "2024-06-15",
          start_time: "10:00:00",
          city_slug: "hamburg",
          slug: "yoga-workshop",
          active: 1,
          max_participants: 20,
          price: 45.0,
          first_name: "Anna",
          last_name: "Lehrerin",
        },
      ];

      cy.mockUserData({
        courses: [],
        events: mockEvents,
      });

      cy.visit("/intern");

      // Check event details
      cy.contains("Yoga Workshop").should("be.visible");
      cy.contains("Ein intensiver Workshop").should("be.visible");
      cy.contains("Aktiv").should("be.visible");
      cy.contains("45,00 €").should("be.visible");
      cy.contains("Max. Teilnehmer: 20").should("be.visible");
    });

    it("should handle course status toggle", () => {
      const mockCourses = [
        {
          course_id: 1,
          course_name: "Test Kurs",
          description: "Test Beschreibung",
          start_date: "2024-01-15",
          end_date: null,
          city_slug: "hamburg",
          slug: "test-kurs",
          active: 1,
          first_name: "Anna",
          last_name: "Lehrerin",
        },
      ];

      cy.mockUserData({
        courses: mockCourses,
        events: [],
      });

      cy.visit("/intern");

      // Click deactivate button
      cy.contains("Deaktivieren").click();
      cy.wait("@toggleCourseStatus");
      cy.wait("@getMyCourses");
    });

    it("should handle course deletion with confirmation", () => {
      const mockCourses = [
        {
          course_id: 1,
          course_name: "Test Kurs",
          description: "Test Beschreibung",
          start_date: "2024-01-15",
          end_date: null,
          city_slug: "hamburg",
          slug: "test-kurs",
          active: 1,
          first_name: "Anna",
          last_name: "Lehrerin",
        },
      ];

      cy.mockUserData({
        courses: mockCourses,
        events: [],
      });

      cy.visit("/intern");

      // Mock window.confirm to return true
      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(true);
      });

      // Click delete button
      cy.contains("Löschen").click();
      cy.wait("@deleteCourse");
      cy.wait("@getMyCourses");
    });

    it("should handle event status toggle", () => {
      const mockEvents = [
        {
          event_id: 1,
          event_name: "Test Event",
          description: "Test Beschreibung",
          start_date: "2024-06-15",
          start_time: "10:00:00",
          city_slug: "hamburg",
          slug: "test-event",
          active: 1,
          max_participants: 20,
          price: 45.0,
          first_name: "Anna",
          last_name: "Lehrerin",
        },
      ];

      cy.mockUserData({
        courses: [],
        events: mockEvents,
      });

      cy.visit("/intern");

      // Click deactivate button
      cy.contains("Deaktivieren").click();
      cy.wait("@toggleEventStatus");
      cy.wait("@getMyEvents");
    });
  });

  describe("Loading States", () => {
    beforeEach(() => {
      cy.login({
        id: "teacher-456",
        name: "Anna Lehrerin",
        email: "anna@example.com",
        role: "teacher",
      });
    });

    it("should show loading state while session is being fetched", () => {
      // Mock slow session response
      cy.intercept("GET", "/api/auth/session", {
        statusCode: 200,
        body: {
          user: {
            id: "teacher-456",
            name: "Anna Lehrerin",
            email: "anna@example.com",
            role: "teacher",
          },
          expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
        delay: 1000,
      }).as("slowSession");

      cy.visit("/intern");
      cy.contains("Loading...").should("be.visible");
    });

    it("should show loading state for courses", () => {
      // Mock slow courses response
      cy.intercept("GET", "/api/courses/my", {
        statusCode: 200,
        body: { courses: [] },
        delay: 1000,
      }).as("slowCourses");

      cy.intercept("GET", "/api/events/my", {
        statusCode: 200,
        body: { events: [] },
      }).as("getMyEvents");

      cy.visit("/intern");
      cy.contains("Kurse werden geladen...").should("be.visible");
    });

    it("should show loading state for events", () => {
      cy.intercept("GET", "/api/courses/my", {
        statusCode: 200,
        body: { courses: [] },
      }).as("getMyCourses");

      // Mock slow events response
      cy.intercept("GET", "/api/events/my", {
        statusCode: 200,
        body: { events: [] },
        delay: 1000,
      }).as("slowEvents");

      cy.visit("/intern");
      cy.contains("Events werden geladen...").should("be.visible");
    });
  });

  describe("Role Update Functionality", () => {
    it("should update user role from localStorage", () => {
      cy.login({
        id: "user-789",
        name: "Test User",
        email: "test@example.com",
        role: "student",
      });

      cy.mockUserData({
        courses: [],
        events: [],
      });

      // Set role in localStorage before visiting
      cy.window().then((win) => {
        win.localStorage.setItem("selectedUserRole", "teacher");
      });

      cy.visit("/intern");

      // Should call update role API
      cy.wait("@updateRole");

      // Should clear localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem("selectedUserRole")).to.be.null;
      });
    });
  });
});
