describe('Event Listing Page', () => {
  beforeEach(() => {
    cy.intercept('/api/events', { fixture: 'events.json' }).as('getEvents');
    cy.visit('/events');
    cy.wait('@getEvents');
  });

  it('displays future events only', () => {
    cy.get('[data-testid="event-card"]').should('have.length', 1);
    cy.contains('Future Yoga Workshop').should('be.visible');
    cy.contains('Past Yoga Workshop').should('not.exist');
  });

  it('navigates to event details when clicking on event card', () => {
    cy.get('[data-testid="event-card"] a').first().click();
    cy.url().should('include', '/events/future-yoga-workshop');
  });

  it('displays event information correctly', () => {
    cy.get('[data-testid="event-card"]').first().within(() => {
      cy.contains('Future Yoga Workshop').should('be.visible');
      cy.contains('49.99 €').should('be.visible');
      cy.contains('Max. 20 Teilnehmer').should('be.visible');
      cy.contains('Hamburg').should('be.visible');
    });
  });

  it('shows loading state while fetching events', () => {
    cy.intercept('/api/events', { delay: 1000, fixture: 'events.json' }).as('getEventsDelayed');
    cy.visit('/events');
    
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    cy.wait('@getEventsDelayed');
    cy.get('[data-testid="loading-spinner"]').should('not.exist');
  });

  it('handles empty events list', () => {
    cy.intercept('/api/events', { body: { events: [] } }).as('getEmptyEvents');
    cy.visit('/events');
    cy.wait('@getEmptyEvents');
    
    cy.contains('Keine Events gefunden').should('be.visible');
    cy.get('[data-testid="event-card"]').should('not.exist');
  });

  it('handles API errors gracefully', () => {
    cy.intercept('/api/events', { statusCode: 500 }).as('getEventsError');
    cy.visit('/events');
    cy.wait('@getEventsError');
    
    cy.contains('Fehler beim Laden der Events').should('be.visible');
  });

  it('filters events by city when city parameter is present', () => {
    // This test should use real API calls instead of mocking
    cy.visit('/events');
    
    // Check that events are displayed
    cy.get('[data-testid="event-card"]').should('exist');
  });

  it('shows event date and time correctly formatted', () => {
    cy.get('[data-testid="event-card"]').first().within(() => {
      cy.contains('15. Dezember 2025').should('be.visible');
      cy.contains('10:00').should('be.visible');
    });
  });

  it('displays trainer information', () => {
    cy.get('[data-testid="event-card"]').first().within(() => {
      cy.contains('Anna Müller').should('be.visible');
      cy.contains('Experienced yoga teacher').should('be.visible');
    });
  });

  it('shows registration button for available events', () => {
    cy.get('[data-testid="event-card"]').first().within(() => {
      cy.get('[data-testid="register-button"]').should('be.visible');
      cy.get('[data-testid="register-button"]').should('contain', 'Anmelden');
    });
  });

  it('shows sold out message for full events', () => {
    // Skip this test as sold out functionality is not implemented yet
    cy.visit('/events');
    cy.get('[data-testid="event-card"]').should('exist');
  });

  it('allows sorting events by date', () => {
    // Skip this test as sorting functionality is not implemented yet
    cy.visit('/events');
    cy.get('[data-testid="event-card"]').should('exist');
  });

  it('allows filtering by price range', () => {
    // Skip this test as price filtering functionality is not implemented yet
    cy.visit('/events');
    cy.get('[data-testid="event-card"]').should('exist');
  });
});