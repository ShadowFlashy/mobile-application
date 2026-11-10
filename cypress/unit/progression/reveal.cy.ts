import type { Spot } from '../../../src/types/Spot';
import { deriveProgress, revealFor, shiftWeekKey, weekBounds, weeklyChallenges } from '../../../src/utils/progression';
import { brusselsOffset, CATALOGUE, COLLECTIONS, NOW, plusHours, seen, spot } from './helpers';

const T0 = '2026-10-01T10:00:00.000Z';

function reveal(spots: Spot[], spotId: string) {
  const snapshot = deriveProgress(spots, CATALOGUE, NOW, brusselsOffset, COLLECTIONS);
  return revealFor(snapshot, spots, CATALOGUE, spotId, COLLECTIONS);
}

describe('revealFor', () => {
  it('describes a new sticker: entries, XP, level before and after, page and slot', () => {
    const spots = [seen('icon-1', T0, 'red', 'a'), seen('sports-b', plusHours(T0, 1), 'blue', 'b')];
    const data = reveal(spots, 'b');
    if (data === undefined) throw new Error('no reveal');
    expect(data.kind).to.equal('new');
    expect(data.count).to.equal(1);
    expect(data.model?.id).to.equal('sports-b');
    expect(data.pageId).to.equal('sports');
    // sports-a (#7) comes before sports-b (#8) on the page.
    expect(data.slotIndex).to.equal(1);
    expect(data.entries.map((entry) => entry.kind)).to.include.members(['spot', 'new_sticker']);
    expect(data.xpGained).to.equal(data.entries.reduce((sum, entry) => sum + entry.amount, 0));
    expect(data.levelAfter.xp - data.levelBefore.xp).to.equal(data.xpGained);
    const first = reveal(spots, 'a');
    expect(first?.levelBefore.xp).to.equal(0);
    expect(first?.levelAfter.xp).to.equal(data.levelBefore.xp);
  });

  it('describes a duplicate, a fresh paint and a wildcard', () => {
    const spots = [
      seen('icon-1', T0, 'red', 'first'),
      seen('icon-1', plusHours(T0, 30), 'red', 'dup'),
      seen('icon-1', plusHours(T0, 60), 'green', 'paint'),
      spot({ id: 'wild', createdAt: plusHours(T0, 61) }),
    ];
    expect(reveal(spots, 'dup')).to.deep.include({ kind: 'duplicate', count: 2 });
    expect(reveal(spots, 'paint')).to.deep.include({ kind: 'fresh_paint', count: 3 });
    const wild = reveal(spots, 'wild');
    expect(wild).to.deep.include({ kind: 'wildcard', pageId: 'wildcards', count: 1, model: undefined });
    expect(wild?.slotIndex).to.equal(undefined);
    expect(wild?.sets).to.deep.equal([]);
  });

  it('lists the pages, collections and achievement tiers this spot completed', () => {
    const spots = [
      seen('jdm-a', T0, 'other', 'j'),
      seen('sports-a', plusHours(T0, 1), 'other', 's'),
      seen('sports-b', plusHours(T0, 2), 'other', 'last'),
    ];
    const data = reveal(spots, 'last');
    expect(data?.pagesCompleted).to.deep.equal(['sports']);
    expect(data?.setsCompleted).to.deep.equal(['jdm-legends']);
    expect(data?.sets).to.deep.equal([
      { collectionId: 'jdm-legends', collected: 2, total: 2, isComplete: true, completedAt: plusHours(T0, 2) },
    ]);
    // jdm (1/1) and sports (2/2): full_page reached bronze on spot "j", then nothing new at "last".
    expect(reveal(spots, 'j')?.achievementsUnlocked).to.deep.include({ id: 'full_page', tier: 1 });
    expect(reveal(spots, 'j')?.achievementsUnlocked).to.deep.include({ id: 'ignition', tier: 3 });
    expect(data?.achievementsUnlocked).to.deep.include({ id: 'set_collector', tier: 1 });
  });

  it('shows collection progress as of that spot ("ITALIAN EXOTICS 1/3")', () => {
    const spots = [seen('super-a', T0, 'other', 'x'), seen('icon-4', plusHours(T0, 1), 'other', 'y')];
    expect(reveal(spots, 'x')?.sets).to.deep.equal([
      { collectionId: 'italian-exotics', collected: 1, total: 3, isComplete: false },
    ]);
    expect(reveal(spots, 'y')?.sets[0]).to.deep.include({ collected: 2, total: 3 });
  });

  it('returns the weekly challenges the spot completed', () => {
    let week = '2026-W40';
    for (let index = 0; index < 300; index += 1) {
      if (weeklyChallenges(week, CATALOGUE, COLLECTIONS)[0]?.template === 'spots') break;
      week = shiftWeekKey(week, 1);
    }
    const board = weeklyChallenges(week, CATALOGUE, COLLECTIONS);
    const target = board[0]?.target ?? 0;
    const start = weekBounds(week, brusselsOffset).start.toISOString();
    const spots = Array.from({ length: target }, (_, index) =>
      spot({ id: `c${index}`, createdAt: plusHours(start, 12 + index) }),
    );
    const data = reveal(spots, `c${target - 1}`);
    expect(data?.challengesCompleted.map((entry) => entry.id)).to.include(`${week}:warmup`);
    expect(data?.challengesCompleted.find((entry) => entry.slot === 'warmup')).to.deep.equal(board[0]);
  });

  it('is undefined for a spot that does not exist', () => {
    expect(reveal([seen('icon-1', T0, 'other', 'a')], 'missing')).to.equal(undefined);
  });
});
