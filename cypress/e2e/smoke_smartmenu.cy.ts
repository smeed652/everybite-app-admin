/// <reference types="cypress" />

// NOTE: These are smoke-level E2E tests intended to run against the local dev server (npm start)
// They rely on stubbed auth tokens placed into localStorage to mimic Cognito flows.
// Update the token values if ID token structure changes.

const ADMIN_TOKEN = {
  accessToken: 'stub-access',
  idToken: 'stub-id',
  groups: ['ADMIN'],
};

function loginAsAdmin() {
  cy.window().then((win) => {
    win.localStorage.setItem('everybiteAuth', JSON.stringify(ADMIN_TOKEN));
  });
}

describe('Admin Happy Path', () => {
  beforeEach(() => {
    cy.visit('/');
    loginAsAdmin();
  });

  it('navigates SmartMenus list > detail > preview', () => {
    cy.visit('/smart-menus');

    // Click first row (assumes link cell has data-testid)
    cy.get('[data-testid="smartmenu-row"]').first().click();

    // Header should show widget name
    cy.get('[data-testid="smartmenu-header"]').contains(/widget/i);

    // Click Preview button – should open external url (verify href via stubbed window.open)
    cy.window().then((win) => {
      cy.stub(win, 'open').as('open');
    });
    cy.contains('button', /preview widget/i).click();
    cy.get('@open').should('have.been.called');
  });
});
