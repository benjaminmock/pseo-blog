describe("Event and Course Deletion", () => {
  beforeEach(() => {
    // Visit the intern page (assuming user is logged in)
    cy.visit("/intern");
  });

  it("should show delete buttons for courses and events", () => {
    // Check if delete buttons are present for courses
    cy.get('[data-testid="course-item"]').should("exist");
    cy.get("button").contains("Löschen").should("exist");

    // Check if delete buttons are present for events
    cy.get('[data-testid="event-item"]').should("exist");
    cy.get("button").contains("Löschen").should("exist");
  });

  it("should show confirmation dialog when deleting a course", () => {
    // Mock the confirm dialog
    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(false);
    });

    // Click delete button for first course
    cy.get("button").contains("Löschen").first().click();

    // Verify confirm was called
    cy.window().its("confirm").should("have.been.called");
  });

  it("should show confirmation dialog when deleting an event", () => {
    // Mock the confirm dialog
    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(false);
    });

    // Click delete button for first event
    cy.get("button").contains("Löschen").last().click();

    // Verify confirm was called
    cy.window().its("confirm").should("have.been.called");
  });
});
