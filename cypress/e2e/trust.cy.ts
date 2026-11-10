import { spotRow } from '../support/commands';

// Trust Center (SPEC P0-18, §6.10): visible privacy, and switches that really take effect.
describe('Trust Center', () => {
  const spots = [
    spotRow({ id: 'trust-spot-1', car_model_id: 'porsche-911-gt3', city: 'Leuven', plates_hidden: 1 }),
    spotRow({ id: 'trust-spot-2', car_model_id: 'mazda-mx-5', make: 'Mazda', model: 'MX-5', city: 'Gent' }),
    spotRow({ id: 'trust-spot-3', make: 'Fiat', model: 'Multipla', city: 'leuven' }),
  ];

  beforeEach(() => {
    cy.stubSupabase({ spots, quota: 12 });
    cy.loginThroughUi();
    cy.get('[data-testid="tab-profile"]').click();
    cy.get('[data-testid="trust-link"]').click();
    cy.location('pathname').should('eq', '/trust');
    cy.get('[data-testid="trust-screen"]').should('be.visible');
  });

  it('shows what Redline stores: 0 plates, 0 GPS points', () => {
    cy.get('[data-testid="ledger-plates-value"]').should('have.text', '0');
    cy.get('[data-testid="ledger-gps-value"]').should('have.text', '0');
    cy.get('[data-testid="ledger-plates"]').should('contain.text', 'Never stored');
    cy.get('[data-testid="ledger-photos-value"]').should('have.text', '3');
    cy.get('[data-testid="ledger-cities-value"]').should('have.text', '2');
    cy.get('[data-testid="ledger-ai-value"]').should('have.text', '12 of 15');
  });

  it('shows what owners see, following the name switch', () => {
    cy.get('[data-testid="owner-visibility-notes-status"]').should('have.text', 'Never');
    cy.get('[data-testid="owner-visibility-plate-status"]').should('have.text', 'Never');
    cy.get('[data-testid="owner-visibility-name-status"]').should('have.text', 'Hidden (opt-in)');
    cy.get('[data-testid="trust-share-name-switch"]').should('have.attr', 'aria-checked', 'false').click();
    cy.get('[data-testid="trust-share-name-switch"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="owner-visibility-name-status"]').should('have.text', 'Shown (you opted in)');
  });

  it('keeps the switches on this device after a reload', () => {
    cy.get('[data-testid="trust-auto-city-switch"]').should('have.attr', 'aria-checked', 'true').click();
    cy.get('[data-testid="trust-auto-city-switch"]').should('have.attr', 'aria-checked', 'false');
    cy.window().its('localStorage').invoke('getItem', 'redline-settings').should('contain', '"autoLocation":false');
    cy.reload();
    cy.get('[data-testid="trust-auto-city-switch"]').should('have.attr', 'aria-checked', 'false');
  });

  it('with Co-Driver off, capture opens manually and never calls the AI function', () => {
    cy.get('[data-testid="trust-ai-switch"]').should('have.attr', 'aria-checked', 'true').click();
    cy.get('[data-testid="trust-ai-switch"]').should('have.attr', 'aria-checked', 'false');
    cy.get('[data-testid="ledger-ai-value"]').should('have.text', 'Co-Driver is off');

    cy.go('back');
    cy.get('[data-testid="tab-spot"]').click();
    cy.get('[data-testid="spot-screen"]').should('be.visible');
    cy.get('[data-testid="choose-photo-button"]').click();
    cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/car.jpg', { force: true });
    cy.get('[data-testid="capture-screen"]').should('be.visible');
    cy.get('[data-testid="plates-section"]').should('be.visible');
    // Only exists once the capture flow has decided about Co-Driver, so the zero-call check below
    // cannot pass before a (wrong) identify call would have been sent.
    cy.get('[data-testid="ai-status-banner-disabled"]').should('be.visible');
    cy.get('@identify.all').should('have.length', 0);
  });
});
