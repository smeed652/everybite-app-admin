/// <reference types="cypress" />

/**
 * Force /api/users to fail with 500 to make sure UI shows error toast and graceful fallback
 */

describe("Network failure handling", () => {
  const email = Cypress.env("USERNAME");
  const password = Cypress.env("PASSWORD");

  it("shows toast when /api/users fails", () => {
    cy.intercept("GET", "**/users?limit=20", {
      statusCode: 500,
      body: { error: "Internal error" },
      delay: 100,
    }).as("usersFail");

    cy.visit("/login");
    cy.get('input[type="email"], input[name="email"]').type(email);
    cy.get('input[type="password"], input[name="password"]').type(password, {
      log: false,
    });
    cy.get('button[type="submit"], button:contains("Sign in")').click();

    // Ensure login completes – wait until we leave /login
    cy.url({ timeout: 10000 }).should("not.include", "/login");

    // Assert dashboard or Users page is loaded
    cy.visit("/users", { failOnStatusCode: false });
    cy.url().should("include", "/users");
    cy.contains("Invite User", { timeout: 5000 }).should("be.visible");

    // Set ADMIN token to ensure access to Users page
    cy.window().then((win) => {
      win.localStorage.setItem(
        "everybiteAuth",
        JSON.stringify({
          accessToken: "stub-access",
          idToken: "stub-id",
          groups: ["ADMIN"],
        })
      );
    });

    // Navigate to Users page which triggers request
    // (already on /users, so just wait for the API call)
    cy.wait("@usersFail");

    // Assert toast appears with failure message
    cy.contains("Failed to fetch users", { timeout: 5000 }).should(
      "be.visible"
    );
  });
});
