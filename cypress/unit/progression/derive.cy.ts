import type { PaintColor } from '../../../src/types/CarModel';
import type { Spot } from '../../../src/types/Spot';
import { countdownTo, deriveProgress, mulberry32, replayOrder } from '../../../src/utils/progression';
import { brusselsOffset, CATALOGUE, COLLECTIONS, NOW, plusHours, seen, spot } from './helpers';

const T0 = '2026-10-05T08:00:00.000Z';
const PAINTS: PaintColor[] = ['red', 'blue', 'black', 'white', 'other', 'green'];

/** A reproducible mixed history: catalogue cars, duplicates, wildcards, notes, plates, paints. */
function history(count: number, seed = 1): Spot[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, index) => {
    const createdAt = plusHours(T0, index * 3 + Math.floor(random() * 3));
    const pickModel = Math.floor(random() * (CATALOGUE.length + 2));
    const carModelId = CATALOGUE[pickModel]?.id;
    return spot({
      id: `h${String(index).padStart(4, '0')}`,
      carModelId,
      createdAt,
      spottedAt: plusHours(createdAt, -Math.floor(random() * 48)),
      paint: PAINTS[Math.floor(random() * PAINTS.length)] ?? 'other',
      platesHidden: Math.floor(random() * 3),
      ...(random() < 0.2 ? { notes: 'note' } : {}),
    });
  });
}

const derive = (spots: readonly Spot[]) => deriveProgress(spots, CATALOGUE, NOW, brusselsOffset, COLLECTIONS);

describe('deriveProgress', () => {
  it('is deterministic: same input, same output', () => {
    const spots = history(80);
    expect(derive(spots)).to.deep.equal(derive(spots));
  });

  it('replays by createdAt with ties broken by id, whatever the input order', () => {
    const spots = history(60);
    const shuffled = [...spots].reverse();
    expect(derive(shuffled)).to.deep.equal(derive(spots));
    const tie = [seen('icon-1', T0, 'other', 'b'), seen('icon-1', T0, 'other', 'a')];
    expect(replayOrder(tie).map((entry) => entry.id)).to.deep.equal(['a', 'b']);
    const snapshot = derive(tie);
    expect(snapshot.ledger.find((entry) => entry.kind === 'new_sticker')?.spotId).to.equal('a');
  });

  it('recalculates after a delete: exactly the ledger without that spot', () => {
    const spots = history(120, 7);
    const removed = spots[30];
    if (removed === undefined) throw new Error('fixture too small');
    const after = derive(spots.filter((entry) => entry.id !== removed.id));
    const fresh = derive(spots.filter((entry) => entry.id !== removed.id));
    expect(after).to.deep.equal(fresh);
    expect(after.ledger.some((entry) => entry.spotId === removed.id)).to.equal(false);
    expect(after.xp).to.be.below(derive(spots).xp);
  });

  it('moves a new sticker to the next spot of that model after the first one is deleted', () => {
    const first = seen('super-a', T0, 'red', 'first');
    const second = seen('super-a', plusHours(T0, 48), 'red', 'second');
    const before = derive([first, second]);
    expect(before.ledger.filter((entry) => entry.kind === 'new_sticker').map((entry) => entry.spotId)).to.deep.equal([
      'first',
    ]);
    const after = derive([second]);
    expect(after.ledger.filter((entry) => entry.kind === 'new_sticker').map((entry) => entry.spotId)).to.deep.equal([
      'second',
    ]);
    expect(after.collectedIds).to.deep.equal(['super-a']);
  });

  it('builds pages, sets, collected ids and the week of "now"', () => {
    const snapshot = derive([
      seen('icon-1', T0),
      seen('jdm-a', plusHours(T0, 1)),
      spot({ createdAt: plusHours(T0, 2) }),
    ]);
    expect(snapshot.collectedIds).to.deep.equal(['icon-1', 'jdm-a']);
    expect(snapshot.pages.map((page) => page.pageId)).to.deep.equal([
      'icon',
      'sports',
      'supercar',
      'hypercar',
      'classic',
      'jdm',
      'muscle',
      'electric',
    ]);
    expect(snapshot.pages.find((page) => page.pageId === 'icon')).to.deep.include({
      collected: 1,
      total: 6,
      isComplete: false,
    });
    // An empty category is never "complete".
    expect(snapshot.pages.find((page) => page.pageId === 'classic')).to.deep.include({ total: 0, isComplete: false });
    expect(snapshot.sets.map((set) => set.collectionId)).to.deep.equal(['jdm-legends', 'italian-exotics']);
    expect(snapshot.weekKey).to.equal('2026-W46');
    expect(snapshot.weekEndsAt).to.equal('2026-11-15T23:00:00.000Z');
    expect(snapshot.challenges).to.have.length(3);
  });

  it('returns an empty but complete snapshot without spots', () => {
    const snapshot = derive([]);
    expect(snapshot).to.deep.include({ xp: 0, ledger: [], collectedIds: [] });
    expect(snapshot.level.level).to.equal(1);
    expect(snapshot.achievements).to.have.length(15);
    expect(snapshot.achievements.every((entry) => entry.tier === 0)).to.equal(true);
    expect(snapshot.streak).to.deep.include({ current: 0, best: 0, atRisk: false });
    expect(snapshot.challenges.every((entry) => entry.value === 0 && !entry.isComplete)).to.equal(true);
  });

  it('works without collections (Appendix E data still loading)', () => {
    const snapshot = deriveProgress([seen('jdm-a', T0)], CATALOGUE, NOW, brusselsOffset);
    expect(snapshot.sets).to.deep.equal([]);
    expect(snapshot.ledger.some((entry) => entry.kind === 'set_complete')).to.equal(false);
  });

  it('derives 500 spots in under 50 ms', () => {
    const spots = history(500, 3);
    derive(spots.slice(0, 50)); // warm-up (JIT)
    const start = performance.now();
    const snapshot = derive(spots);
    const elapsed = performance.now() - start;
    expect(snapshot.ledger.filter((entry) => entry.kind === 'spot')).to.have.length(500);
    expect(elapsed, `${elapsed.toFixed(1)} ms`).to.be.below(50);
  });
});

describe('countdownTo', () => {
  it('splits the time left into days, hours and minutes (rounded up to the minute)', () => {
    const now = new Date('2026-11-11T10:00:00Z');
    expect(countdownTo('2026-11-15T23:00:00.000Z', now)).to.deep.equal({
      days: 4,
      hours: 13,
      minutes: 0,
      isOver: false,
    });
    expect(countdownTo('2026-11-11T10:04:30.000Z', now)).to.deep.equal({
      days: 0,
      hours: 0,
      minutes: 5,
      isOver: false,
    });
    expect(countdownTo('2026-11-11T09:00:00.000Z', now)).to.deep.equal({ days: 0, hours: 0, minutes: 0, isOver: true });
    expect(countdownTo('not a date', now).isOver).to.equal(true);
  });
});
