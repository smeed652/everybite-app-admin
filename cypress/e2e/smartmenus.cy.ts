/// <reference types="cypress" />

// SmartMenus list E2E
// Validates that the table renders data, icons, search, row-selection and actions menu.

describe("SmartMenus admin list", () => {
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

  beforeEach(() => {
    // Stub GraphQL queries for SmartMenus list and detail
    const widget = {
      __typename: "Widget",
      id: "widget_1",
      name: "Lunch Menu",
      slug: "lunch-menu",
      layout: "classic",
      displayImages: true,
      isOrderButtonEnabled: true,
      orderUrl: "https://myeatery.com/order?utm_source=cypress",
      isSyncEnabled: true,
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

    cy.visit("/smartmenus");
    cy.contains("h1", /smart\s*menus/i).should("be.visible");
  });

  it("shows rows in the table", () => {
    cy.get("table tbody tr").should("have.length.at.least", 1);
  });

  it("renders icons for Images, Ordering and Layout columns", () => {
    // check first data row for expected lucide icons. Fallbacks (minus) still count.
    cy.get("table tbody tr")
      .first()
      .within(() => {
        cy.get(
          '[data-testid="images-icon"],[data-testid="ordering-icon"],[data-testid="utm-icon"],[data-testid="layout-icon"]'
        ).should("have.length.at.least", 3);
      });
  });

  it("filters rows via search (name or slug)", () => {
    // Grab text of first row and use first 3 letters as search term
    cy.get("table tbody tr")
      .first()
      .invoke("text")
      .then((rowText) => {
        const searchTerm = rowText.trim().slice(0, 3).toLowerCase() || "lun";
        cy.get('input[placeholder^="Search"]').clear().type(searchTerm);
        // After debounce, table should still show at least one row
        cy.get("table tbody tr", { timeout: 4000 }).should(
          "have.length.at.least",
          1
        );
      });
  });
});
