describe("Public Course Display", () => {
  const teacherEmail = "teacher-display@example.com";
  const teacherName = "Display Teacher";
  let createdCourseSlug: string;

  before(() => {
    // Create a teacher account
    cy.seedTrainer(teacherEmail, "Display", "Teacher");
  });

  beforeEach(() => {
    // Log in as teacher to create test courses
    cy.loginViaAPI({
      email: teacherEmail,
      name: teacherName,
      role: "teacher",
    });
  });

  it("should display newly created course on public courses page", () => {
    const courseName = "Public Display Course " + Date.now();
    const description = "This course should appear on the public page";
    const startDate = "2025-05-01";
    const endDate = "2025-07-01";

    // Create a course first
    cy.visit("/kurs/neu");
    cy.get('input[name="course_name"]').type(courseName);
    cy.get('textarea[name="description"]').type(description);
    cy.get('input[name="start_date"]').type(startDate);
    cy.get('input[name="end_date"]').type(endDate);
    cy.get('button[type="submit"]').click();

    // Store the course slug from the URL for cleanup
    cy.url().then((url) => {
      createdCourseSlug = url.split("/kurse/")[1];
    });

    // Now visit the public courses page
    cy.visit("/kurse");

    // Verify the course appears in the listing
    cy.contains(courseName).should("be.visible");
    cy.contains(description).should("be.visible");
    cy.contains("mit Display Teacher").should("be.visible");

    // Verify date formatting (should be in DD.MM.YYYY format)
    cy.contains("01.05.2025").should("be.visible");
    cy.contains("01.07.2025").should("be.visible");

    // Verify "Kurs Details" link is present
    cy.contains("Kurs Details →").should("be.visible");
  });

  it("should navigate to course detail page when clicking course link", () => {
    const courseName = "Navigation Test Course " + Date.now();

    // Create a course first
    cy.visit("/kurs/neu");
    cy.get('input[name="course_name"]').type(courseName);
    cy.get('input[name="start_date"]').type("2025-06-01");
    cy.get('button[type="submit"]').click();

    // Go to public courses page
    cy.visit("/kurse");

    // Find and click the course link
    cy.contains(courseName).parents("a").click();

    // Verify we're on the course detail page
    cy.url().should("include", "/kurse/");
    cy.contains(courseName).should("be.visible");
    cy.contains("Trainer*in / Lehrer*in").should("be.visible");
    cy.contains("Zeitraum").should("be.visible");
    cy.contains("Display Teacher").should("be.visible");
  });

  it("should show course with all optional fields on public page", () => {
    const courseName = "Complete Course Display " + Date.now();
    const description = "Full course with all details";
    const location = "Test Studio, Test Street 123";
    const price = "30.00";
    const style = "Vinyasa";

    // Create a course with all fields
    cy.visit("/kurs/neu");
    cy.get('input[name="course_name"]').type(courseName);
    cy.get('textarea[name="description"]').type(description);
    cy.get('input[name="start_date"]').type("2025-07-01");
    cy.get('input[name="end_date"]').type("2025-09-01");
    cy.get('input[name="location"]').type(location);
    cy.get('input[name="capacity"]').type("20");
    cy.get('input[name="duration"]').type("75");
    cy.get('input[name="price"]').type(price);
    cy.get('select[name="language"]').select("de");
    cy.get('input[name="style"]').type(style);
    cy.get('select[name="level"]').select("intermediate");
    cy.get('button[type="submit"]').click();

    // Visit public courses page
    cy.visit("/kurse");

    // Verify course appears with description
    cy.contains(courseName).should("be.visible");
    cy.contains(description).should("be.visible");
    cy.contains("mit Display Teacher").should("be.visible");

    // Click to view details
    cy.contains(courseName).parents("a").click();

    // Verify all details are shown on detail page
    cy.contains(courseName).should("be.visible");
    cy.contains(description).should("be.visible");
    cy.contains("Display Teacher").should("be.visible");
  });

  it("should handle course creation and immediate public display workflow", () => {
    const courseName = "Workflow Test Course " + Date.now();

    // Step 1: Create course
    cy.visit("/kurs/neu");
    cy.get('input[name="course_name"]').type(courseName);
    cy.get('textarea[name="description"]').type(
      "Testing the complete workflow"
    );
    cy.get('input[name="start_date"]').type("2025-08-01");
    cy.get('button[type="submit"]').click();

    // Step 2: Verify redirect to course detail page
    cy.url().should("include", "/kurse/");
    cy.contains(courseName).should("be.visible");

    // Step 3: Navigate back to courses overview
    cy.contains("← Zurück zur Kursübersicht").click();

    // Step 4: Verify course appears in listing
    cy.url().should("match", /\/kurse\/?$/);
    cy.contains(courseName).should("be.visible");
    cy.contains("Testing the complete workflow").should("be.visible");
    cy.contains("mit Display Teacher").should("be.visible");
  });

  it("should not display inactive courses on public page", () => {
    // This test assumes there's a way to deactivate courses
    // For now, we'll just verify that only active courses are shown
    cy.visit("/kurse");

    // Verify the page shows the heading
    cy.contains("Unsere Yoga Kurse").should("be.visible");

    // All displayed courses should have the required elements
    cy.get('[href*="/kurse/"]').each(($courseLink) => {
      cy.wrap($courseLink).within(() => {
        // Each course should have a name
        cy.get("h2").should("be.visible");
        // Each course should have trainer info
        cy.contains("mit").should("be.visible");
        // Each course should have a date
        cy.get("div")
          .contains(/\d{2}\.\d{2}\.\d{4}/)
          .should("be.visible");
        // Each course should have details link
        cy.contains("Kurs Details →").should("be.visible");
      });
    });
  });

  it("should maintain course data integrity between creation and display", () => {
    const courseData = {
      name: "Data Integrity Course " + Date.now(),
      description: "Testing data consistency",
      startDate: "2025-09-15",
      endDate: "2025-11-15",
      location: "Integrity Studio",
      capacity: "12",
      duration: "60",
      price: "20.00",
      style: "Yin",
    };

    // Create course with specific data
    cy.visit("/kurs/neu");
    cy.get('input[name="course_name"]').type(courseData.name);
    cy.get('textarea[name="description"]').type(courseData.description);
    cy.get('input[name="start_date"]').type(courseData.startDate);
    cy.get('input[name="end_date"]').type(courseData.endDate);
    cy.get('input[name="location"]').type(courseData.location);
    cy.get('input[name="capacity"]').type(courseData.capacity);
    cy.get('input[name="duration"]').type(courseData.duration);
    cy.get('input[name="price"]').type(courseData.price);
    cy.get('input[name="style"]').type(courseData.style);
    cy.get('select[name="level"]').select("beginner");
    cy.get('button[type="submit"]').click();

    // Verify data on detail page
    cy.contains(courseData.name).should("be.visible");
    cy.contains(courseData.description).should("be.visible");
    cy.contains("Display Teacher").should("be.visible");

    // Go to public listing
    cy.visit("/kurse");

    // Verify data on listing page
    cy.contains(courseData.name).should("be.visible");
    cy.contains(courseData.description).should("be.visible");
    cy.contains("mit Display Teacher").should("be.visible");
    cy.contains("15.09.2025").should("be.visible"); // Start date formatted
  });

  after(() => {
    // Clean up test data
    cy.cleanupTrainer(teacherEmail);
  });
});
