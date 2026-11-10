import { revealFixture, FERRARI_308 } from '../../../src/components/reveal/revealFixtures';
import { durations } from '../../../src/theme/motion';
import type { CarModel } from '../../../src/types/CarModel';
import type { Collection } from '../../../src/types/Collection';
import type { RevealData } from '../../../src/types/Progress';
import type { Spot } from '../../../src/types/Spot';
import { levelForXp } from '../../../src/utils/progression';
import {
  hasLevelUp,
  ledFrames,
  litLeds,
  revealPageProgress,
  revealSetProgress,
  revealSets,
  revealStamp,
  revealTimeline,
  spotsUpTo,
  tierName,
  toAchievementId,
  toCollectionId,
  xpTiming,
  type RevealSetProgress,
} from '../../../src/utils/revealTimeline';

const ids = (reveal: RevealData, reduced = false, sets: RevealSetProgress[] = []) =>
  revealTimeline(reveal, reduced, sets).map((step) => step.id);

const ONE_SET: RevealSetProgress[] = [
  { id: 'italian-exotics', number: 4, collected: 3, total: 12, isComplete: false, justCompleted: false },
];

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

describe('revealTimeline (SPEC P0-15)', () => {
  it('plays packet → tear → stamp → XP → shift lights → page → stick for a plain new sticker', () => {
    expect(ids(revealFixture({ kind: 'new' }))).to.deep.equal([
      'packet',
      'tear',
      'stamp',
      'xp',
      'shiftLights',
      'pageProgress',
      'stick',
    ]);
  });

  it('adds the levelUp step only when the level changed', () => {
    const plain = revealFixture({ levelUp: false });
    const shifted = revealFixture({ levelUp: true });
    expect(plain.levelBefore.level).to.equal(plain.levelAfter.level);
    expect(ids(plain)).not.to.include('levelUp');
    expect(shifted.levelAfter.level).to.be.greaterThan(shifted.levelBefore.level);
    expect(ids(shifted)).to.deep.equal([
      'packet',
      'tear',
      'stamp',
      'xp',
      'shiftLights',
      'levelUp',
      'pageProgress',
      'stick',
    ]);
  });

  it('adds sets only with set progress and rewards only with a plaque or challenge', () => {
    const reveal = revealFixture({ rewards: true });
    expect(ids(reveal, false, ONE_SET)).to.deep.equal([
      'packet',
      'tear',
      'stamp',
      'xp',
      'shiftLights',
      'pageProgress',
      'sets',
      'rewards',
      'stick',
    ]);
    expect(ids(revealFixture())).not.to.include.members(['sets', 'rewards']);
  });

  it('gives every kind the same ritual (new, duplicate, fresh_paint, wildcard)', () => {
    for (const kind of ['new', 'duplicate', 'fresh_paint', 'wildcard'] as const) {
      const steps = ids(revealFixture({ kind }));
      expect(steps[0], kind).to.equal('packet');
      expect(steps[steps.length - 1], kind).to.equal('stick');
    }
  });

  it('uses the motion tokens and the haptic patterns of SPEC §7.6–7.7', () => {
    const steps = revealTimeline(revealFixture({ levelUp: true }), false);
    const byId = new Map(steps.map((step) => [step.id, step]));
    expect(byId.get('tear')?.duration).to.equal(durations.flip);
    expect(byId.get('stamp')?.duration).to.equal(durations.stamp);
    expect(byId.get('xp')?.duration).to.equal(durations.odometer);
    expect(byId.get('stick')?.duration).to.equal(durations.stick);
    expect(byId.get('tear')?.haptic).to.equal('tear');
    expect(byId.get('stamp')?.haptic).to.equal('stamp');
    expect(byId.get('levelUp')?.haptic).to.equal('shiftUp');
    expect(byId.get('stick')?.haptic).to.equal('stick');
    expect(byId.get('packet')?.haptic).to.equal(undefined);
  });

  it('waits for the STICK IT tap only at the end', () => {
    const steps = revealTimeline(revealFixture(), false);
    expect(steps.filter((step) => step.awaitsTap).map((step) => step.id)).to.deep.equal(['stick']);
  });

  it('collapses every duration and hold to 0 with reduced motion, keeping only the tap haptic', () => {
    const steps = revealTimeline(revealFixture({ levelUp: true, rewards: true }), true, ONE_SET);
    for (const step of steps) {
      expect(step.duration, step.id).to.equal(0);
      expect(step.hold, step.id).to.equal(0);
    }
    expect(steps.filter((step) => step.haptic !== undefined).map((step) => step.id)).to.deep.equal(['stick']);
  });

  it('times the shift lights LED by LED', () => {
    const reveal = revealFixture({ levelUp: true });
    const shiftLights = revealTimeline(reveal, false).find((step) => step.id === 'shiftLights');
    expect(shiftLights?.duration).to.equal(ledFrames(reveal).length * 60);
  });
});

describe('shift lights (litLeds, ledFrames)', () => {
  it('lights round(ratio × 15) LEDs, clamped', () => {
    expect(litLeds(0)).to.equal(0);
    expect(litLeds(0.5)).to.equal(8);
    expect(litLeds(1)).to.equal(15);
    expect(litLeds(1.7)).to.equal(15);
    expect(litLeds(-1)).to.equal(0);
    expect(litLeds(Number.NaN)).to.equal(0);
  });

  it('climbs from the old ratio to the new one without a level-up', () => {
    const reveal = { ...revealFixture(), levelBefore: levelForXp(1000), levelAfter: levelForXp(1200) };
    // Level 5 runs from 1,000 to 1,500 XP: 0 → 0.4 = 6 LEDs.
    expect(ledFrames(reveal)).to.deep.equal([1, 2, 3, 4, 5, 6]);
  });

  it('climbs all the way to the redline on a level-up', () => {
    const reveal = { ...revealFixture(), levelBefore: levelForXp(1400), levelAfter: levelForXp(1600) };
    expect(hasLevelUp(reveal)).to.equal(true);
    expect(ledFrames(reveal)).to.deep.equal([13, 14, 15]);
  });

  it('has no frames when nothing changed', () => {
    const reveal = { ...revealFixture(), levelBefore: levelForXp(1000), levelAfter: levelForXp(1000) };
    expect(ledFrames(reveal)).to.deep.equal([]);
  });
});

describe('revealStamp, xpTiming, tierName and the id guards', () => {
  it('maps the reveal kind to its stamp', () => {
    expect(revealStamp(revealFixture({ kind: 'new' }))).to.deep.equal({ kind: 'new' });
    expect(revealStamp(revealFixture({ kind: 'duplicate' }))).to.deep.equal({ kind: 'count', count: 3 });
    expect(revealStamp(revealFixture({ kind: 'fresh_paint' }))).to.deep.equal({ kind: 'fresh_paint' });
    expect(revealStamp(revealFixture({ kind: 'wildcard' }))).to.deep.equal({ kind: 'wildcard' });
  });

  it('colours XP rows like a timing screen', () => {
    expect(xpTiming('new_sticker')).to.equal('purple');
    expect(xpTiming('page_complete')).to.equal('purple');
    expect(xpTiming('set_complete')).to.equal('purple');
    expect(xpTiming('streak')).to.equal('green');
    expect(xpTiming('challenge')).to.equal('green');
    expect(xpTiming('achievement')).to.equal('green');
    expect(xpTiming('duplicate')).to.equal('yellow');
    expect(xpTiming('spot')).to.equal('yellow');
  });

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
