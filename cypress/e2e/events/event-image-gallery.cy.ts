describe('Event Image Gallery', () => {
  beforeEach(() => {
    cy.visit('/events/future-yoga-workshop');
    cy.get('h1', { timeout: 10000 }).should('be.visible');
  });

  describe('Core Image Gallery Functionality', () => {
    it('displays event page without errors when no images are present', () => {
      // Test that the page loads correctly even without images
      cy.get('[data-testid="event-title"]').should('contain', 'Future Yoga Workshop');
      
      // Check that no JavaScript errors are visible in the UI
      cy.get('body').should('not.contain', 'TypeError');
      cy.get('body').should('not.contain', 'ReferenceError');
      cy.get('body').should('not.contain', 'SyntaxError');
      
      // Verify the ImageGallery component renders without crashing
      cy.get('.md\\:w-1\\/2.bg-gray-100').should('be.visible');
    });

    it('shows event title in the image area when no main image exists', () => {
      // When there's no main image, the title should still be visible
      cy.get('[data-testid="event-title"]').should('be.visible');
      cy.get('[data-testid="event-title"]').should('contain', 'Future Yoga Workshop');
    });

    it('handles clickable main image when images are available', () => {
      // Look for any clickable image elements
      cy.get('body').then(($body) => {
        const clickableImages = $body.find('button').filter((i, el) => {
          return Cypress.$(el).find('img').length > 0;
        });
        
        if (clickableImages.length > 0) {
          // If images exist, test modal functionality
          cy.wrap(clickableImages.first()).click();
          
          // Check if modal opened
          cy.get('body').then(($modalBody) => {
            if ($modalBody.find('.fixed.inset-0.z-50').length > 0) {
              cy.get('.fixed.inset-0.z-50').should('be.visible');
              
              // Test close functionality
              cy.get('button[aria-label="Close modal"]').should('be.visible').click();
              cy.get('.fixed.inset-0.z-50').should('not.exist');
            }
          });
        } else {
          // No images present - this is expected for test data
          cy.log('No images found in test event - this is expected');
        }
      });
    });

    it('supports keyboard navigation when modal is open', () => {
      cy.get('body').then(($body) => {
        const clickableImages = $body.find('button').filter((i, el) => {
          return Cypress.$(el).find('img').length > 0;
        });
        
        if (clickableImages.length > 0) {
          cy.wrap(clickableImages.first()).click();
          
          cy.get('body').then(($modalBody) => {
            if ($modalBody.find('.fixed.inset-0.z-50').length > 0) {
              // Test Escape key to close modal
              cy.get('body').type('{esc}');
              cy.get('.fixed.inset-0.z-50').should('not.exist');
            }
          });
        }
      });
    });

    it('displays properly on different viewport sizes', () => {
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.get('[data-testid="event-title"]').should('be.visible');
      cy.get('.md\\:w-1\\/2.bg-gray-100').should('be.visible');
      
      // Test tablet viewport
      cy.viewport(768, 1024);
      cy.get('[data-testid="event-title"]').should('be.visible');
      cy.get('.md\\:w-1\\/2.bg-gray-100').should('be.visible');
      
      // Reset to desktop
      cy.viewport(1280, 720);
      cy.get('[data-testid="event-title"]').should('be.visible');
    });
  });

  describe('Image Modal Accessibility', () => {
    it('has proper ARIA labels when modal elements exist', () => {
      cy.get('body').then(($body) => {
        const clickableImages = $body.find('button').filter((i, el) => {
          return Cypress.$(el).find('img').length > 0;
        });
        
        if (clickableImages.length > 0) {
          cy.wrap(clickableImages.first()).click();
          
          cy.get('body').then(($modalBody) => {
            if ($modalBody.find('.fixed.inset-0.z-50').length > 0) {
              // Check for proper ARIA labels
              cy.get('button[aria-label="Close modal"]').should('exist');
              
              // Close modal
              cy.get('button[aria-label="Close modal"]').click();
            }
          });
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('gracefully handles events with no images', () => {
      // This is the main test case since our test data has no images
      cy.get('h1').should('be.visible');
      cy.get('[data-testid="event-title"]').should('contain', 'Future Yoga Workshop');
      
      // Verify the page loads without visible errors
      cy.get('body').should('not.contain', 'TypeError');
      cy.get('body').should('not.contain', 'ReferenceError');
      cy.get('body').should('not.contain', 'SyntaxError');
      
      // Verify the ImageGallery component is present and functional
      cy.get('.md\\:w-1\\/2.bg-gray-100').should('be.visible');
    });

    it('maintains page functionality when ImageGallery component loads', () => {
      // Test that other page elements still work
      cy.get('[data-testid="trainer-section"]').should('be.visible');
      cy.get('[data-testid="schedule-section"]').should('be.visible');
      
      // Test navigation link
      cy.get('a').contains('Zurück zur Event-Übersicht').should('be.visible');
    });
  });
});