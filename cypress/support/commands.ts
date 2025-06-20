/// <reference types="cypress" />

// Custom command to log in via the UI form. Re-usable across specs.
// Stores the session in Cypress.session() so repeated tests are fast.

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Perform UI login using default or provided credentials.
       * @example cy.loginByForm('admin@example.com', 'password')
       */
      loginByForm(email?: string, password?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  'loginByForm',
  (email: string = Cypress.env('username') || 'admin@example.com', password: string = Cypress.env('password') || 'password') => {
    cy.session([email, password], () => {
      cy.visit('/login');
      cy.get('[data-testid="email"]').type(email);
      cy.get('[data-testid="password"]').type(password, { log: false });
      cy.get('[data-testid="login-submit"]').click();
      cy.url().should('not.include', '/login');
    });
  }
);

export {};
