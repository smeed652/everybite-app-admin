/// <reference types="cypress" />

import * as auth from 'aws-amplify/auth';

const stubGroups = (groups: string | string[]) => {

  cy.stub(auth, 'fetchAuthSession').resolves({
    accessToken: { payload: { 'cognito:groups': groups } },
    idToken: { payload: { 'cognito:groups': groups } },
    tokens: {
      accessToken: { payload: { 'cognito:groups': groups } },
      idToken: { payload: { 'cognito:groups': groups } },
    },
  });
};

describe('RBAC – UI redirects', () => {
  afterEach(() => {
    // restore the stubbed method between tests
    // @ts-ignore
    auth.fetchAuthSession.restore && auth.fetchAuthSession.restore();
  });

  it('redirects non-admin user to /403', () => {
    cy.visit('/users', {
      onBeforeLoad() {
        stubGroups(['USER']);
      },
    });
    cy.url().should('include', '/login');
  });

  it('allows ADMIN user to view Users page', () => {
    cy.visit('/users', {
      onBeforeLoad() {
        stubGroups('ADMIN');
      },
    });
    cy.url().should('include', '/users');
  });
});
