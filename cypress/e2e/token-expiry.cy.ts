/// <reference types="cypress" />

/**
 * Simulate token expiry by deleting Amplify localStorage keys.
 * Expected behaviour: app detects unauthenticated state and redirects to /login.
 */

describe('Token expiry handling', () => {
  const email = Cypress.env('USERNAME');
  const password = Cypress.env('PASSWORD');

  it('redirects to login when token storage cleared', () => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type(email);
    cy.get('input[type="password"], input[name="password"]').type(password, { log: false });
    cy.get('button[type="submit"], button:contains("Sign in")').click();
    cy.contains('Dashboard').should('exist');

    // Delete all Amplify/Cognito keys from localStorage to mimic expiry
    cy.window().then((win) => {
      Object.keys(win.localStorage)
        .filter((k) => k.includes('CognitoIdentityServiceProvider'))
        .forEach((k) => win.localStorage.removeItem(k));
    });

    // Attempt to navigate to protected page triggers auth check
    cy.visit('/users');
    cy.url().should('include', '/login');
  });
});
