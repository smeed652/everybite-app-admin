describe('Smoke test', () => {
  it('loads the app root', () => {
    cy.visit('/');
    cy.contains('SmartMenu').should('exist'); // adjust once UI scaffold exists
  });
});
