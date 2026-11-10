import { ACHIEVEMENTS } from '../../../src/constants/achievements';
import { ACHIEVEMENT_IDS } from '../../../src/types/Progress';
import {
  achievementDefinition,
  achievementProgress,
  deriveProgress,
  tierFor,
  tiersBetween,
} from '../../../src/utils/progression';
import { brusselsOffset, CATALOGUE, COLLECTIONS, model, NOW, plusHours, seen, spot } from './helpers';

const T0 = '2026-10-01T10:00:00.000Z';

function plaque(snapshot: ReturnType<typeof deriveProgress>, id: (typeof ACHIEVEMENT_IDS)[number]) {
  const found = snapshot.achievements.find((entry) => entry.id === id);
  if (found === undefined) throw new Error(`no plaque ${id}`);
  return found;
}

describe('achievements: table', () => {
  it('defines one plaque per achievement id: the 14 of §4.4 plus set_collector', () => {
    expect(ACHIEVEMENTS.map((entry) => entry.id).sort()).to.deep.equal([...ACHIEVEMENT_IDS].sort());
    expect(ACHIEVEMENTS).to.have.length(15);
    expect(achievementDefinition('set_collector')?.thresholds).to.deep.equal([1, 4, 8]);
    expect(achievementDefinition('collector')?.thresholds).to.deep.equal([6, 24, 48]);
    expect(achievementDefinition('legend_hunter')?.thresholds).to.deep.equal([1, 4, 11]);
  });

  it('maps values to tiers; a single threshold goes straight to gold', () => {
    expect([0, 5, 6, 23, 24, 47, 48, 500].map((value) => tierFor(value, [6, 24, 48]))).to.deep.equal([
      0, 0, 1, 1, 2, 2, 3, 3,
    ]);
    expect([0, 2, 3].map((value) => tierFor(value, [3]))).to.deep.equal([0, 0, 3]);
    expect(tiersBetween(0, 3, false)).to.deep.equal([1, 2, 3]);
    expect(tiersBetween(1, 2, false)).to.deep.equal([2]);
    expect(tiersBetween(0, 3, true)).to.deep.equal([3]);
  });

  it('reports the next threshold, and none once gold', () => {
    const definition = ACHIEVEMENTS.find((entry) => entry.id === 'spotter');
    if (definition === undefined) throw new Error('spotter missing');
    expect(achievementProgress(definition, 12, 118, {})).to.deep.include({ tier: 1, value: 12, nextThreshold: 50 });
    expect(achievementProgress(definition, 250, 118, {}).nextThreshold).to.equal(undefined);
  });
});

describe('achievements: derived', () => {
  it('records the createdAt of the spot that unlocked each tier', () => {
    const spots = Array.from({ length: 12 }, (_, index) => spot({ id: `s${index}`, createdAt: plusHours(T0, index) }));
    const spotter = plaque(deriveProgress(spots, CATALOGUE, NOW, brusselsOffset), 'spotter');
    expect(spotter).to.deep.include({ tier: 1, value: 12, nextThreshold: 50 });
    expect(spotter.unlockedAt).to.deep.equal({ bronze: plusHours(T0, 9) });
    const ignition = plaque(deriveProgress(spots, CATALOGUE, NOW, brusselsOffset), 'ignition');
    expect(ignition).to.deep.include({ tier: 3 });
    expect(ignition.unlockedAt).to.deep.equal({ gold: T0 });
  });

  it('measures paints, countries, plates, notes, wildcards and legendaries', () => {
    const spots = [
      seen('icon-1', T0, 'red'),
      seen('icon-3', plusHours(T0, 1), 'blue'),
      seen('super-a', plusHours(T0, 2), 'yellow'),
      seen('mclaren-p1', plusHours(T0, 3), 'other'),
      spot({ createdAt: plusHours(T0, 4), platesHidden: 3, notes: 'At the meet' }),
      spot({ createdAt: plusHours(T0, 5), platesHidden: 2 }),
    ];
    const snapshot = deriveProgress(spots, CATALOGUE, NOW, brusselsOffset);
    expect(plaque(snapshot, 'paint_shop')).to.deep.include({ value: 3, tier: 1 });
    expect(plaque(snapshot, 'globetrotter')).to.deep.include({ value: 4, tier: 1 });
    expect(plaque(snapshot, 'clean_plates')).to.deep.include({ value: 5, tier: 1 });
    expect(plaque(snapshot, 'logbook')).to.deep.include({ value: 1, tier: 0 });
    expect(plaque(snapshot, 'wildcard')).to.deep.include({ value: 2, tier: 1 });
    expect(plaque(snapshot, 'legend_hunter')).to.deep.include({ value: 1, tier: 1 });
  });

  it('unlocks holy_trinity with LaFerrari, McLaren P1 and Porsche 918', () => {
    const two = [seen('ferrari-laferrari', T0), seen('mclaren-p1', plusHours(T0, 1))];
    expect(plaque(deriveProgress(two, CATALOGUE, NOW, brusselsOffset), 'holy_trinity').tier).to.equal(0);
    const three = [...two, seen('porsche-918-spyder', plusHours(T0, 2))];
    expect(plaque(deriveProgress(three, CATALOGUE, NOW, brusselsOffset), 'holy_trinity')).to.deep.include({
      tier: 3,
      value: 3,
    });
  });

  it('counts complete pages and complete collections (set_collector, Appendix E)', () => {
    const spots = [seen('jdm-a', T0), seen('sports-b', plusHours(T0, 1)), seen('sports-a', plusHours(T0, 2))];
    const snapshot = deriveProgress(spots, CATALOGUE, NOW, brusselsOffset, COLLECTIONS);
    expect(plaque(snapshot, 'set_collector')).to.deep.include({ value: 1, tier: 1, nextThreshold: 4 });
    // sports (2/2) and jdm (1/1) are complete pages.
    expect(plaque(snapshot, 'full_page')).to.deep.include({ value: 2, tier: 1 });
    expect(snapshot.sets.map((set) => [set.collectionId, set.collected, set.total, set.isComplete])).to.deep.equal([
      ['jdm-legends', 2, 2, true],
      ['italian-exotics', 0, 3, false],
    ]);
  });

  it('keeps redline secret until 8 stickers before the whole catalogue', () => {
    const catalogue = Array.from({ length: 10 }, (_, index) => model(`m${index}`, 'icon', 'common', index + 1));
    const spotsOf = (count: number) =>
      catalogue.slice(0, count).map((entry, index) => seen(entry.id, plusHours(T0, index)));
    expect(plaque(deriveProgress(spotsOf(1), catalogue, NOW, brusselsOffset), 'redline')).to.deep.include({
      isSecret: true,
      nextThreshold: 10,
    });
    expect(plaque(deriveProgress(spotsOf(2), catalogue, NOW, brusselsOffset), 'redline').isSecret).to.equal(false);
    expect(plaque(deriveProgress(spotsOf(10), catalogue, NOW, brusselsOffset), 'redline')).to.deep.include({
      tier: 3,
      isSecret: false,
    });
    expect(plaque(deriveProgress(spotsOf(1), catalogue, NOW, brusselsOffset), 'collector').isSecret).to.equal(false);
  });
});
