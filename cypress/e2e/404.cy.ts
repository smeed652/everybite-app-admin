/// <reference types="cypress" />

// 404 route handling: navigating to an unknown path should display NotFound page and offer navigation home.

describe("404 page", () => {
  const email = Cypress.env("USERNAME");
  const password = Cypress.env("PASSWORD");

  before(() => {
    cy.visit("/login");
    cy.get('input[type="email"], input[name="email"]').type(email);
    cy.get('input[type="password"], input[name="password"]').type(password, {
      log: false,
    });
    cy.get('button[type="submit"], button:contains("Sign in")').click();
    cy.contains("Dashboard").should("exist");
  });

  it("shows not found and navigates home", () => {
    cy.visit("/non-existent-route", { failOnStatusCode: false });
    cy.contains(/404|not found/i).should("exist");

    // Click link or button that routes back to home
    cy.contains("a", /go back home/i).click();
    cy.url().should("match", /\/$|\/dashboard/);
  });
});
