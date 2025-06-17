/// <reference types="cypress" />
import * as auth from 'aws-amplify/auth';

describe('Smoke test', () => {
  const email = Cypress.env('USERNAME');
  const password = Cypress.env('PASSWORD');

  const stubAdmin = () => {
  cy.stub(auth, 'fetchAuthSession').resolves({
    accessToken: { payload: { 'cognito:groups': 'ADMIN' } },
  });
};

  it('logs in and reaches dashboard', () => {
    stubAdmin();
    cy.visit('/login');

    // Fill login form
    cy.get('input[type="email"], input[name="email"]').type(email);
    cy.get('input[type="password"], input[name="password"]').type(password, { log: false });
    cy.get('button[type="submit"], button:contains("Sign in")').click();

    // Should redirect to dashboard (root or /dashboard)
    cy.contains('Dashboard').should('exist');


  });
});
