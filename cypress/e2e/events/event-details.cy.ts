describe('Event Details Page', () => {
  beforeEach(() => {
    cy.intercept('/api/events/future-yoga-workshop', {
      fixture: 'event-details.json'
    }).as('getEvent');
    
    cy.visit('/events/future-yoga-workshop');
    cy.wait('@getEvent');
  });

  it('displays complete event information', () => {
    cy.get('h1').should('contain', 'Future Yoga Workshop');
    cy.contains('Trainer').should('be.visible');
    cy.contains('Anna Müller').should('be.visible');
    cy.contains('Datum').should('be.visible');
    cy.contains('15. Dezember 2025').should('be.visible');
    cy.contains('49,99 €').should('be.visible');
    cy.contains('Max. 20 Teilnehmer').should('be.visible');
  });

  it('shows detailed event description', () => {
    cy.get('[data-testid="event-description"]').should('contain', 'A wonderful yoga workshop for all levels');
  });

  it('displays trainer bio and information', () => {
    cy.get('[data-testid="trainer-section"]').within(() => {
      cy.contains('Anna Müller').should('be.visible');
      cy.contains('Experienced yoga teacher with over 10 years').should('be.visible');
    });
  });

  it('shows event schedule information', () => {
    cy.get('[data-testid="schedule-section"]').within(() => {
      cy.contains('15. Dezember 2025').should('be.visible');
      cy.contains('10:00 - 11:30').should('be.visible');
    });
  });

  it('displays location information', () => {
    cy.get('[data-testid="location-section"]').within(() => {
      cy.contains('Yoga Studio Hamburg').should('be.visible');
      cy.contains('Musterstraße 123, 20095 Hamburg').should('be.visible');
    });
  });

  it('shows payment section for paid events', () => {
    cy.get('[data-testid="payment-section"]').should('be.visible');
    cy.get('[data-testid="register-button"]').should('contain', 'Jetzt anmelden');
  });

  it('shows participant count and availability', () => {
    cy.get('[data-testid="participant-info"]').within(() => {
      cy.contains('5 von 20 Teilnehmern').should('be.visible');
      cy.contains('15 Plätze verfügbar').should('be.visible');
    });
  });

  it('shows edit button for event owner', () => {
    cy.loginAsTeacher();
    cy.visit('/events/future-yoga-workshop');
    cy.wait('@getEvent');
    
    cy.get('[data-testid="edit-event-button"]').should('be.visible');
    cy.get('[data-testid="edit-event-button"]').should('contain', 'Event bearbeiten');
  });

  it('does not show edit button for non-owners', () => {
    cy.loginAsStudent();
    cy.visit('/events/future-yoga-workshop');
    cy.wait('@getEvent');
    
    cy.get('[data-testid="edit-event-button"]').should('not.exist');
  });

  it('handles registration for authenticated users', () => {
    cy.intercept('POST', '/api/events/1/register', {
      statusCode: 200,
      body: { success: true, registrationId: 123 }
    }).as('registerForEvent');

    cy.loginAsStudent();
    cy.visit('/events/future-yoga-workshop');
    cy.wait('@getEvent');
    
    cy.get('[data-testid="register-button"]').click();
    cy.wait('@registerForEvent');
    
    cy.contains('Erfolgreich angemeldet').should('be.visible');
  });

  it('redirects unauthenticated users to login when trying to register', () => {
    cy.logout();
    cy.visit('/events/future-yoga-workshop');
    cy.wait('@getEvent');
    
    cy.get('[data-testid="register-button"]').click();
    cy.url().should('include', '/login');
  });

  it('shows sold out message for full events', () => {
    cy.intercept('/api/events/future-yoga-workshop', {
      body: {
        ...require('../../../fixtures/event-details.json'),
        current_participants: 20,
        max_participants: 20
      }
    }).as('getFullEvent');
    
    cy.visit('/events/future-yoga-workshop');
    cy.wait('@getFullEvent');
    
    cy.contains('Ausgebucht').should('be.visible');
    cy.get('[data-testid="register-button"]').should('not.exist');
  });

  it('handles event not found error', () => {
    cy.intercept('/api/events/non-existent-event', {
      statusCode: 404,
      body: { error: 'Event not found' }
    }).as('getEventNotFound');
    
    cy.visit('/events/non-existent-event');
    cy.wait('@getEventNotFound');
    
    cy.contains('Event nicht gefunden').should('be.visible');
  });

  it('shows waitlist option when event is full', () => {
    cy.intercept('/api/events/future-yoga-workshop', {
      body: {
        ...require('../../../fixtures/event-details.json'),
        current_participants: 20,
        max_participants: 20,
        waitlist_enabled: 1
      }
    }).as('getFullEventWithWaitlist');
    
    cy.visit('/events/future-yoga-workshop');
    cy.wait('@getFullEventWithWaitlist');
    
    cy.get('[data-testid="waitlist-button"]').should('be.visible');
    cy.get('[data-testid="waitlist-button"]').should('contain', 'Auf Warteliste setzen');
  });

  it('displays event images when available', () => {
    cy.get('[data-testid="event-images"]').should('be.visible');
    cy.get('[data-testid="event-image"]').should('have.length.at.least', 1);
  });

  it('shows sharing options', () => {
    cy.get('[data-testid="share-section"]').should('be.visible');
    cy.get('[data-testid="share-facebook"]').should('be.visible');
    cy.get('[data-testid="share-twitter"]').should('be.visible');
    cy.get('[data-testid="copy-link"]').should('be.visible');
  });

  it('allows copying event link to clipboard', () => {
    cy.get('[data-testid="copy-link"]').click();
    cy.contains('Link kopiert').should('be.visible');
  });

  it('shows related events section', () => {
    cy.intercept('/api/events/related/future-yoga-workshop', {
      body: {
        events: [{
          event_id: 2,
          event_name: 'Advanced Yoga Workshop',
          slug: 'advanced-yoga-workshop',
          price: 59.99
        }]
      }
    }).as('getRelatedEvents');
    
    cy.wait('@getRelatedEvents');
    
    cy.get('[data-testid="related-events"]').should('be.visible');
    cy.contains('Ähnliche Events').should('be.visible');
    cy.contains('Advanced Yoga Workshop').should('be.visible');
  });
});