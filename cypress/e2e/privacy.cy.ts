// The privacy policy is public and available in English and Dutch (SPEC P0-18).
describe('Privacy policy', () => {
  beforeEach(() => {
    cy.stubSupabase();
  });

  it('opens from the login screen without an account', () => {
    cy.visit('/login');
    cy.get('[data-testid="go-to-privacy"]').click();
    cy.location('pathname').should('eq', '/privacy');
    cy.get('[data-testid="privacy-title"]').should('have.text', 'Privacy policy');
    cy.get('[data-testid="privacy-section-controller"]').should('contain.text', 'Jasper Degreef');
    cy.get('[data-testid="privacy-section-processors"]')
      .should('contain.text', 'Supabase')
      .and('contain.text', 'Vercel')
      .and('contain.text', 'Cloudflare Workers AI')
      .and('contain.text', 'Mistral AI');
    cy.get('[data-testid="privacy-section-rights"]').scrollIntoView().should('be.visible');
    cy.get('[data-testid="privacy-back"]').click();
    cy.location('pathname').should('eq', '/login');
  });

  it('loads directly by URL, still without logging in', () => {
    cy.visit('/privacy');
    cy.location('pathname').should('eq', '/privacy');
    cy.get('[data-testid="privacy-document"]').should('be.visible');
  });

  it('switches to Dutch and back', () => {
    cy.visit('/privacy');
    cy.get('[data-testid="privacy-language-nl"]').click();
    cy.get('[data-testid="privacy-title"]').should('have.text', 'Privacybeleid');
    cy.get('html').should('have.attr', 'lang', 'nl');
    cy.get('[data-testid="privacy-section-never"]').should('contain.text', 'Wat we nooit bewaren');
    cy.get('[data-testid="privacy-language-en"]').click();
    cy.get('[data-testid="privacy-title"]').should('have.text', 'Privacy policy');
    cy.get('html').should('have.attr', 'lang', 'en');
  });
});
