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
      /**
       * Visit authenticated route with automatic login if needed.
       * @example cy.visitAuthenticated('/dashboard')
       */
      visitAuthenticated(path: string): Chainable<void>;
      /**
       * Wait for data to load with optimized timeout.
       * @example cy.waitForData('[data-testid="table"]')
       */
      waitForData(selector: string, timeout?: number): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  "loginByForm",
  (
    email: string = Cypress.env("username") || "admin@example.com",
    password: string = Cypress.env("password") || "password"
  ) => {
    cy.session([email, password], () => {
      cy.visit("/login");
      cy.get('[data-testid="email"]').type(email);
      cy.get('[data-testid="password"]').type(password, { log: false });
      cy.get('[data-testid="login-submit"]').click();
      cy.url().should("not.include", "/login");
    });
  }
);

// Fast navigation command for authenticated routes
Cypress.Commands.add("visitAuthenticated", (path: string) => {
  cy.visit(path, { failOnStatusCode: false });
  // Quick check if we need to login
  cy.url().then((url) => {
    if (url.includes("/login")) {
      cy.loginByForm();
      cy.visit(path);
    }
  });
});

// Fast data loading command with optimized waits
Cypress.Commands.add("waitForData", (selector: string, timeout = 5000) => {
  cy.get(selector, { timeout }).should("be.visible");
});

export {};
