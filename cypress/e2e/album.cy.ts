import { spotRow } from '../support/commands';

// The album (P0-10 – P0-12) plus the themed collections (Appendix E), with every Supabase call stubbed.
// The car_models fixture holds 6 models, one per category except classic and muscle.
const SPOTS = [
  spotRow({
    id: 'spot-porsche',
    car_model_id: 'porsche-911-gt3',
    make: 'Porsche',
    model: '911 GT3',
    paint: 'blue',
    body_style: 'coupe',
    identified_by: 'ai',
    ai_confidence: 0.94,
    plates_hidden: 1,
    city: 'Leuven',
    created_at: '2026-11-03T10:00:00.000Z',
    spotted_at: '2026-11-03T09:55:00.000Z',
  }),
  spotRow({
    id: 'spot-mazda',
    car_model_id: 'mazda-mx-5',
    make: 'Mazda',
    model: 'MX-5',
    body_style: 'convertible',
    created_at: '2026-11-04T10:00:00.000Z',
  }),
  spotRow({
    id: 'spot-multipla',
    car_model_id: null,
    make: 'Fiat',
    model: 'Multipla',
    body_style: 'van',
    created_at: '2026-11-05T10:00:00.000Z',
  }),
];

/** 29 Classics, as long as the real Classics page: the regression page for vertical scrolling. */
const CLASSICS = Array.from({ length: 29 }, (_, index) => ({
  id: `classic-${index + 1}`,
  sticker_number: 50 + index,
  make: 'Classic',
  model: `Model ${index + 1}`,
  category: 'classic',
  rarity: 'common',
  body_style: 'coupe',
  country: 'IT',
  season: 1,
  year_from: null,
  year_to: null,
}));

describe('Album', () => {
  it('shows the readouts "2/6", the latest catches, the 9-page index and the collections tab', () => {
    cy.stubSupabase({ spots: SPOTS });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="screen-title"]').should('have.text', 'Album');
    cy.get('[data-testid="album-cover-summary-value"]').should('have.text', '2/6');
    cy.get('[data-testid="album-cover-summary-value"]').should('have.attr', 'aria-label').and('contain', '2 of 6');
    cy.get('[data-testid="album-cover-summary"] [role="progressbar"]').should('have.attr', 'aria-valuenow', '33');
    cy.get('[data-testid="album-cover-level-value"]').should('contain.text', 'LVL');
    cy.get('[data-testid="album-latest"] [data-testid^="latest-"]').should('have.length', 3);
    cy.get('[data-testid="latest-spot-porsche"]').should('contain.text', '#07').and('contain.text', 'Porsche 911 GT3');
    cy.get('[data-testid="album-week"]').should('contain.text', 'This week');
    cy.get('[data-testid="album-contents"] [role="button"]').should('have.length', 9);
    cy.get('[data-testid="page-card-sports-count"]').should('have.text', '1/1');
    cy.get('[data-testid="page-card-supercar-count"]').should('have.text', '0/1');
    cy.get('[data-testid="page-card-wildcards-count"]').should('have.text', '1');
    cy.get('[data-testid="album-index-tab-collections"]').click();
    cy.get('[data-testid="album-collections"]').should('contain.text', 'Japanese JDM Legends');
    cy.get('[data-testid="empty-collection"]').should('not.exist');
    // Direction A: no stamps, foil or tacho on the album.
    cy.get('[data-testid^="stamp-"]').should('not.exist');
    cy.get('[data-testid="album-tacho"]').should('not.exist');
  });

  it('opens Supercars with a missing sticker, steps to a collected one, and shows what a missing sticker is worth', () => {
    cy.stubSupabase({ spots: SPOTS });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="page-card-supercar"]').click();
    cy.location('pathname').should('eq', '/album/supercar');
    cy.get('[data-testid="pager-position"]').should('have.text', '03/09');
    cy.get('[data-testid="sticker-ferrari-296-gtb-locked"]').should('be.visible');

    cy.get('[data-testid="pager-previous"]').click();
    cy.get('[data-testid="pager-position"]').should('have.text', '02/09');
    cy.get('[data-testid="sticker-porsche-911-gt3-collected"]').should('be.visible');
    cy.get('[data-testid="pager-next"]').click();

    // No scroll-into-view: Cypress would also scroll the snapping pager sideways.
    cy.get('[data-testid="sticker-ferrari-296-gtb"]').click({ scrollBehavior: false });
    cy.location('pathname').should('eq', '/sticker/ferrari-296-gtb');
    cy.get('[data-testid="sticker-locked"]').should('be.visible');
    cy.get('[data-testid="sticker-worth"]').should('contain.text', '+160 XP');
    cy.get('[data-testid="sticker-spot-it"]').should('be.visible');
  });

  // Regression (reported by the student): on the web the rows below the fold of a long album page
  // were clipped, because the page's own scroll view had no height. Classics has 29 cars.
  it('scrolls the longest album page to its last sticker, which can be pressed', () => {
    cy.stubSupabase({ spots: SPOTS });
    cy.fixture('car_models.json').then((models: unknown[]) => {
      cy.intercept('GET', '**/rest/v1/car_models*', { statusCode: 200, body: [...models, ...CLASSICS] });
    });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="page-card-classic"]').click();
    cy.location('pathname').should('eq', '/album/classic');
    cy.get('[data-testid="sticker-classic-29"]').should('not.be.visible');
    cy.get('[data-testid="pager-page-classic"]').scrollTo('bottom', { ensureScrollable: true });
    cy.get('[data-testid="sticker-classic-29"]').should('be.visible').click({ scrollBehavior: false });
    cy.location('pathname').should('eq', '/sticker/classic-29');
  });

  it('shows a collected sticker with its detail rows, its spots and its sets', () => {
    cy.stubSupabase({ spots: SPOTS });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="page-card-sports"]').click();
    cy.get('[data-testid="sticker-porsche-911-gt3"]').click({ scrollBehavior: false });
    cy.get('[data-testid="sticker-title"]').should('contain.text', '#07').and('contain.text', 'Porsche 911 GT3');
    cy.get('[data-testid="sticker-status"]').should('contain.text', 'Spotted').and('contain.text', '×1');
    cy.get('[data-testid="duplicates-strip"]').find('[data-testid="duplicate-spot-porsche"]').should('exist');
    cy.get('[data-testid="sticker-set-autobahn-heroes"]').should('contain.text', '1/2');
  });

  it('lists the off-catalogue spot on the Wildcards page', () => {
    cy.stubSupabase({ spots: SPOTS });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="page-card-wildcards"]').click();
    cy.location('pathname').should('eq', '/album/wildcards');
    cy.get('[data-testid="wildcard-spot-multipla"]').should('be.visible').and('contain.text', 'Fiat Multipla');
  });

  it('shows a completed collection as "Complete · n/n" in plain text', () => {
    cy.stubSupabase({ spots: SPOTS });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="album-index-tab-collections"]').click();
    cy.get('[data-testid="collection-card-jdm-legends"]').click();
    cy.location('pathname').should('eq', '/album/collection/jdm-legends');
    cy.get('[data-testid="collection-page-jdm-legends"]').should('be.visible');
    cy.get('[data-testid="collection-page-jdm-legends-count"]').should('contain.text', 'Complete');
    cy.get('[data-testid="stamp-set-complete"]').should('not.exist');
    cy.get('[data-testid="collection-status"]').should('contain.text', 'Every car of this set is in your album.');
  });

  /** Opens the wildcard spot's detail from the Wildcards page (a single-row stub for its own query). */
  function openWildcardSpot() {
    const multipla = SPOTS[2];
    cy.intercept('GET', '**/rest/v1/spots*id=eq.spot-multipla*', { statusCode: 200, body: multipla ? [multipla] : [] });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="page-card-wildcards"]').click();
    cy.get('[data-testid="wildcard-spot-multipla"]').click({ scrollBehavior: false });
    cy.location('pathname').should('eq', '/details/spot-multipla');
    cy.wait('@showcase');
    cy.get('[data-testid="spot-title"]').should('contain.text', 'Fiat Multipla');
  }

  it('shows no owner showcase on a spot when get_spot_showcase returns no row', () => {
    cy.stubSupabase({ spots: SPOTS, showcase: [] });
    openWildcardSpot();
    cy.get('[data-testid="spot-owner-showcase"]').should('not.exist');
    cy.get('[data-testid="spot-details"]').should('contain.text', 'Wildcard');
  });

  it('shows the owner showcase on a spot when get_spot_showcase returns a row', () => {
    cy.stubSupabase({
      spots: SPOTS,
      showcase: [{ visibility: 'badge', shoutout: 'Thanks for the spot!', vanity_plate: null }],
    });
    openWildcardSpot();
    cy.get('[data-testid="spot-owner-showcase"]')
      .should('contain.text', 'Verified owner')
      .and('contain.text', 'Thanks for the spot!');
  });

  it('points to the camera when the album is empty', () => {
    cy.stubSupabase({ spots: [] });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="empty-collection"]').should('contain.text', '6 stickers to collect');
    cy.get('[data-testid="empty-spot-button"]').click();
    cy.location('pathname').should('eq', '/spot');
  });
});
