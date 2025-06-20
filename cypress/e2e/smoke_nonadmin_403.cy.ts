/// <reference types="cypress" />

const USER_TOKEN = {
  accessToken: 'stub-access',
  idToken: 'stub-id',
  groups: ['USER'],
};

function loginAsUser() {
  cy.window().then((win) => {
    win.localStorage.setItem('everybiteAuth', JSON.stringify(USER_TOKEN));
  });
}

describe('Non-admin access control', () => {
  // no global beforeEach – set token during the visit that matters


  it('redirects /users to 403 page', () => {
    cy.visit('/users', {
      onBeforeLoad(win) {
        win.localStorage.setItem('everybiteAuth', JSON.stringify(USER_TOKEN));
      },
    });
    cy.get('[data-testid="forbidden-page"]', { timeout: 10000 }).should('be.visible');
  });
});
