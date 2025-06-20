/// <reference types="cypress" />

// Smoke test: dashboard metrics render
// Logs in via UI helper and asserts that metric cards are visible.

describe('Dashboard metrics', () => {
  before(() => {
    cy.loginByForm(); // custom command defined in commands.ts
  });

  it('shows metric tiles', () => {
    cy.visit('/');
    cy.contains('h1', /dashboard/i).should('be.visible');
    cy.get('[data-testid="metrics-card"]').should('have.length.at.least', 1);
  });
});
