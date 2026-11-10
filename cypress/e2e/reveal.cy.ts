import { spotRow } from '../support/commands';

// The sticker reveal (P0-15) on the production build, deep-linked like a refresh after "Add to album".
// Every Supabase call is stubbed; animations are off (prefers-reduced-motion), so the result shows at once.
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

  it('shows the result from a deep link: #, New sticker, XP, page and set progress, Done', () => {
    cy.visit(`/reveal/${PORSCHE.id}`);
    cy.get('[data-testid="reveal-screen"]').should('be.visible');
    cy.get('[data-testid="reveal-final"]').should('be.visible');
    cy.get('[data-testid="reveal-status-new"]').should('have.text', 'New sticker');
    cy.get('[data-testid="reveal-car"]').should('contain.text', 'Porsche 911 GT3');
    cy.get('[data-testid="reveal-xp-total"]')
      .invoke('attr', 'aria-label')
      .should('match', /^\d+ XP in total$/)
      .then((label) => {
        expect(Number.parseInt(String(label), 10)).to.be.greaterThan(0);
      });
    cy.get('[data-testid="reveal-page-progress"]').should('contain.text', 'Sports').and('contain.text', '1/');
    // Appendix E: the Porsche is in the German Autobahn Heroes set (stub: 2 cars).
    cy.get('[data-testid="reveal-set-autobahn-heroes"]')
      .should('contain.text', 'German Autobahn Heroes')
      .and('contain.text', '1/2');
    cy.get('[data-testid="reveal-level-readout"]').should('contain.text', 'LVL');
    cy.get('[data-testid="reveal-done"]').should('contain.text', 'Done').click();
    cy.location('pathname').should('eq', '/album/sports');
  });

  it('offers Spot another, and no packet or skip any more', () => {
    cy.visit(`/reveal/${PORSCHE.id}`);
    cy.get('[data-testid="reveal-final"]').should('be.visible');
    cy.get('[data-testid="reveal-skip"]').should('not.exist');
    cy.get('[data-testid="reveal-packet"]').should('not.exist');
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
