/// <reference types="cypress" />

// NOTE: These are smoke-level E2E tests intended to run against the local dev server (npm start)
// They rely on stubbed auth tokens placed into localStorage to mimic Cognito flows.
// Update the token values if ID token structure changes.

const ADMIN_TOKEN = {
  accessToken: "stub-access",
  idToken: "stub-id",
  groups: ["ADMIN"],
};

function loginAsAdmin() {
  cy.window().then((win) => {
    win.localStorage.setItem("everybiteAuth", JSON.stringify(ADMIN_TOKEN));
  });
}

describe("Admin Happy Path", () => {
  beforeEach(() => {
    // GraphQL stub for widgets
    const widget = {
      __typename: "Widget",
      id: "widget_1",
      name: "Lunch Menu",
      slug: "lunch-menu",
      layout: "classic",
      hasImages: true,
      hasOrdering: true,
      hasUtm: true,
      syncEnabled: true,
      previewUrl: "https://example.com/preview",
      banners: [],
      menuItems: [],
    };

    cy.intercept("POST", "/graphql", (req) => {
      const { operationName } = req.body;
      if (operationName === "GetSmartMenus") {
        req.reply({ data: { widgets: [widget] } });
      } else if (operationName === "GetWidget") {
        req.reply({ data: { widget } });
      }
    });
    cy.intercept("POST", "/graphql", (req) => {
      const { operationName } = req.body;
      if (operationName === "GetSmartMenus") {
        req.reply({
          data: {
            widgets: [
              {
                __typename: "Widget",
                id: "widget_1",
                name: "Lunch Menu",
                layout: "classic",
                syncEnabled: true,
                banners: [],
                menuItems: [],
              },
            ],
          },
        });
      }
    });
    cy.visit("/");
    loginAsAdmin();
  });

  it("navigates SmartMenus list > detail > preview", () => {
    cy.visit("/smartmenus");

    // Click first row in SmartMenus table (uses component id)
    // Wait for data rows (exclude loading skeleton rows with animate-pulse class)
    cy.get('[data-testid="smartmenus-table"] tbody tr:not(.animate-pulse)', {
      timeout: 10000,
    })
      .first()
      .click({ force: true });

    // Confirm navigation to detail page
    cy.url({ timeout: 10000 }).should("match", /\/smartmenus\/[\w-]+/);

    // Click Preview button – should open external url (verify href via stubbed window.open)
    cy.window().then((win) => {
      cy.stub(win, "open").as("open");
    });

    cy.contains("button", /preview widget/i, { timeout: 10000 }).click();
    cy.get("@open").should("have.been.called");
  });
});
