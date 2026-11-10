// Resolves to hapticsService.web.ts, like the PWA build.
import { vibrate, vibrationPattern } from '../../../src/services/hapticsService';
import { haptics } from '../../../src/theme/motion';
import { HAPTIC_PATTERNS } from '../../../src/types/Settings';

function setActivation(hasBeenActive: boolean | undefined) {
  if (hasBeenActive === undefined) {
    Reflect.deleteProperty(navigator, 'userActivation');
    return;
  }
  Object.defineProperty(navigator, 'userActivation', {
    configurable: true,
    value: { hasBeenActive, isActive: hasBeenActive },
  });
}

describe('hapticsService (web, SPEC §7.7)', () => {
  afterEach(() => setActivation(undefined));

  it('uses the documented patterns: tear 15, stamp [10,40,10], shift-up [30,60,30,60,60], stick 20', () => {
    expect(vibrationPattern('tear')).to.equal(15);
    expect(vibrationPattern('stamp')).to.deep.equal([10, 40, 10]);
    expect(vibrationPattern('shiftUp')).to.deep.equal([30, 60, 30, 60, 60]);
    expect(vibrationPattern('stick')).to.equal(20);
    for (const pattern of HAPTIC_PATTERNS) {
      const token = haptics[pattern];
      expect(vibrationPattern(pattern), pattern).to.deep.equal(typeof token === 'number' ? token : [...token]);
    }
  });

  it('vibrates after a user gesture', () => {
    const spy = cy.stub(navigator, 'vibrate').returns(true);
    setActivation(true);
    vibrate('stamp');
    expect(spy).to.have.been.calledOnceWith([10, 40, 10]);
  });

  it('stays silent before the first user gesture', () => {
    const spy = cy.stub(navigator, 'vibrate').returns(true);
    setActivation(false);
    vibrate('tear');
    expect(spy.callCount).to.equal(0);
  });

  it('never throws when the browser refuses', () => {
    cy.stub(navigator, 'vibrate').throws(new Error('blocked'));
    setActivation(true);
    expect(() => vibrate('stick')).not.to.throw();
  });
});
