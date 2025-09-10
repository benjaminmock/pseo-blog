/// <reference types="cypress" />

// Custom commands for authentication
declare namespace Cypress {
  interface Chainable {
    loginAsTeacher(): Chainable<void>
    loginAsStudent(): Chainable<void>
    logout(): Chainable<void>
  }
}

Cypress.Commands.add('loginAsTeacher', () => {
  // Create a real session by calling our custom API endpoint
  cy.request({
    method: 'POST',
    url: '/api/test/auth',
    body: {
      email: 'teacher@test.com',
      role: 'teacher'
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    // The session cookie should be set automatically by the response
  });
});

Cypress.Commands.add('loginAsStudent', () => {
  // Create a real session by calling our custom API endpoint
  cy.request({
    method: 'POST',
    url: '/api/test/auth',
    body: {
      email: 'student@test.com',
      role: 'student'
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    // The session cookie should be set automatically by the response
  });
});

Cypress.Commands.add('logout', () => {
  // Call the real logout endpoint
  cy.request({
    method: 'POST',
    url: '/api/auth/signout',
    failOnStatusCode: false
  });
  
  // Clear all cookies to ensure clean state
  cy.clearCookies();
});