import { View } from 'react-native';
import { OdometerCounter } from '../../../src/components/reveal/OdometerCounter';
import { RevealCtas } from '../../../src/components/reveal/RevealCtas';
import {
  ACHIEVEMENTS_FIXTURE,
  pageFixture,
  pageProgressFixture,
  revealFixture,
  setsFixture,
  type RevealFixtureOptions,
} from '../../../src/components/reveal/revealFixtures';
import { RevealProgressRow } from '../../../src/components/reveal/RevealProgressRow';
import { RevealStage } from '../../../src/components/reveal/RevealStage';
import { StickerPacket } from '../../../src/components/reveal/StickerPacket';
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

function mountStage(options: RevealFixtureOptions = {}) {
  const reveal = revealFixture(options);
  const onViewPage = cy.stub().as('viewPage');
  const onSpotAnother = cy.stub().as('spotAnother');
  cy.mount(
    <View style={{ height: 820 }}>
      <RevealStage
        reveal={reveal}
        page={pageFixture(reveal)}
        pageProgress={pageProgressFixture(reveal)}
        sets={setsFixture(reveal)}
        achievements={ACHIEVEMENTS_FIXTURE}
        onViewPage={onViewPage}
        onSpotAnother={onSpotAnother}
      />
    </View>,
  );
  return reveal;
}

describe('RevealStage', () => {
  beforeEach(() => {
    useSettingsStore.setState({ haptics: true, isLoaded: true });
  });
  afterEach(() => {
    emulateReducedMotion(false);
    Reflect.deleteProperty(navigator, 'userActivation');
  });

  it('jumps to the final state with Skip', () => {
    emulateReducedMotion(false);
    const reveal = mountStage();
    cy.get('[data-testid="reveal-packet"]').should('exist');
    cy.get('[data-testid="reveal-skip"]').click();
    cy.get('[data-testid="reveal-final"]').should('exist');
    cy.get('[data-testid="reveal-skip"]').should('not.exist');
    cy.get('[data-testid="reveal-stamp-new"]').should('exist');
    cy.get('[data-testid="reveal-xp-total"]').should('have.attr', 'aria-label', `${reveal.xpGained} XP`);
    cy.get('[data-testid="reveal-page-progress"]').should('contain.text', 'Classics 3/4');
    cy.get('[data-testid="reveal-set-italian-exotics"]').should('contain.text', 'Italian Exotics 3/12');
    cy.get('[data-testid="reveal-view-page"]').click();
    cy.get('@viewPage').should('have.been.calledOnce');
    cy.get('[data-testid="reveal-spot-another"]').click();
    cy.get('@spotAnother').should('have.been.calledOnce');
  });

  it('shows the final values at once with reduced motion, then sticks on tap', () => {
    emulateReducedMotion(true);
    const reveal = mountStage();
    cy.get('[data-testid="reveal-packet"]').should('not.exist');
    cy.get('[data-testid="reveal-stamp-new"]').should('exist');
    // The hero sticker fills its stage instead of shrinking to its content (390 px viewport).
    cy.get('[data-testid="reveal-sticker"] [data-testid^="foil-finish-"]').invoke('outerWidth').should('be.gte', 220);
    cy.get('[data-testid="reveal-xp-total"]')
      .should('have.attr', 'aria-label', `${reveal.xpGained} XP`)
      .and('contain.text', String(reveal.xpGained));
    cy.get('[data-testid="reveal-set-italian-exotics"]').should('contain.text', 'Italian Exotics 3/12');
    cy.get('[data-testid="reveal-final"]').should('not.exist');
    cy.get('[data-testid="reveal-stick"]').click();
    cy.get('[data-testid="reveal-final"]').should('exist');
    cy.get('[data-testid="reveal-mini-page"]').should('exist');
    cy.get('[data-testid="reveal-view-page"]').should('exist');
  });

  it('plays the whole ritual with haptics: tear, stamp, stick', () => {
    emulateReducedMotion(false);
    allowVibration();
    const vibrate = cy.stub(navigator, 'vibrate').returns(true);
    mountStage();
    cy.get('[data-testid="reveal-packet"]').click();
    cy.get('[data-testid="reveal-sticker"]').should('exist');
    cy.wrap(vibrate).should('have.been.calledWith', 15);
    cy.wrap(vibrate).should('have.been.calledWith', [10, 40, 10]);
    cy.get('[data-testid="reveal-xp"]').should('exist');
    cy.get('[data-testid="reveal-shift-lights"]').should('exist');
    cy.get('[data-testid="reveal-stick"]', { timeout: 15000 }).click();
    cy.wrap(vibrate).should('have.been.calledWith', 20);
    cy.get('[data-testid="reveal-final"]', { timeout: 5000 }).should('exist');
  });

  it('respects the haptics setting', () => {
    emulateReducedMotion(true);
    allowVibration();
    useSettingsStore.setState({ haptics: false, isLoaded: true });
    const vibrate = cy.stub(navigator, 'vibrate').returns(true);
    mountStage();
    cy.get('[data-testid="reveal-stick"]').click();
    cy.get('[data-testid="reveal-final"]').should('exist');
    cy.wrap(vibrate).should('not.have.been.called');
  });

  it('shows SHIFT UP only on a level-up', () => {
    emulateReducedMotion(true);
    mountStage({ levelUp: true });
    cy.get('[data-testid="reveal-level-up"]').should('contain.text', 'Shift up!');
    mountStage({ levelUp: false });
    cy.get('[data-testid="reveal-xp-total"]').should('exist');
    cy.get('[data-testid="reveal-level-up"]').should('not.exist');
  });

  it('stamps SET COMPLETE when the spot completes a set', () => {
    emulateReducedMotion(true);
    mountStage({ setComplete: true });
    cy.get('[data-testid="reveal-set-italian-exotics"]').should('contain.text', 'Italian Exotics 12/12');
    cy.get('[data-testid="reveal-set-italian-exotics-complete"]').should('exist');
    cy.get('[data-testid="reveal-xp-row-set_complete"]').should('contain.text', '+250 XP');
  });

  it('shows the stamp for every kind', () => {
    emulateReducedMotion(true);
    mountStage({ kind: 'duplicate' });
    cy.get('[data-testid="reveal-stamp-count"]').should('exist');
    mountStage({ kind: 'fresh_paint' });
    cy.get('[data-testid="reveal-stamp-fresh_paint"]').should('exist');
    mountStage({ kind: 'wildcard' });
    cy.get('[data-testid="reveal-stamp-wildcard"]').should('exist');
    cy.get('[data-testid="reveal-page-progress"]').should('contain.text', 'Wildcards ×2');
    cy.get('[data-testid="reveal-sets"]').should('not.exist');
  });

  it('lists unlocked plaques and completed challenges', () => {
    emulateReducedMotion(true);
    mountStage({ rewards: true });
    cy.get('[data-testid="reveal-achievement-ignition"]').should('contain.text', 'Ignition · Gold');
    cy.get('[data-testid="reveal-challenge-main"]').should('contain.text', 'Main challenge complete');
  });
});

describe('OdometerCounter', () => {
  afterEach(() => emulateReducedMotion(false));

  it('shows a static value with its accessible label', () => {
    cy.mount(<OdometerCounter value={365} suffix="XP" testID="odo" />);
    cy.get('[data-testid="odo"]').should('have.attr', 'aria-label', '365 XP').and('contain.text', '365');
  });

  it('keeps the final value as the accessible label while it rolls', () => {
    emulateReducedMotion(false);
    cy.mount(<OdometerCounter value={4210} animateFrom={0} suffix="XP" testID="odo" />);
    cy.get('[data-testid="odo"]').should('have.attr', 'aria-label', '4210 XP');
  });

  it('pads with zeros like an odometer', () => {
    cy.mount(<OdometerCounter value={42} digits={4} testID="odo" />);
    cy.get('[data-testid="odo"]').should('contain.text', '0042').and('have.attr', 'aria-label', '42');
  });

  it('shows the final value at once with reduced motion', () => {
    emulateReducedMotion(true);
    cy.mount(<OdometerCounter value={980} animateFrom={0} suffix="XP" testID="odo" />);
    cy.get('[data-testid="odo"]').should('contain.text', '980').and('have.attr', 'aria-label', '980 XP');
  });
});

describe('StickerPacket', () => {
  it('is a labelled button that opens once', () => {
    const onOpen = cy.stub().as('open');
    cy.mount(<StickerPacket onOpen={onOpen} torn={false} testID="packet" />);
    cy.get('[data-testid="packet"]')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'aria-label', 'Sticker packet')
      .and('contain.text', 'Tap to tear open');
    cy.get('[data-testid="packet"]').click();
    cy.get('[data-testid="packet"]').click();
    cy.get('@open').should('have.been.calledOnce');
  });

  it('cannot be opened again once torn', () => {
    const onOpen = cy.stub().as('open');
    cy.mount(<StickerPacket onOpen={onOpen} torn testID="packet" />);
    cy.get('[data-testid="packet"]').click({ force: true });
    cy.get('@open').should('not.have.been.called');
  });
});

describe('RevealCtas and RevealProgressRow', () => {
  it('offers STICK IT first, then View page and Spot another', () => {
    const onStick = cy.stub().as('stick');
    cy.mount(
      <RevealCtas phase="stick" onStick={onStick} onViewPage={() => undefined} onSpotAnother={() => undefined} />,
    );
    cy.get('[data-testid="reveal-stick"]').should('contain.text', 'Stick it').click();
    cy.get('@stick').should('have.been.calledOnce');
    cy.get('[data-testid="reveal-view-page"]').should('not.exist');
    cy.mount(
      <RevealCtas phase="final" onStick={onStick} onViewPage={() => undefined} onSpotAnother={() => undefined} />,
    );
    cy.get('[data-testid="reveal-view-page"]').should('contain.text', 'View page');
    cy.get('[data-testid="reveal-spot-another"]').should('contain.text', 'Spot another');
  });

  it('reads like "SUPERCARS 4/6" with a progress bar', () => {
    cy.mount(<RevealProgressRow target={{ kind: 'page', pageId: 'supercar' }} collected={4} total={6} testID="row" />);
    cy.get('[data-testid="row"]').should('contain.text', 'Supercars 4/6');
    cy.get('[data-testid="row"] [role="progressbar"]').should('have.attr', 'aria-valuenow', '67');
    cy.get('[data-testid="row-complete"]').should('not.exist');
  });
});
