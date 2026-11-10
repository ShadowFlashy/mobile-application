import { revealFixture, FERRARI_308 } from '../../../src/components/reveal/revealFixtures';
import { durations } from '../../../src/theme/motion';
import type { CarModel } from '../../../src/types/CarModel';
import type { Collection } from '../../../src/types/Collection';
import type { RevealData } from '../../../src/types/Progress';
import type { Spot } from '../../../src/types/Spot';
import { levelForXp } from '../../../src/utils/progression';
import {
  countUpValue,
  hasLevelUp,
  hasRewards,
  REVEAL_ENTRANCE_MS,
  revealPageProgress,
  revealSetProgress,
  revealSets,
  spotsUpTo,
  tierName,
  toAchievementId,
  toCollectionId,
  XP_COUNT_UP_MS,
} from '../../../src/utils/revealTimeline';

function spot(id: string, carModelId: string | undefined, createdAt: string): Spot {
  return {
    id,
    userId: 'u',
    carModelId,
    make: 'Make',
    model: 'Model',
    photoPath: `u/${id}.jpg`,
    spottedAt: createdAt,
    createdAt,
    paint: 'red',
    bodyStyle: 'coupe',
    platesHidden: 0,
    identifiedBy: 'manual',
    shareNameWithOwner: false,
  };
}

const model = (id: string, category: CarModel['category'], stickerNumber: number): CarModel => ({
  ...FERRARI_308,
  id,
  category,
  stickerNumber,
});

describe('the reveal result (SPEC P0-15)', () => {
  it('has one quick entrance (at most 300 ms) and a quick XP count-up from the motion tokens', () => {
    expect(REVEAL_ENTRANCE_MS).to.equal(durations.base);
    expect(REVEAL_ENTRANCE_MS).to.be.at.most(300);
    expect(XP_COUNT_UP_MS).to.equal(durations.slow);
  });

  it('counts the XP total up with an ease-out and lands exactly on the total', () => {
    expect(countUpValue(195, 0, 320)).to.equal(0);
    const half = countUpValue(195, 160, 320);
    expect(half)
      .to.be.greaterThan(195 / 2)
      .and.below(195);
    expect(countUpValue(195, 320, 320)).to.equal(195);
    expect(countUpValue(195, 5000, 320)).to.equal(195);
    expect(countUpValue(195, 100, 0)).to.equal(195);
    expect(countUpValue(0, 100, 320)).to.equal(0);
    expect(countUpValue(Number.NaN, 100, 320)).to.equal(0);
    let previous = 0;
    for (let elapsed = 0; elapsed <= 320; elapsed += 20) {
      const value = countUpValue(195, elapsed, 320);
      expect(value).to.be.at.least(previous);
      previous = value;
    }
  });

  it('knows when a level-up or a reward happened', () => {
    const plain = revealFixture({ levelUp: false });
    const shifted = revealFixture({ levelUp: true });
    expect(hasLevelUp(plain)).to.equal(false);
    expect(hasLevelUp(shifted)).to.equal(true);
    expect(hasLevelUp({ ...plain, levelBefore: levelForXp(1400), levelAfter: levelForXp(1600) })).to.equal(true);
    expect(hasRewards(revealFixture())).to.equal(false);
    expect(hasRewards(revealFixture({ rewards: true }))).to.equal(true);
  });
});

describe('tierName and the id guards', () => {
  it('names plaque tiers', () => {
    expect(tierName(0)).to.equal(undefined);
    expect(tierName(1)).to.equal('bronze');
    expect(tierName(2)).to.equal('silver');
    expect(tierName(3)).to.equal('gold');
  });

  it('narrows collection and achievement ids', () => {
    expect(toCollectionId('italian-exotics')).to.equal('italian-exotics');
    expect(toCollectionId('constructor')).to.equal(undefined);
    expect(toAchievementId('ignition')).to.equal('ignition');
    expect(toAchievementId(undefined)).to.equal(undefined);
    expect(toAchievementId('nope')).to.equal(undefined);
  });
});

describe('progress at the moment of the spot', () => {
  const models = [
    model('a', 'supercar', 13),
    model('b', 'supercar', 14),
    model('c', 'supercar', 15),
    model('d', 'jdm', 31),
  ];
  const first = spot('s1', 'a', '2026-11-01T10:00:00Z');
  const second = spot('s2', 'b', '2026-11-02T10:00:00Z');
  const third = spot('s3', 'c', '2026-11-03T10:00:00Z');
  const reveal = (target: Spot, kind: RevealData['kind'] = 'new'): RevealData => ({
    ...revealFixture({ kind }),
    spot: target,
    model: models.find((candidate) => candidate.id === target.carModelId),
    pageId: 'supercar',
  });

  it('ignores spots made after the revealed one (ordered by createdAt, then id)', () => {
    expect(spotsUpTo([third, second, first], second).map((item) => item.id)).to.deep.equal(['s1', 's2']);
    const tie = spot('s0', 'c', second.createdAt);
    expect(spotsUpTo([tie, second], second).map((item) => item.id)).to.deep.equal(['s0', 's2']);
  });

  it('counts the page at that moment ("SUPERCARS 2/3") and spots FULL PAGE', () => {
    expect(revealPageProgress(reveal(second), [first, second, third], models)).to.deep.equal({
      pageId: 'supercar',
      collected: 2,
      total: 3,
      isComplete: false,
      justCompleted: false,
    });
    expect(revealPageProgress(reveal(third), [first, second, third], models)).to.include({
      collected: 3,
      isComplete: true,
      justCompleted: true,
    });
    expect(revealPageProgress(reveal(third, 'duplicate'), [first, second, third], models).justCompleted).to.equal(
      false,
    );
  });

  it('counts wildcard spots on the Wildcards page', () => {
    const wild = spot('w2', undefined, '2026-11-04T10:00:00Z');
    const data = { ...revealFixture({ kind: 'wildcard' }), spot: wild };
    const progress = revealPageProgress(data, [spot('w1', undefined, '2026-11-01T10:00:00Z'), wild], models);
    expect(progress).to.deep.equal({
      pageId: 'wildcards',
      collected: 2,
      total: 0,
      isComplete: false,
      justCompleted: false,
    });
  });

  it('derives "ITALIAN EXOTICS 2/3" style set progress and SET COMPLETE', () => {
    const collections: Collection[] = [
      { id: 'hypercar-hall-of-fame', number: 8, modelIds: ['b', 'd'] },
      { id: 'italian-exotics', number: 4, modelIds: ['a', 'b', 'c'] },
      { id: 'not-a-set', number: 9, modelIds: ['b'] },
      { id: 'jdm-legends', number: 1, modelIds: ['d'] },
    ];
    expect(revealSetProgress(reveal(second), [first, second, third], collections)).to.deep.equal([
      { id: 'italian-exotics', number: 4, collected: 2, total: 3, isComplete: false, justCompleted: false },
      { id: 'hypercar-hall-of-fame', number: 8, collected: 1, total: 2, isComplete: false, justCompleted: false },
    ]);
    const done = revealSetProgress(reveal(third), [first, second, third], collections);
    expect(done).to.deep.equal([
      { id: 'italian-exotics', number: 4, collected: 3, total: 3, isComplete: true, justCompleted: true },
    ]);
    expect(revealSetProgress(revealFixture({ kind: 'wildcard' }), [first], collections)).to.deep.equal([]);
  });

  it('reads the engine set progress from RevealData.sets and setsCompleted', () => {
    const data: RevealData = {
      ...revealFixture(),
      sets: [
        { collectionId: 'italian-exotics', collected: 12, total: 12, isComplete: true },
        { collectionId: 'unknown-set', collected: 1, total: 8, isComplete: false },
      ],
      setsCompleted: ['italian-exotics'],
    };
    expect(revealSets(data)).to.deep.equal([
      { id: 'italian-exotics', number: 1, collected: 12, total: 12, isComplete: true, justCompleted: true },
    ]);
  });
});
