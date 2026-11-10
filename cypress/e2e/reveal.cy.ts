import { spotRow } from '../support/commands';

// The sticker reveal (P0-15) on the production build, deep-linked like a refresh after COLLECT.
// Every Supabase call is stubbed; animations are off (prefers-reduced-motion), so the final values
// show at once and only the STICK IT tap is left.
const PORSCHE = spotRow({
  id: 'spot-reveal-porsche',
  car_model_id: 'porsche-911-gt3',
  make: 'Porsche',
  model: '911 GT3',
  paint: 'blue',
  body_style: 'coupe',
  plates_hidden: 1,
  identified_by: 'ai',
  ai_confidence: 0.94,
  city: 'Leuven',
  spotted_at: '2026-11-09T14:12:00.000Z',
  created_at: '2026-11-09T14:13:00.000Z',
});

describe('Sticker reveal', () => {
  beforeEach(() => {
    cy.stubSupabase({ spots: [PORSCHE] });
    cy.loginThroughUi({ reduceMotion: true });
  });

  it('replays the reveal from a deep link: NEW stamp, XP, set progress, Stick it, View page', () => {
    cy.visit(`/reveal/${PORSCHE.id}`);
    cy.get('[data-testid="reveal-screen"]').should('be.visible');
    cy.get('[data-testid="reveal-stamp-new"]').should('exist');
    cy.get('[data-testid="reveal-xp-total"]')
      .invoke('attr', 'aria-label')
      .should('match', /^\d+ XP$/)
      .then((label) => {
        expect(Number.parseInt(String(label), 10)).to.be.greaterThan(0);
      });
    cy.get('[data-testid="reveal-page-progress"]').should('contain.text', 'Sports 1/');
    // Appendix E: the Porsche is in the German Autobahn Heroes set (stub: 2 cars).
    cy.get('[data-testid="reveal-set-autobahn-heroes"]').should('contain.text', 'German Autobahn Heroes 1/2');
    cy.get('[data-testid="reveal-stick"]').should('contain.text', 'Stick it').click();
    cy.get('[data-testid="reveal-final"]').should('exist');
    cy.get('[data-testid="reveal-view-page"]').click();
    cy.location('pathname').should('eq', '/album/sports');
  });

  it('jumps to the end with Skip and offers Spot another', () => {
    cy.visit(`/reveal/${PORSCHE.id}`);
    cy.get('[data-testid="reveal-skip"]').should('be.visible').click();
    cy.get('[data-testid="reveal-final"]').should('exist');
    cy.get('[data-testid="reveal-skip"]').should('not.exist');
    cy.get('[data-testid="reveal-spot-another"]').click();
    cy.get('[data-testid="spot-screen"]').should('be.visible');
  });

  it('shows "Spot not found" for a deleted spot, with a way back to the Album', () => {
    cy.visit('/reveal/spot-that-was-deleted');
    cy.get('[data-testid="reveal-missing"]').should('contain.text', 'Spot not found');
    cy.get('[data-testid="reveal-go-album"]').click();
    cy.get('[data-testid="sticker-book-screen"]').should('be.visible');
  });
});
