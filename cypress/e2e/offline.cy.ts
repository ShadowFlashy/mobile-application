// Mobile-specific E2E requirement (course ch. 12): network simulation.
describe('Offline behaviour', () => {
  beforeEach(() => {
    cy.stubSupabase();
    cy.loginThroughUi();
  });

  it('shows a banner when the connection drops and hides it when it is back', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
      win.dispatchEvent(new win.Event('offline'));
    });
    cy.get('[data-testid="offline-banner"]').should('be.visible');

    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(true);
      win.dispatchEvent(new win.Event('online'));
    });
    cy.get('[data-testid="offline-banner"]').should('not.exist');
  });
});
