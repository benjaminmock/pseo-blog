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
  // Set a simple session cookie
  cy.setCookie('next-auth.session-token', 'mock-teacher-token');
  
  // Mock all possible NextAuth endpoints
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {
      user: {
        id: 'mock-teacher-id',
        email: 'teacher@test.com',
        name: 'Test Teacher',
        role: 'teacher',
        image: null
      },
      expires: '2025-12-31T23:59:59.999Z'
    }
  }).as('getSession');
  
  cy.intercept('GET', '/api/auth/csrf', {
    statusCode: 200,
    body: { csrfToken: 'mock-csrf-token' }
  });
  
  cy.intercept('GET', '/api/auth/providers', {
    statusCode: 200,
    body: {}
  });
});

Cypress.Commands.add('loginAsStudent', () => {
  // Set a simple session cookie
  cy.setCookie('next-auth.session-token', 'mock-student-token');
  
  // Mock all possible NextAuth endpoints
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {
      user: {
        id: 'mock-student-id',
        email: 'student@test.com',
        name: 'Test Student',
        role: 'student',
        image: null
      },
      expires: '2025-12-31T23:59:59.999Z'
    }
  }).as('getSession');
  
  cy.intercept('GET', '/api/auth/csrf', {
    statusCode: 200,
    body: { csrfToken: 'mock-csrf-token' }
  });
  
  cy.intercept('GET', '/api/auth/providers', {
    statusCode: 200,
    body: {}
  });
});

Cypress.Commands.add('logout', () => {
  // Clear all auth-related cookies
  cy.clearCookies();
  
  // Mock empty session response
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {}
  });
});