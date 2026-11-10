import { durations, haptics, resolveDuration, springs, type DurationToken } from '../../../src/theme';
import { HAPTIC_PATTERNS } from '../../../src/types/Settings';

const TOKENS = Object.keys(durations).filter((key): key is DurationToken => key in durations);

describe('motion tokens (SPEC §7.6)', () => {
  it('has the documented durations in ms', () => {
    expect(durations).to.deep.equal({
      instant: 90,
      fast: 120,
      base: 200,
      slow: 320,
      stamp: 260,
      stick: 380,
      flip: 520,
      odometer: 900,
      sheen: 1100,
      scanLoop: 1200,
    });
  });

  it('resolves every duration to its token value when motion is allowed', () => {
    TOKENS.forEach((token) => expect(resolveDuration(token, false), token).to.equal(durations[token]));
  });

  it('resolves every duration to 0 when the user asked for reduced motion', () => {
    TOKENS.forEach((token) => expect(resolveDuration(token, true), token).to.equal(0));
  });

  it('has the documented springs', () => {
    expect(springs.stamp).to.deep.equal({ friction: 5, tension: 160 });
    expect(springs.stick).to.deep.equal({ friction: 7, tension: 120 });
    expect(springs.press).to.deep.equal({ friction: 6, tension: 200 });
  });
});

describe('haptic patterns (SPEC §7.7)', () => {
  it('has a pattern for every HapticPattern', () => {
    expect(Object.keys(haptics).sort()).to.deep.equal([...HAPTIC_PATTERNS].sort());
  });

  it('keeps every vibration short (no pattern longer than 300 ms)', () => {
    Object.values(haptics).forEach((pattern) => {
      const total = typeof pattern === 'number' ? pattern : pattern.reduce((sum, part) => sum + part, 0);
      expect(total).to.be.at.most(300);
    });
  });
});
