/// <reference types="cypress" />

/**
 * Logout flow verification
 * 1. Logs in with valid admin credentials
 * 2. Clicks the user menu → logout
 * 3. Should be redirected to /login (or see the login form)
 * 4. Visiting a protected page again should redirect back to /login (session cleared)
 */

describe('Logout flow', () => {
  const email = Cypress.env('USERNAME');
  const password = Cypress.env('PASSWORD');

  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type(email);
    cy.get('input[type="password"], input[name="password"]').type(password, { log: false });
    cy.get('button[type="submit"], button:contains("Sign in")').click();
    cy.contains('Dashboard').should('exist');
  });

  it('logs out and protects routes', () => {
    // Click any element that triggers logout (menu item or button with text 'Logout')
    cy.get('[data-cy="logout-btn"]').click();

    // Should land on login page again
    cy.url().should('include', '/login');
    cy.contains('Sign in').should('exist');

    // Attempt to visit protected /users page → should redirect back to login (session gone)
    cy.visit('/users');
    cy.url().should('include', '/login');
  });
});
