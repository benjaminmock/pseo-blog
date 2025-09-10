// Custom commands for authentication testing

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Mock a user session with the specified role
       * @param role - The user role to mock ('student', 'teacher', 'admin')
       * @param userOverrides - Optional user data overrides
       */
      mockUserSession(role: 'student' | 'teacher' | 'admin', userOverrides?: Partial<{
        id: string;
        email: string;
        name: string;
        image: string;
      }>): Chainable<void>;

      /**
       * Clear the current user session
       */
      clearUserSession(): Chainable<void>;

      /**
       * Login as a test user with the specified role
       * @param role - The user role ('student', 'teacher', 'admin')
       */
      loginAsTestUser(role: 'student' | 'teacher' | 'admin'): Chainable<void>;
    }
  }
}

Cypress.Commands.add('mockUserSession', (role: 'student' | 'teacher' | 'admin', userOverrides = {}) => {
  const defaultUser = {
    id: `test-${role}-${Date.now()}`,
    email: `test-${role}@example.com`,
    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    image: null,
    ...userOverrides
  };

  const session = {
    user: {
      ...defaultUser,
      role
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
  };

  // Mock the session in localStorage for client-side checks
  cy.window().then((win) => {
    win.localStorage.setItem('next-auth.session', JSON.stringify(session));
  });

  // Set session cookies that NextAuth expects
  const sessionToken = `mock-session-${Date.now()}`;
  cy.setCookie('next-auth.session-token', sessionToken);
  
  // Intercept NextAuth session API calls
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: session
  }).as('getSession');

  // Intercept CSRF token requests
  cy.intercept('GET', '/api/auth/csrf', {
    statusCode: 200,
    body: { csrfToken: 'mock-csrf-token' }
  }).as('getCsrf');
});

Cypress.Commands.add('clearUserSession', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Intercept session calls to return null
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: null
  }).as('getSessionNull');
});

Cypress.Commands.add('loginAsTestUser', (role: 'student' | 'teacher' | 'admin') => {
  // This command would integrate with your actual authentication system
  // For now, it uses the mock session approach
  cy.mockUserSession(role);
  
  // Visit a protected page to trigger session validation
  cy.visit('/profil');
  cy.wait('@getSession');
});

// Helper function to create test users in the database
export function createTestUser(role: 'student' | 'teacher' | 'admin') {
  return cy.task('createTestUser', { role });
}

// Helper function to clean up test users
export function cleanupTestUsers() {
  return cy.task('cleanupTestUsers');
}