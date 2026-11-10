import { fakeSession, spotRow } from '../support/commands';

// Stats tab (P0-14) against the production build. Time is frozen at Wednesday 2026-11-11 10:00 UTC
// (ISO week 2026-W46); only `Date` is faked, so timers and the network keep running.
const NOW = Date.UTC(2026, 10, 11, 10);

// Two spots logged in W45 and two in W46 → a 2-week streak. Expected values come from
// deriveProgress on this fixture with the 6-model car_models.json and the default collections:
// 2,165 XP → level 7, 635 XP to level 8; 3 of the 6 catalogue stickers.
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

describe('Stats', () => {
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

  it('shows the level, stickers and spots readouts that match the fixture', () => {
    // The Album tab stays mounted, so scope the shared screen-title testID to this screen.
    cy.get('[data-testid="progress-screen"] [data-testid="screen-title"]').should('have.text', 'Stats');
    cy.get('[data-testid="progress-screen"]').should('contain.text', '2,165 XP in total');
    cy.get('[data-testid="level-readout-value"]').should('have.attr', 'aria-label', 'Level 7');
    cy.get('[data-testid="level-readout"]').should('contain.text', '635 XP to level 8');
    cy.get('[data-testid="level-readout"] [role="progressbar"]')
      .should('have.attr', 'aria-valuemax', '100')
      .and('have.attr', 'aria-label')
      .and('match', /% of the way to level 8$/);
    cy.get('[data-testid="stickers-readout-value"]').should('contain.text', '3').and('contain.text', '/6');
    cy.get('[data-testid="spots-readout-value"]').should('have.text', '4');
  });

  it('shows a 2-week streak with its 8-week history', () => {
    cy.get('[data-testid="streak-readout-figure-value"]').should('contain.text', '2').and('contain.text', 'weeks');
    cy.get('[data-testid="streak-readout-week-on"]').should('have.length', 2);
    cy.get('[data-testid="streak-readout-week-off"]').should('have.length', 6);
    cy.get('[data-testid="streak-readout"]').should('contain.text', 'This week counts');
  });

  it('shows the deterministic 2026-W46 challenges with a live countdown', () => {
    cy.get('[data-testid="challenge-warmup"]').should('contain.text', 'Write notes on 2 spots');
    cy.get('[data-testid="challenge-warmup-progress"]').should('have.text', '0/2');
    cy.get('[data-testid="challenge-main"]')
      .should('contain.text', 'Spot 1 car in orange')
      .and('contain.text', '+125 XP');
    cy.get('[data-testid="challenge-stretch"]')
      .should('contain.text', 'Collect 3 new stickers')
      .and('contain.text', '+250 XP');
    cy.get('[data-testid="challenge-stretch-progress"]').should('have.text', '1/3');
    cy.get('[data-testid="challenges-countdown"]')
      .invoke('text')
      .should('match', /^Ends in \d+d \d+h$/);
  });

  it('shows earned achievements with a New label until they are opened', () => {
    cy.get('[data-testid="achievement-ignition-gold"]').should('have.text', 'Gold');
    cy.get('[data-testid="achievement-set_collector-bronze"]').should('have.text', 'Bronze');
    cy.get('[data-testid="achievement-collector-locked"]').should('have.text', 'Locked');
    // `redline` stays secret until 8 stickers short of the catalogue; the fixture catalogue has only
    // 6 models (3 collected), so it already shows its progress here (the secret rule is unit-tested).
    cy.get('[data-testid="achievement-redline-progress"]').should('have.text', '3/6');
    cy.get('[data-testid="achievement-redline"]').should('not.contain.text', 'Secret achievement');
    cy.get('[data-testid="achievement-ignition-new"]').should('exist');
    cy.get('[data-testid="achievement-ignition"]').click();
    cy.get('[data-testid="achievement-ignition-new"]').should('not.exist');
    cy.get('[data-testid="achievement-wildcard-new"]').should('exist');
    cy.get('[data-testid="achievement-collector"]').click();
    cy.get('[data-testid="achievement-collector-details"]').should('contain.text', 'Next tier at');
  });
});
