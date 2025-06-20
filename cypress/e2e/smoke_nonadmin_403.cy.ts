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
  beforeEach(() => {
    cy.visit('/');
    loginAsUser();
  });

  it('redirects /users to 403 page', () => {
    cy.visit('/users');
    cy.contains('403').should('exist');
  });
});
