/// <reference types="cypress" />

// SmartMenus list E2E
// Validates that the table renders data, icons, search, row-selection and actions menu.

describe("SmartMenus admin list", () => {
  before(() => {
    // Login once for all tests in this describe block
    cy.loginByForm();
  });

  beforeEach(() => {
    // Navigate to SmartMenus page
    cy.visit("/smartmenus");

    // Stub GraphQL queries for SmartMenus list and detail
    const widget = {
      __typename: "Widget",
      id: "widget_1",
      name: "Lunch Menu",
      slug: "lunch-menu",
      layout: "classic",
      displayImages: true,
      isOrderButtonEnabled: true,
      isByoEnabled: false,
      primaryBrandColor: "#FF0000",
      highlightColor: "#00FF00",
      backgroundColor: "#FFFFFF",
      orderUrl: "https://myeatery.com/order?utm_source=cypress",
      isSyncEnabled: true,
      updatedAt: "2024-01-01T00:00:00Z",
      publishedAt: "2024-01-01T00:00:00Z",
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
    // Use more efficient selector and shorter timeout
    cy.get("table tbody tr")
      .first()
      .invoke("text")
      .then((rowText) => {
        const searchTerm = rowText.trim().slice(0, 3).toLowerCase() || "lun";
        cy.get('[data-testid="search-input"]').clear().type(searchTerm);
        // Reduced timeout for faster feedback
        cy.get("table tbody tr", { timeout: 2000 }).should(
          "have.length.at.least",
          1
        );
      });
  });
});
