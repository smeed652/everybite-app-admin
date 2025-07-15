/// <reference types="cypress" />

describe("RBAC – UI redirects", () => {
  it("redirects non-admin user to /403", () => {
    cy.visit("/users", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "everybiteAuth",
          JSON.stringify({
            accessToken: "stub-access",
            idToken: "stub-id",
            groups: ["USER"],
          })
        );
      },
    });
    cy.url().should("include", "/403");
  });

  it("allows ADMIN user to view Users page", () => {
    cy.visit("/users", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "everybiteAuth",
          JSON.stringify({
            accessToken: "stub-access",
            idToken: "stub-id",
            groups: ["ADMIN"],
          })
        );
      },
    });
    cy.url().should("include", "/users");
  });
});
