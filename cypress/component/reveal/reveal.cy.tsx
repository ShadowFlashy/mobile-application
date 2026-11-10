import { View } from 'react-native';
import {
  pageFixture,
  pageProgressFixture,
  revealFixture,
  setsFixture,
  type RevealFixtureOptions,
} from '../../../src/components/reveal/revealFixtures';
import { RevealProgressRow } from '../../../src/components/reveal/RevealProgressRow';
import { RevealResult } from '../../../src/components/reveal/RevealResult';
import { XpBreakdown } from '../../../src/components/reveal/XpBreakdown';
import { en } from '../../../src/i18n/resources';
import { useSettingsStore } from '../../../src/state/useSettingsStore';

/** prefers-reduced-motion through the Chrome DevTools protocol (react-native-web reads the media query). */
function emulateReducedMotion(reduce: boolean) {
  cy.wrap(
    Cypress.automation('remote:debugger:protocol', {
      command: 'Emulation.setEmulatedMedia',
      params: { features: [{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }] },
    }),
    { log: false },
  );
}

/** Pretends the page already had a user gesture, so navigator.vibrate is allowed. */
function allowVibration() {
  Object.defineProperty(navigator, 'userActivation', {
    configurable: true,
    value: { hasBeenActive: true, isActive: true },
  });
}

function mountResult(options: RevealFixtureOptions = {}) {
  const reveal = revealFixture(options);
  const onDone = cy.stub().as('done');
  const onSpotAnother = cy.stub().as('spotAnother');
  cy.mount(
    <View style={{ height: 844 }}>
      <RevealResult
        reveal={reveal}
        page={pageFixture(reveal)}
        pageProgress={pageProgressFixture(reveal)}
        sets={setsFixture(reveal)}
        onDone={onDone}
        onSpotAnother={onSpotAnother}
      />
    </View>,
  );
  return reveal;
}

describe('RevealResult', () => {
  beforeEach(() => {
    cy.viewport(390, 844);
    useSettingsStore.setState({ haptics: true, isLoaded: true });
  });
  afterEach(() => {
    emulateReducedMotion(false);
    Reflect.deleteProperty(navigator, 'userActivation');
  });

  it('shows the result at once: photo, #82 with "New sticker", the set and the rarity in words', () => {
    emulateReducedMotion(true);
    mountResult();
    cy.get('[data-testid="reveal-final"]').should('be.visible');
    cy.get('[data-testid="reveal-photo"]').should('have.attr', 'role', 'img');
    cy.get('[data-testid="reveal-number"]')
      .should('contain.text', '#82')
      .and('have.attr', 'aria-label', 'Sticker number 82');
    cy.get('[data-testid="reveal-status-new"]').should('have.text', 'New sticker');
    cy.get('[data-testid="reveal-car"]')
      .should('contain.text', 'Ferrari 308 GTSi')
      .and('contain.text', 'Italian Exotics');
    cy.get('[data-testid="reveal-rarity-epic"]').should('contain.text', 'Epic');
    cy.get('[data-testid="reveal-page-progress"]').should('contain.text', 'Classics').and('contain.text', '3/4');
    cy.get('[data-testid="reveal-page-progress"]').should('contain.text', '05');
    cy.get('[data-testid="reveal-set-italian-exotics"]')
      .should('contain.text', 'Italian Exotics')
      .and('contain.text', '3/12')
      .and('have.attr', 'aria-label', 'Italian Exotics: 3 of 12 stickers');
  });

  it('lists every XP source as a row, then the total', () => {
    emulateReducedMotion(true);
    const reveal = mountResult();
    cy.get('[data-testid="reveal-xp-row-spot"]').should('contain.text', 'Spot logged').and('contain.text', '+10 XP');
    cy.get('[data-testid="reveal-xp-row-new_sticker"]').should('contain.text', '+160 XP');
    cy.get('[data-testid="reveal-xp-row-streak"]').should('contain.text', '+25 XP');
    cy.get('[data-testid="reveal-xp-total"]')
      .should('have.attr', 'aria-label', `${reveal.xpGained} XP in total`)
      .and('contain.text', `+${reveal.xpGained}`);
  });

  it('shows the level line, and a plain line only on a level-up', () => {
    emulateReducedMotion(true);
    const reveal = mountResult({ levelUp: true });
    cy.get('[data-testid="reveal-level-up"]').should(
      'have.text',
      `Level ${reveal.levelAfter.level} reached · ${en.levels[reveal.levelAfter.titleKey]}`,
    );
    cy.get('[data-testid="reveal-level-readout-value"]').should(
      'have.attr',
      'aria-label',
      `Level ${reveal.levelAfter.level}`,
    );
    cy.get('[data-testid="reveal-level-readout"] [role="progressbar"]').invoke('outerHeight').should('equal', 2);
    mountResult({ levelUp: false });
    cy.get('[data-testid="reveal-level-readout"]').should('exist');
    cy.get('[data-testid="reveal-level-up"]').should('not.exist');
  });

  it('has a red "Done" to the album page and a secondary "Spot another"', () => {
    emulateReducedMotion(true);
    mountResult();
    cy.get('[data-testid="reveal-done"]').should('contain.text', 'Done').click();
    cy.get('@done').should('have.been.calledOnce');
    cy.get('[data-testid="reveal-spot-another"]').should('contain.text', 'Spot another').click();
    cy.get('@spotAnother').should('have.been.calledOnce');
    cy.get('[data-testid="reveal-done"]').then(($done) => {
      cy.get('[data-testid="reveal-spot-another"]').should(($another) => {
        const backgrounds = ($button: JQuery) =>
          $button
            .find('*')
            .addBack()
            .toArray()
            .map((node) => getComputedStyle(node).backgroundColor);
        // Red only on the primary action.
        expect(backgrounds($done)).to.include('rgb(225, 6, 0)');
        expect(backgrounds($another)).not.to.include('rgb(225, 6, 0)');
      });
    });
    cy.get('[data-testid="reveal-done"]').invoke('outerHeight').should('be.gte', 44);
  });

  it('marks a set this spot completed', () => {
    emulateReducedMotion(true);
    mountResult({ setComplete: true });
    cy.get('[data-testid="reveal-set-italian-exotics"]').should('contain.text', '12/12');
    cy.get('[data-testid="reveal-set-italian-exotics-complete"]').should('contain.text', 'Complete');
    cy.get('[data-testid="reveal-xp-row-set_complete"]').should('contain.text', '+250 XP');
  });

  it('names the result for every kind', () => {
    emulateReducedMotion(true);
    mountResult({ kind: 'duplicate' });
    cy.get('[data-testid="reveal-status-duplicate"]').should('have.text', 'Duplicate ×3');
    mountResult({ kind: 'fresh_paint' });
    cy.get('[data-testid="reveal-status-fresh_paint"]').should('have.text', 'New colour');
    mountResult({ kind: 'wildcard' });
    cy.get('[data-testid="reveal-status-wildcard"]').should('have.text', 'Wildcard');
    cy.get('[data-testid="reveal-number"]').should('not.exist');
    cy.get('[data-testid="reveal-car"]').should('contain.text', 'Wildcards page');
    cy.get('[data-testid="reveal-page-progress"]').should('contain.text', 'Wildcards').and('contain.text', '×2');
    cy.get('[data-testid="reveal-sets"]').should('not.exist');
  });

  it('lists earned achievements and completed challenges', () => {
    emulateReducedMotion(true);
    mountResult({ rewards: true });
    cy.get('[data-testid="reveal-achievement-ignition"]').should('contain.text', 'First spot · Gold');
    cy.get('[data-testid="reveal-challenge-main"]')
      .should('contain.text', 'Main challenge complete')
      .and('contain.text', '+125 XP');
  });

  it('enters once and counts the XP total up to its final value', () => {
    emulateReducedMotion(false);
    const reveal = mountResult();
    cy.get('[data-testid="reveal-xp-total"]').should('have.attr', 'aria-label', `${reveal.xpGained} XP in total`);
    cy.get('[data-testid="reveal-xp-total"]', { timeout: 3000 }).should('contain.text', `+${reveal.xpGained}`);
    cy.get('[data-testid="reveal-final"]').should('be.visible');
  });

  it('plays one haptic when it appears and respects the haptics setting', () => {
    emulateReducedMotion(true);
    allowVibration();
    const vibrate = cy.stub(navigator, 'vibrate').returns(true);
    mountResult();
    cy.wrap(vibrate).should('have.been.calledOnceWith', [10, 40, 10]);
  });

  it('stays silent with haptics off', () => {
    emulateReducedMotion(true);
    allowVibration();
    useSettingsStore.setState({ haptics: false, isLoaded: true });
    const vibrate = cy.stub(navigator, 'vibrate').returns(true);
    mountResult();
    cy.get('[data-testid="reveal-final"]').should('exist');
    cy.wrap(vibrate).should('not.have.been.called');
  });

  it('has no packet, stamp, shift lights or skip any more', () => {
    emulateReducedMotion(true);
    mountResult({ levelUp: true });
    cy.get('[data-testid="reveal-packet"]').should('not.exist');
    cy.get('[data-testid="reveal-skip"]').should('not.exist');
    cy.get('[data-testid="reveal-shift-lights"]').should('not.exist');
    cy.get('[data-testid^="reveal-stamp-"]').should('not.exist');
  });
});

describe('XpBreakdown and RevealProgressRow', () => {
  it('shows a static total when not animated', () => {
    cy.mount(<XpBreakdown entries={revealFixture().entries} total={195} animate={false} testID="xp" />);
    cy.get('[data-testid="xp-total"]').should('contain.text', '+195').and('have.attr', 'aria-label', '195 XP in total');
  });

  it('reads like the album page table: "03 Supercars ── 4/6"', () => {
    cy.mount(
      <RevealProgressRow
        target={{ kind: 'page', pageId: 'supercar' }}
        number={3}
        collected={4}
        total={6}
        testID="row"
      />,
    );
    cy.get('[data-testid="row"]')
      .should('contain.text', '03')
      .and('contain.text', 'Supercars')
      .and('contain.text', '4/6')
      .and('have.attr', 'aria-label', 'Supercars: 4 of 6 stickers');
    cy.get('[data-testid="row"] [role="progressbar"]').should('have.attr', 'aria-valuenow', '67');
    cy.get('[data-testid="row-complete"]').should('not.exist');
  });
});
