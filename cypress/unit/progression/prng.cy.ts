import { fnv1a32, mulberry32, pick, randomInt } from '../../../src/utils/progression';

describe('prng: fnv1a32', () => {
  it('matches the published FNV-1a 32-bit test vectors', () => {
    expect(fnv1a32('')).to.equal(0x811c9dc5);
    expect(fnv1a32('a')).to.equal(0xe40c292c);
    expect(fnv1a32('foobar')).to.equal(0xbf9cf968);
  });

  it('is an unsigned 32-bit integer for week keys', () => {
    const hash = fnv1a32('2026-W46');
    expect(hash).to.be.at.least(0);
    expect(hash).to.be.below(2 ** 32);
    expect(Number.isInteger(hash)).to.equal(true);
    expect(fnv1a32('2026-W46')).to.equal(hash);
    expect(fnv1a32('2026-W47')).not.to.equal(hash);
  });
});

describe('prng: mulberry32', () => {
  it('is deterministic per seed and stays in [0, 1)', () => {
    const first = mulberry32(42);
    const second = mulberry32(42);
    const values = Array.from({ length: 1000 }, () => first());
    values.forEach((value) => {
      expect(value).to.be.at.least(0);
      expect(value).to.be.below(1);
    });
    expect(Array.from({ length: 1000 }, () => second())).to.deep.equal(values);
  });

  it('gives different sequences for different seeds and spreads its values', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.to.equal(b());
    const random = mulberry32(fnv1a32('spread'));
    const buckets = [0, 0, 0, 0];
    for (let index = 0; index < 4000; index += 1) buckets[Math.floor(random() * 4)] += 1;
    buckets.forEach((count) => expect(count).to.be.within(800, 1200));
  });

  it('randomInt stays inside the inclusive range and pick handles an empty list', () => {
    const random = mulberry32(7);
    const seenValues = new Set<number>();
    for (let index = 0; index < 200; index += 1) {
      const value = randomInt(random, 3, 5);
      expect(value).to.be.within(3, 5);
      seenValues.add(value);
    }
    expect([...seenValues].sort()).to.deep.equal([3, 4, 5]);
    expect(randomInt(random, 2, 2)).to.equal(2);
    expect(pick(random, [])).to.equal(undefined);
    expect(pick(random, ['only'])).to.equal('only');
  });
});
