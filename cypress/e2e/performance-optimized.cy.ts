/// <reference types="cypress" />

// Performance-optimized E2E test template
// Demonstrates best practices for fast, effective E2E testing

describe("Performance-Optimized Tests", () => {
  // Login once for all tests in this describe block
  before(() => {
    cy.loginByForm();
  });

  it("fast dashboard load", () => {
    // Use optimized navigation
    cy.visitAuthenticated("/");

    // Use efficient selectors with shorter timeouts
    cy.get('[data-testid="metrics-card"]', { timeout: 3000 }).should(
      "be.visible"
    );
    cy.contains("h1", /dashboard/i).should("be.visible");
  });

  it("fast smartmenus navigation", () => {
    // Use optimized navigation
    cy.visitAuthenticated("/smartmenus");

    // Use data-testid selectors for faster element location
    cy.get('[data-testid="smartmenus-table"]', { timeout: 3000 }).should(
      "be.visible"
    );

    // Test core functionality without unnecessary waits
    cy.get("table tbody tr").should("have.length.at.least", 1);
  });

  it("fast search functionality", () => {
    cy.visitAuthenticated("/smartmenus");

    // Use optimized search with shorter debounce
    cy.get('[data-testid="search-input"]').type("test", { delay: 0 });

    // Reduced timeout for faster feedback
    cy.get("table tbody tr", { timeout: 2000 }).should("be.visible");
  });
});
