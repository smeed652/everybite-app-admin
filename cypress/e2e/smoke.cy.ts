describe('Smoke test', () => {
  const email = Cypress.env('USERNAME');
  const password = Cypress.env('PASSWORD');

  it('logs in and navigates to Users page', () => {
    cy.visit('/login');

    // Fill login form
    cy.get('input[type="email"], input[name="email"]').type(email);
    cy.get('input[type="password"], input[name="password"]').type(password, { log: false });
    cy.get('button[type="submit"], button:contains("Sign in")').click();

    // Should redirect to dashboard (root or /dashboard)
    cy.contains('Dashboard').should('exist');

    // Navigate to Users list via sidebar
    cy.contains('Users').click();
    cy.url().should('include', '/users');
    cy.contains('Invite').should('exist');
  });
});
