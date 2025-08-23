describe("Course Creation", () => {
  const teacherEmail = "teacher@example.com";
  const teacherName = "Test Teacher";

  before(() => {
    // Create a teacher account
    cy.seedTrainer(teacherEmail, "Test", "Teacher");
  });

  beforeEach(() => {
    // Log in as teacher before each test
    cy.loginViaAPI({
      email: teacherEmail,
      name: teacherName,
      role: "teacher",
    });
  });

  it("should display course creation form for teachers", () => {
    cy.visit("/kurs/neu");

    // Check that the page loads correctly
    cy.contains("Kurs erstellen").should("be.visible");

    // Verify all required form fields are present
    cy.get('input[name="course_name"]').should("be.visible");
    cy.get('textarea[name="description"]').should("be.visible");
    cy.get('input[name="start_date"]').should("be.visible");
    cy.get('input[name="end_date"]').should("be.visible");
    cy.get('input[name="location"]').should("be.visible");
    cy.get('input[name="capacity"]').should("be.visible");
    cy.get('input[name="duration"]').should("be.visible");
    cy.get('input[name="price"]').should("be.visible");
    cy.get('select[name="language"]').should("be.visible");
    cy.get('input[name="style"]').should("be.visible");
    cy.get('select[name="level"]').should("be.visible");

    // Check submit button
    cy.get('button[type="submit"]')
      .should("be.visible")
      .and("contain", "Kurs erstellen");
  });

  it("should create a new course with required fields only", () => {
    cy.visit("/kurs/neu");

    const courseName = "Yoga Basics " + Date.now();
    const startDate = "2025-03-15";

    // Fill out required fields
    cy.get('input[name="course_name"]').type(courseName);
    cy.get('input[name="start_date"]').type(startDate);

    // Submit form
    cy.get('button[type="submit"]').click();

    // Verify successful creation - should redirect to course detail page
    cy.url().should("include", "/kurse/");
    cy.contains(courseName).should("be.visible");
  });

  it("should create a new course with all fields filled", () => {
    cy.visit("/kurs/neu");

    const courseName = "Complete Yoga Course " + Date.now();
    const description = "A comprehensive yoga course for all levels";
    const startDate = "2025-04-01";
    const endDate = "2025-06-01";
    const location = "Yogastudio Hamburg, Hauptstraße 123";
    const capacity = "15";
    const duration = "90";
    const price = "25.00";
    const style = "Hatha";

    // Fill out all fields
    cy.get('input[name="course_name"]').type(courseName);
    cy.get('textarea[name="description"]').type(description);
    cy.get('input[name="start_date"]').type(startDate);
    cy.get('input[name="end_date"]').type(endDate);
    cy.get('input[name="location"]').type(location);
    cy.get('input[name="capacity"]').type(capacity);
    cy.get('input[name="duration"]').type(duration);
    cy.get('input[name="price"]').type(price);
    cy.get('select[name="language"]').select("de");
    cy.get('input[name="style"]').type(style);
    cy.get('select[name="level"]').select("beginner");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Verify successful creation
    cy.url().should("include", "/kurse/");
    cy.contains(courseName).should("be.visible");
    cy.contains(description).should("be.visible");
    cy.contains("Test Teacher").should("be.visible");
  });

  it("should show validation error for missing required fields", () => {
    cy.visit("/kurs/neu");

    // Try to submit without filling required fields
    cy.get('button[type="submit"]').click();

    // Check that form validation prevents submission
    cy.get('input[name="course_name"]:invalid').should("exist");
    cy.get('input[name="start_date"]:invalid').should("exist");
  });

  it("should handle form submission errors gracefully", () => {
    // Mock API error response
    cy.intercept("POST", "/api/kurs/create", {
      statusCode: 400,
      body: { error: "Kursname bereits vergeben" },
    }).as("createCourseError");

    cy.visit("/kurs/neu");

    // Fill out form
    cy.get('input[name="course_name"]').type("Duplicate Course");
    cy.get('input[name="start_date"]').type("2025-03-15");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Wait for API call
    cy.wait("@createCourseError");

    // Check error message is displayed
    cy.contains("Kursname bereits vergeben").should("be.visible");
    cy.get(".text-red-700").should("be.visible");
  });

  it("should prevent non-teachers from accessing course creation", () => {
    // Login as student
    cy.loginViaAPI({
      email: "student@example.com",
      role: "student",
    });

    cy.visit("/kurs/neu");

    // Should show permission denied message
    cy.contains("Sie haben nicht die Berechtigung, Kurse zu erstellen").should(
      "be.visible"
    );
    cy.contains(
      'Nur Nutzer mit der Rolle "Lehrer" können Kurse erstellen'
    ).should("be.visible");
    cy.get('button[type="submit"]').should("not.exist");
  });

  after(() => {
    // Clean up test data
    cy.cleanupTrainer(teacherEmail);
  });
});
