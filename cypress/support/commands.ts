/// <reference types="cypress" />

// Import additional auth commands
import './auth-commands';

interface UserOptions {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string | null;
  expires?: string;
}

interface MockDataOptions {
  courses?: any[];
  events?: any[];
}

// Custom command to mock authentication without third-party login
// Cypress.Commands.add("login", (userOptions: UserOptions = {}) => {
//   const defaultUser = {
//     id: "test-user-id",
//     name: "Test User",
//     email: "test@example.com",
//     role: "student",
//     image: null,
//   };

//   const user = { ...defaultUser, ...userOptions };

//   // Create a mock session object
//   const session = {
//     user,
//     expires:
//       userOptions.expires ||
//       new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
//   };

//   // Mock the NextAuth session endpoint
//   cy.intercept("GET", "/api/auth/session", {
//     statusCode: 200,
//     body: session,
//   }).as("getSession");

//   // Mock the CSRF token endpoint
//   cy.intercept("GET", "/api/auth/csrf", {
//     statusCode: 200,
//     body: { csrfToken: "mock-csrf-token" },
//   }).as("getCsrf");

//   // Set NextAuth cookies to simulate authenticated state
//   const sessionToken = btoa(JSON.stringify(session));
//   cy.setCookie("next-auth.session-token", sessionToken, {
//     domain: "localhost",
//     httpOnly: false,
//     secure: false,
//   });

//   cy.setCookie("next-auth.csrf-token", "mock-csrf-token", {
//     domain: "localhost",
//     httpOnly: false,
//     secure: false,
//   });

//   // Store session in window for client-side access
//   cy.window().then((win: any) => {
//     win.__NEXT_AUTH_SESSION = session;
//   });
// });

Cypress.Commands.add("login", (userOptions: UserOptions = {}) => {
  const defaultUser = {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    role: "student",
    image: null,
  };

  const user = { ...defaultUser, ...userOptions };

  // Use unique session ID based on user email to prevent conflicts
  const sessionId = `session-${user.email}-${user.role}`;

  cy.session(sessionId, () => {
    // Create a mock session object
    const session = {
      user,
      expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    };

    // Mock the NextAuth session endpoint
    cy.intercept("GET", "/api/auth/session", {
      statusCode: 200,
      body: session,
    }).as("getSession");

    // Mock the CSRF token endpoint
    cy.intercept("GET", "/api/auth/csrf", {
      statusCode: 200,
      body: { csrfToken: "mock-csrf-token" },
    }).as("getCsrf");

    // Set NextAuth cookies to simulate authenticated state
    const sessionToken = btoa(JSON.stringify(session));
    cy.setCookie("next-auth.session-token", sessionToken, {
      domain: "localhost",
      httpOnly: false,
      secure: false,
    });

    cy.setCookie("next-auth.csrf-token", "mock-csrf-token", {
      domain: "localhost",
      httpOnly: false,
      secure: false,
    });

    // Store session in window for client-side access
    cy.window().then((win: any) => {
      win.__NEXT_AUTH_SESSION = session;
    });
  });
});

// Custom command to logout
Cypress.Commands.add("logout", () => {
  // Clear all saved sessions to prevent restoration
  Cypress.session.clearAllSavedSessions();

  cy.clearCookies();
  cy.window().then((win: any) => {
    delete win.__NEXT_AUTH_SESSION;
  });

  // Mock empty session response
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {},
  }).as("getEmptySession");
});

// Custom command to mock API responses for courses and events
Cypress.Commands.add("mockUserData", (options: MockDataOptions = {}) => {
  const { courses = [], events = [] } = options;

  // Mock courses API
  cy.intercept("GET", "/api/courses/my", {
    statusCode: 200,
    body: { courses },
  }).as("getMyCourses");

  // Mock events API
  cy.intercept("GET", "/api/events/my", {
    statusCode: 200,
    body: { events },
  }).as("getMyEvents");

  // Mock course status toggle
  cy.intercept("PUT", "/api/courses/deactivate", {
    statusCode: 200,
    body: { success: true },
  }).as("toggleCourseStatus");

  // Mock event status toggle
  cy.intercept("PUT", "/api/events/deactivate", {
    statusCode: 200,
    body: { success: true },
  }).as("toggleEventStatus");

  // Mock course deletion
  cy.intercept("DELETE", "/api/courses/delete", {
    statusCode: 200,
    body: { message: "Kurs wurde erfolgreich gelöscht" },
  }).as("deleteCourse");

  // Mock event deletion
  cy.intercept("DELETE", "/api/events/delete", {
    statusCode: 200,
    body: { message: "Event wurde erfolgreich gelöscht" },
  }).as("deleteEvent");

  // Mock role update
  cy.intercept("POST", "/api/auth/update-role", {
    statusCode: 200,
    body: { role: "teacher" },
  }).as("updateRole");
});

// Custom command to mock event edit pages
// Cypress.Commands.add(
//   "mockEventEditPage",
//   (eventSlug: string, eventData: any = {}) => {
//     const defaultEventData = {
//       event_id: 1,
//       event_name: "Test Event",
//       description: "Test event description",
//       start_date: "2024-12-25",
//       start_time: "10:00",
//       city_slug: "hamburg",
//       slug: eventSlug,
//       city_id: 1,
//       active: 1,
//       max_participants: 20,
//       price: 89.0,
//       trainer_id: 1,
//       first_name: "Test",
//       last_name: "Teacher",
//     };

//     const event = { ...defaultEventData, ...eventData };

//     // Mock the edit page HTML response
//     cy.intercept("GET", `**/events/${eventSlug}/bearbeiten`, {
//       statusCode: 200,
//       headers: { "content-type": "text/html" },
//       body: `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Event bearbeiten</title>
//         </head>
//         <body>
//           <main class="max-w-4xl mx-auto p-6">
//             <div class="mb-8">
//               <h1 class="text-3xl font-light mb-4 text-gray-900">Event bearbeiten</h1>
//               <p class="text-gray-600">Bearbeiten Sie die Details Ihres Events.</p>
//             </div>
//             <div class="bg-white rounded-lg p-6">
//               <form class="space-y-6">
//                 <div>
//                   <label for="event_name" class="block text-sm font-medium text-gray-700 mb-1">Event-Name *</label>
//                   <input type="text" id="event_name" name="event_name" value="${event.event_name}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <div>
//                   <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
//                   <textarea id="description" name="description" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">${event.description}</textarea>
//                 </div>
//                 <div class="flex gap-4 pt-4">
//                   <button type="submit" class="flex-1 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-black text-white rounded-lg hover:bg-gray-900">Änderungen speichern</button>
//                 </div>
//               </form>
//             </div>
//           </main>
//         </body>
//       </html>
//     `,
//     }).as(`getEditPage_${eventSlug}`);
//   }
// );

// Alternative login method using session mocking (same as login but without cy.session)
Cypress.Commands.add("loginViaAPI", (userOptions: UserOptions = {}) => {
  const defaultUser = {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    role: "student",
    image: null,
  };

  const user = { ...defaultUser, ...userOptions };

  // Create a mock session object
  const session = {
    user,
    expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
  };

  // Mock the NextAuth session endpoint
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: session,
  }).as("getSession");

  // Mock the CSRF token endpoint
  cy.intercept("GET", "/api/auth/csrf", {
    statusCode: 200,
    body: { csrfToken: "mock-csrf-token" },
  }).as("getCsrf");

  // Set NextAuth cookies to simulate authenticated state
  const sessionToken = btoa(JSON.stringify(session));
  cy.setCookie("next-auth.session-token", sessionToken, {
    domain: "localhost",
    httpOnly: false,
    secure: false,
  });

  cy.setCookie("next-auth.csrf-token", "mock-csrf-token", {
    domain: "localhost",
    httpOnly: false,
    secure: false,
  });

  // Store session in window for client-side access
  cy.window().then((win: any) => {
    win.__NEXT_AUTH_SESSION = session;
  });
});

// Fast logout using session clearing
Cypress.Commands.add("logoutViaAPI", () => {
  cy.clearCookies();
  cy.window().then((win: any) => {
    delete win.__NEXT_AUTH_SESSION;
  });

  // Mock empty session response
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {},
  }).as("getEmptySession");
});

// Custom command to click on create event link, handling both mobile and desktop navigation
Cypress.Commands.add("clickCreateEventLink", () => {
  cy.get("body").then(($body) => {
    if ($body.find('label[for="mobile-menu"]').is(":visible")) {
      // Mobile view - open the mobile menu first
      cy.get('label[for="mobile-menu"]').click();
      // Wait for menu to open and then click the mobile link
      cy.get('[data-testid="create-event-link-mobile"]').click();
    } else {
      // Desktop view - click directly in navigation
      cy.get('[data-testid="create-event-link-desktop"]').click();
    }
  });
});

// Custom command to seed trainer data for tests
// Note: This now uses session mocking to simulate a teacher user
Cypress.Commands.add(
  "seedTrainer",
  (email: string, firstName = "Test", lastName = "Teacher") => {
    // Use loginViaAPI with teacher role to create both user and trainer
    cy.loginViaAPI({
      email,
      name: `${firstName} ${lastName}`,
      role: "teacher",
    });

    // Mock trainer-specific API endpoints
    cy.intercept("GET", "/api/trainer/profile", {
      statusCode: 200,
      body: {
        trainer_id: 1,
        first_name: firstName,
        last_name: lastName,
        email: email,
        bio: "Test trainer bio",
      },
    }).as("getTrainerProfile");
  }
);

// Custom command to cleanup trainer data after tests
Cypress.Commands.add("cleanupTrainer", (email: string) => {
  // Clean up user session (no actual API cleanup needed since we're mocking)
  cy.logoutViaAPI();
});

// Custom command to navigate to a link, handling both mobile and desktop navigation
Cypress.Commands.add(
  "navigateToLink",
  (linkText: string, expectedUrl: string) => {
    cy.get("body").then(($body) => {
      if ($body.find('label[for="mobile-menu"]').is(":visible")) {
        // Mobile view - open the mobile menu first
        cy.get('label[for="mobile-menu"]').click();
        // Wait for the mobile menu to be visible and transformed
        cy.get(
          ".fixed.inset-y-0.left-0.transform.peer-checked\\:translate-x-0"
        ).should("be.visible");
        // Wait for menu to open and then click the link
        cy.contains("a", linkText).should("be.visible").click();
      } else {
        // Desktop view - click directly in sub-navigation
        cy.contains("a", linkText).should("be.visible").click();
      }
    });

    // Verify we navigated to the expected URL
    cy.url().should("include", expectedUrl);
  }
);

declare global {
  namespace Cypress {
    interface Chainable {
      login(userOptions?: UserOptions): Chainable<any>;
      logout(): Chainable<any>;
      mockUserData(options?: MockDataOptions): Chainable<any>;
      loginViaAPI(userOptions?: UserOptions): Chainable<any>;
      logoutViaAPI(): Chainable<any>;
      clickCreateEventLink(): Chainable<any>;
      navigateToLink(linkText: string, expectedUrl: string): Chainable<any>;
      seedTrainer(
        email: string,
        firstName?: string,
        lastName?: string
      ): Chainable<any>;
      cleanupTrainer(email: string): Chainable<any>;
    }
  }
}

export {};
