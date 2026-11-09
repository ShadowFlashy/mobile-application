import { TEST_USER } from '../support/commands';

// Smoke tests (course ch. 12): every main screen (tab) loads and shows its basic information.
describe('Main tabs', () => {
  beforeEach(() => {
    cy.stubSupabase();
    cy.loginThroughUi();
  });

  it('shows the sticker book with the catalogue and progress', () => {
    cy.wait('@carModels');
    cy.get('[data-testid="collection-progress-count"]').should('contain.text', '0').and('contain.text', '6');
    cy.get('[data-testid="sticker-porsche-911-gt3"]').should('be.visible');
  });

  it('filters the sticker book by category', () => {
    cy.get('[data-testid="filter-jdm"]').click();
    cy.get('[data-testid="sticker-mazda-mx-5"]').should('be.visible');
    cy.get('[data-testid="sticker-porsche-911-gt3"]').should('not.exist');
  });

  it('opens a locked sticker', () => {
    cy.get('[data-testid="sticker-bugatti-chiron"]').click();
    cy.get('[data-testid="sticker-detail-screen"]').should('be.visible');
    cy.get('[data-testid="sticker-locked"]').should('be.visible');
  });

  it('shows the spot screen', () => {
    cy.get('[data-testid="tab-spot"]').click();
    cy.get('[data-testid="spot-screen"]').should('be.visible');
    cy.get('[data-testid="take-photo-button"]').should('be.visible');
  });

  it('shows the owner portal', () => {
    cy.get('[data-testid="tab-owners"]').click();
    cy.get('[data-testid="owners-screen"]').should('be.visible');
    cy.get('[data-testid="no-pings"]').should('be.visible');
  });

  it('shows the profile of the signed-in user', () => {
    cy.get('[data-testid="tab-profile"]').click();
    cy.get('[data-testid="profile-screen"]').should('be.visible');
    cy.get('[data-testid="profile-name"]').should('contain.text', TEST_USER.username);
  });

  it('switches the language to Dutch', () => {
    cy.get('[data-testid="tab-profile"]').click();
    cy.get('[data-testid="language-nl"]').click();
    cy.get('[data-testid="tab-index"]').should('contain.text', 'Stickers');
    cy.get('html').invoke('attr', 'lang').should('not.be.undefined');
  });

  it('logs out and returns to the login screen', () => {
    cy.get('[data-testid="tab-profile"]').click();
    cy.get('[data-testid="logout-button"]').click();
    cy.get('[data-testid="login-screen"]').should('be.visible');
  });
});
