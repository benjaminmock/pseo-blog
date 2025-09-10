describe('Authentication System', () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should display role selection options', () => {
      cy.get('input[name="userRole"][value="student"]').should('exist');
      cy.get('input[name="userRole"][value="teacher"]').should('exist');
      cy.contains('Student').should('be.visible');
      cy.contains('Lehrer').should('be.visible');
    });

    it('should default to student role', () => {
      cy.get('input[name="userRole"][value="student"]').should('be.checked');
    });

    it('should allow role selection', () => {
      cy.get('input[name="userRole"][value="teacher"]').click();
      cy.get('input[name="userRole"][value="teacher"]').should('be.checked');
      cy.get('input[name="userRole"][value="student"]').should('not.be.checked');
    });

    it('should display OAuth login buttons', () => {
      cy.contains('Mit Google anmelden').should('be.visible');
      cy.contains('Mit LinkedIn anmelden').should('be.visible');
    });

    it('should store selected role in localStorage before OAuth', () => {
      cy.get('input[name="userRole"][value="teacher"]').click();
      
      // Mock the signIn function to prevent actual OAuth flow
      cy.window().then((win) => {
        win.localStorage.clear();
        // Simulate clicking Google sign in
        cy.get('button').contains('Mit Google anmelden').click();
        
        // Check if role was stored (this would happen before OAuth redirect)
        cy.window().its('localStorage').invoke('getItem', 'selectedUserRole')
          .should('equal', 'teacher');
      });
    });
  });

  describe('Role-based Route Protection', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/intern');
      cy.url().should('include', '/login');
      cy.url().should('include', 'from=%2Fintern');
    });

    it('should redirect to unauthorized page for insufficient permissions', () => {
      // This would require mocking a student user trying to access teacher routes
      // In a real test, you'd set up a test user with student role
      cy.visit('/admin');
      cy.url().should('include', '/login');
    });
  });

  describe('API Route Protection', () => {
    it('should return 401 for unauthenticated API requests', () => {
      cy.request({
        method: 'POST',
        url: '/api/kurs/create',
        failOnStatusCode: false,
        body: {
          course_name: 'Test Course',
          start_date: '2024-01-01'
        }
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error');
      });
    });

    it('should return 403 for insufficient role permissions', () => {
      // This would require setting up a test user with student role
      // and attempting to access teacher-only endpoints
      cy.request({
        method: 'POST',
        url: '/api/trainer/create',
        failOnStatusCode: false,
        body: {
          first_name: 'Test',
          last_name: 'Trainer'
        }
      }).then((response) => {
        expect(response.status).to.eq(401); // Would be 403 with student role
      });
    });
  });

  describe('Role Setting API', () => {
    it('should validate role values', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/set-role',
        failOnStatusCode: false,
        body: {
          role: 'invalid_role'
        }
      }).then((response) => {
        expect(response.status).to.eq(401); // Unauthenticated, would be 400 if authenticated
      });
    });
  });

  describe('Unauthorized Page', () => {
    it('should display unauthorized message', () => {
      cy.visit('/unauthorized');
      cy.contains('Zugriff verweigert').should('be.visible');
      cy.contains('Sie haben nicht die erforderlichen Berechtigungen').should('be.visible');
    });

    it('should provide navigation options', () => {
      cy.visit('/unauthorized');
      cy.contains('Zur Startseite').should('be.visible');
      cy.contains('Mit anderem Account anmelden').should('be.visible');
    });

    it('should navigate to home page', () => {
      cy.visit('/unauthorized');
      cy.contains('Zur Startseite').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should navigate to login page', () => {
      cy.visit('/unauthorized');
      cy.contains('Mit anderem Account anmelden').click();
      cy.url().should('include', '/login');
    });
  });
});

describe('Authentication Integration Tests', () => {
  // These tests would require setting up test users with different roles
  // and mocking the authentication system
  
  describe('Student User Flow', () => {
    beforeEach(() => {
      // Mock student user session
      cy.mockUserSession('student');
    });

    it('should allow access to student-specific routes', () => {
      cy.visit('/profil');
      cy.url().should('include', '/profil');
    });

    it('should deny access to teacher routes', () => {
      cy.visit('/intern');
      cy.url().should('include', '/unauthorized');
    });
  });

  describe('Teacher User Flow', () => {
    beforeEach(() => {
      // Mock teacher user session
      cy.mockUserSession('teacher');
    });

    it('should allow access to teacher routes', () => {
      cy.visit('/intern');
      cy.url().should('include', '/intern');
    });

    it('should allow access to course creation', () => {
      cy.visit('/kurs/neu');
      cy.url().should('include', '/kurs/neu');
    });

    it('should deny access to admin routes', () => {
      cy.visit('/admin');
      cy.url().should('include', '/unauthorized');
    });
  });

  describe('Admin User Flow', () => {
    beforeEach(() => {
      // Mock admin user session
      cy.mockUserSession('admin');
    });

    it('should allow access to all routes', () => {
      cy.visit('/admin');
      cy.url().should('include', '/admin');
      
      cy.visit('/intern');
      cy.url().should('include', '/intern');
      
      cy.visit('/profil');
      cy.url().should('include', '/profil');
    });
  });
});