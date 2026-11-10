import { fakeSession, spotRow } from '../support/commands';

// Pit Wall (P0-14) against the production build. Time is frozen at Wednesday 2026-11-11 10:00 UTC
// (ISO week 2026-W46); only `Date` is faked, so timers and the network keep running.
const NOW = Date.UTC(2026, 10, 11, 10);

// Two spots logged in W45 and two in W46 → a 2-week streak. Expected values come from
// deriveProgress on this fixture with the 6-model car_models.json and the default collections:
// 2,165 XP → level 7 "Car-park Hunter", 635 XP to level 8.
const SPOTS = [
  spotRow({
    id: 'e2e-1',
    car_model_id: 'volkswagen-golf-gti',
    make: 'Volkswagen',
    model: 'Golf GTI',
    paint: 'red',
    spotted_at: '2026-11-03T12:00:00.000Z',
    created_at: '2026-11-03T12:00:00.000Z',
  }),
  spotRow({
    id: 'e2e-2',
    car_model_id: 'mazda-mx-5',
    make: 'Mazda',
    model: 'MX-5',
    paint: 'blue',
    spotted_at: '2026-11-05T12:00:00.000Z',
    created_at: '2026-11-05T12:00:00.000Z',
  }),
  spotRow({
    id: 'e2e-3',
    car_model_id: 'porsche-911-gt3',
    make: 'Porsche',
    model: '911 GT3',
    paint: 'silver',
    spotted_at: '2026-11-10T09:00:00.000Z',
    created_at: '2026-11-10T09:00:00.000Z',
  }),
  spotRow({
    id: 'e2e-4',
    make: 'Lancia',
    model: 'Delta Integrale',
    paint: 'red',
    spotted_at: '2026-11-10T15:00:00.000Z',
    created_at: '2026-11-10T15:00:00.000Z',
  }),
];

describe('Pit Wall', () => {
  beforeEach(() => {
    cy.clock(NOW, ['Date']);
    cy.stubSupabase({ spots: SPOTS });
    // The stubbed session must not look expired to the frozen clock.
    const session = { ...fakeSession(), expires_at: Math.floor(NOW / 1000) + 7 * 24 * 3600 };
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', { statusCode: 200, body: session }).as('login');
    cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token', { statusCode: 200, body: session });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="tab-progress"]').click();
    cy.get('[data-testid="progress-screen"]').should('be.visible');
  });

  it('shows the level and title that match the fixture XP', () => {
    cy.get('[data-testid="xp-summary-title"]').should('have.text', 'Car-park Hunter');
    cy.get('[data-testid="xp-summary-xp"]').should('have.text', '2,165 XP · 635 to level 8');
    cy.get('[data-testid="xp-summary"] [data-testid="level-roundel"]').should('have.attr', 'aria-label', 'Level 7');
    cy.get('[data-testid="xp-summary-lights"]')
      .should('have.attr', 'role', 'progressbar')
      .and('have.attr', 'aria-valuemax', '15')
      .and('have.attr', 'aria-valuenow', '1');
  });

  it('shows a 2-week streak on the lap chart', () => {
    cy.get('[data-testid="streak-counter-value"]').should('have.text', '2');
    cy.get('[data-testid="streak-counter-week-on"]').should('have.length', 2);
    cy.get('[data-testid="streak-counter-week-off"]').should('have.length', 6);
    cy.get('[data-testid="streak-counter-hint"]').should('contain.text', 'This week is in the books');
  });

  it('shows the deterministic 2026-W46 pit boards with a live countdown', () => {
    cy.get('[data-testid="pit-board-warmup"]').should('contain.text', 'Write notes on 2 spots');
    cy.get('[data-testid="pit-board-warmup-progress"]').should('have.text', '0/2');
    cy.get('[data-testid="pit-board-main"]')
      .should('contain.text', 'Spot 1 car in orange')
      .and('contain.text', '+125 XP');
    cy.get('[data-testid="pit-board-stretch"]')
      .should('contain.text', 'Collect 3 new stickers')
      .and('contain.text', '+250 XP');
    cy.get('[data-testid="pit-board-stretch-progress"]').should('have.text', '1/3');
    cy.get('[data-testid="pit-board-stretch-countdown"]')
      .invoke('text')
      .should('match', /^Ends in \d+d \d+h$/);
  });

  it('shows unlocked plaques with a NEW dot until they are opened', () => {
    cy.get('[data-testid="plaque-ignition-gold"]').should('exist');
    cy.get('[data-testid="plaque-set_collector-bronze"]').should('exist');
    cy.get('[data-testid="plaque-collector-locked"]').should('exist');
    // `redline` stays secret until 8 stickers short of the catalogue; the fixture catalogue has only
    // 6 models (3 collected), so it already shows its progress here (the secret rule is unit-tested).
    cy.get('[data-testid="plaque-redline"]').should('contain.text', '3/6').and('not.contain.text', '???');
    cy.get('[data-testid="plaque-ignition-new"]').should('exist');
    cy.get('[data-testid="plaque-ignition"]').click();
    cy.get('[data-testid="achievement-cabinet-details"]').should('contain.text', 'Ignition');
    cy.get('[data-testid="plaque-ignition-new"]').should('not.exist');
    cy.get('[data-testid="plaque-wildcard-new"]').should('exist');
  });
});
