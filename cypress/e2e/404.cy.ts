/// <reference types="cypress" />

// 404 route handling: navigating to an unknown path should display NotFound page and offer navigation home.

describe('404 page', () => {
  it('shows not found and navigates home', () => {
    cy.visit('/non-existent-route', { failOnStatusCode: false });
    cy.contains(/404|not found/i).should('exist');

    // Click link or button that routes back to home
    cy.contains('a', /go back home/i).click();
    cy.url().should('match', /\/$|\/dashboard/);
  });
});
