import { XP } from '../../../src/constants/xp';
import type { ProgressSnapshot, XpEntry, XpKind } from '../../../src/types/Progress';
import {
  achievementTierXp,
  challengeXp,
  deriveProgress,
  levelForXp,
  shiftWeekKey,
  streakXp,
  weekBounds,
  weeklyChallenges,
} from '../../../src/utils/progression';
import { brusselsOffset, CATALOGUE, COLLECTIONS, model, NOW, plusHours, seen, spot } from './helpers';

const T0 = '2026-11-10T09:00:00.000Z';

function derive(spots: Parameters<typeof deriveProgress>[0], models = CATALOGUE, collections = COLLECTIONS) {
  return deriveProgress(spots, models, NOW, brusselsOffset, collections);
}

function entriesOf(snapshot: ProgressSnapshot, kind: XpKind, spotId?: string): XpEntry[] {
  return snapshot.ledger.filter((entry) => entry.kind === kind && (spotId === undefined || entry.spotId === spotId));
}

describe('xp: every row of the XP table (SPEC §4.4)', () => {
  it('spot logged: +10 for every spot, catalogue or not', () => {
    const snapshot = derive([seen('icon-1', T0, 'other', 'a'), spot({ id: 'b', createdAt: plusHours(T0, 1) })]);
    expect(entriesOf(snapshot, 'spot').map((entry) => entry.amount)).to.deep.equal([10, 10]);
  });

  it('new sticker: common +40, rare +80, epic +160, legendary +400', () => {
    const snapshot = derive([
      seen('icon-1', T0, 'other', 'common'),
      seen('sports-b', plusHours(T0, 1), 'other', 'rare'),
      seen('super-a', plusHours(T0, 2), 'other', 'epic'),
      seen('mclaren-p1', plusHours(T0, 3), 'other', 'legendary'),
    ]);
    expect(entriesOf(snapshot, 'new_sticker').map((entry) => [entry.spotId, entry.amount])).to.deep.equal([
      ['common', 40],
      ['rare', 80],
      ['epic', 160],
      ['legendary', 400],
    ]);
  });

  it('duplicate: +5, once per model per 24 h of spottedAt', () => {
    const snapshot = derive([
      seen('icon-1', T0, 'other', 'first'),
      seen('icon-1', plusHours(T0, 2), 'other', 'second'),
      seen('icon-1', plusHours(T0, 25), 'other', 'third'),
      seen('icon-1', plusHours(T0, 30), 'other', 'fourth'),
    ]);
    expect(entriesOf(snapshot, 'duplicate').map((entry) => entry.spotId)).to.deep.equal(['third']);
    expect(entriesOf(snapshot, 'duplicate')[0]?.amount).to.equal(5);
    // An unscored duplicate still earns the +10 for logging it.
    expect(entriesOf(snapshot, 'spot', 'second')).to.have.length(1);
  });

  it('fresh paint: +25 instead of +5 for a paint not seen before (never for "other")', () => {
    const snapshot = derive([
      seen('icon-1', T0, 'red', 'red'),
      seen('icon-1', plusHours(T0, 1), 'blue', 'blue'),
      seen('icon-1', plusHours(T0, 2), 'blue', 'blue-again'),
      seen('icon-2', plusHours(T0, 3), 'other', 'other-1'),
      seen('icon-2', plusHours(T0, 30), 'other', 'other-2'),
    ]);
    expect(entriesOf(snapshot, 'fresh_paint').map((entry) => [entry.spotId, entry.amount])).to.deep.equal([
      ['blue', 25],
    ]);
    expect(entriesOf(snapshot, 'duplicate', 'blue')).to.have.length(0);
    expect(entriesOf(snapshot, 'duplicate', 'other-2').map((entry) => entry.amount)).to.deep.equal([5]);
    expect(snapshot.paintsByModel['icon-1']).to.deep.equal(['red', 'blue']);
  });

  it('wildcard: +15 for a car outside the catalogue (also an unknown catalogue id)', () => {
    const snapshot = derive([
      spot({ id: 'free', createdAt: T0 }),
      spot({ id: 'unknown', carModelId: 'not-in-catalogue', createdAt: plusHours(T0, 1) }),
    ]);
    expect(entriesOf(snapshot, 'wildcard').map((entry) => [entry.spotId, entry.amount])).to.deep.equal([
      ['free', 15],
      ['unknown', 15],
    ]);
  });

  it('page complete: +300 when the last model of a category page is collected', () => {
    const snapshot = derive([seen('sports-a', T0, 'other', 's1'), seen('sports-b', plusHours(T0, 1), 'other', 's2')]);
    expect(entriesOf(snapshot, 'page_complete').map((entry) => [entry.spotId, entry.ref, entry.amount])).to.deep.equal([
      ['s2', 'sports', 300],
    ]);
    expect(snapshot.pages.find((page) => page.pageId === 'sports')).to.deep.include({
      collected: 2,
      total: 2,
      isComplete: true,
      completedAt: plusHours(T0, 1),
    });
  });

  it('set complete (Appendix E): +250 when the last car of a collection is collected', () => {
    const snapshot = derive([seen('jdm-a', T0, 'other', 'j1'), seen('sports-b', plusHours(T0, 1), 'other', 'j2')]);
    expect(entriesOf(snapshot, 'set_complete').map((entry) => [entry.spotId, entry.ref, entry.amount])).to.deep.equal([
      ['j2', 'jdm-legends', 250],
    ]);
    expect(XP.setComplete).to.equal(250);
  });

  it('album complete: +2,000 once the whole catalogue is collected', () => {
    const small = [model('one', 'icon', 'common', 1), model('two', 'sports', 'common', 2)];
    const snapshot = derive(
      [
        seen('one', T0, 'other', 'x'),
        seen('two', plusHours(T0, 1), 'other', 'y'),
        seen('two', plusHours(T0, 30), 'other', 'z'),
      ],
      small,
      [],
    );
    expect(entriesOf(snapshot, 'album_complete').map((entry) => [entry.spotId, entry.amount])).to.deep.equal([
      ['y', 2000],
    ]);
  });

  it('weekly challenge: warm-up +75, main +125, stretch +250 (scored in the week of spottedAt)', () => {
    expect([challengeXp('warmup'), challengeXp('main'), challengeXp('stretch')]).to.deep.equal([75, 125, 250]);
    // Find a week whose warm-up and stretch are plain "log N spots" boards, then log 10 wildcards in it.
    let week = '2026-W46';
    for (let index = 0; index < 300; index += 1) {
      const board = weeklyChallenges(week, CATALOGUE, COLLECTIONS);
      if (board[0]?.template === 'spots' && board[2]?.template === 'spots') break;
      week = shiftWeekKey(week, 1);
    }
    const start = weekBounds(week, brusselsOffset).start.toISOString();
    const spots = Array.from({ length: 10 }, (_, index) =>
      spot({ id: `w${index}`, createdAt: plusHours(start, 10 + index) }),
    );
    const snapshot = derive(spots);
    const challenges = entriesOf(snapshot, 'challenge');
    expect(challenges.find((entry) => entry.ref === `${week}:warmup`)?.amount).to.equal(75);
    expect(challenges.find((entry) => entry.ref === `${week}:stretch`)?.amount).to.equal(250);
    expect(challenges.find((entry) => entry.ref === `${week}:stretch`)?.spotId).to.equal('w9');
  });

  it('weekly challenge main +125 and clean sweep +150 for all three', () => {
    let week = '2026-W46';
    for (let index = 0; index < 600; index += 1) {
      const board = weeklyChallenges(week, CATALOGUE, COLLECTIONS);
      if (
        board[0]?.template === 'spots' &&
        board[1]?.template === 'new_stickers' &&
        (board[2]?.template === 'spots' || board[2]?.template === 'new_stickers')
      )
        break;
      week = shiftWeekKey(week, 1);
    }
    const board = weeklyChallenges(week, CATALOGUE, COLLECTIONS);
    expect(board[1]?.template).to.equal('new_stickers');
    const start = weekBounds(week, brusselsOffset).start.toISOString();
    const spots = CATALOGUE.slice(0, 10).map((entry, index) =>
      seen(entry.id, plusHours(start, 10 + index), 'other', `n${index}`),
    );
    const snapshot = derive(spots);
    expect(entriesOf(snapshot, 'challenge').find((entry) => entry.ref === `${week}:main`)?.amount).to.equal(125);
    expect(entriesOf(snapshot, 'clean_sweep').map((entry) => [entry.ref, entry.amount])).to.deep.equal([[week, 150]]);
  });

  it('streak extended: +25 × min(streakWeeks, 8) for the first spot of each consecutive week', () => {
    expect([streakXp(1), streakXp(2), streakXp(3), streakXp(8), streakXp(12)]).to.deep.equal([0, 50, 75, 200, 200]);
    const spots = Array.from({ length: 10 }, (_, index) =>
      spot({ id: `wk${index}`, createdAt: new Date(Date.UTC(2026, 8, 2 + index * 7, 12)).toISOString() }),
    );
    // A second spot in the first week never earns streak XP.
    spots.push(spot({ id: 'wk0b', createdAt: new Date(Date.UTC(2026, 8, 3, 12)).toISOString() }));
    const snapshot = derive(spots);
    expect(entriesOf(snapshot, 'streak').map((entry) => entry.amount)).to.deep.equal([
      50, 75, 100, 125, 150, 175, 200, 200, 200,
    ]);
    expect(entriesOf(snapshot, 'streak', 'wk0')).to.have.length(0);
  });

  it('achievement tier: bronze +50, silver +100, gold +250; single-threshold achievements count as gold', () => {
    expect([achievementTierXp(1), achievementTierXp(2), achievementTierXp(3)]).to.deep.equal([50, 100, 250]);
    const snapshot = derive([seen('icon-1', T0, 'other', 'first')]);
    const ignition = entriesOf(snapshot, 'achievement').filter((entry) => entry.ref === 'ignition');
    expect(ignition.map((entry) => entry.amount)).to.deep.equal([250]);
    const spots = Array.from({ length: 6 }, (_, index) =>
      seen(`icon-${index + 1}`, plusHours(T0, index), 'other', `c${index}`),
    );
    const collector = entriesOf(derive(spots), 'achievement').filter((entry) => entry.ref === 'collector');
    expect(collector.map((entry) => [entry.spotId, entry.amount])).to.deep.equal([['c5', 50]]);
  });

  it('owner match: 0 XP (no XP kind exists for it)', () => {
    expect(XP.ownerMatch).to.equal(0);
    const snapshot = derive([seen('icon-1', T0, 'other', 'match')]);
    expect(snapshot.ledger.every((entry) => entry.amount > 0)).to.equal(true);
  });

  it('totals the ledger into xp and level', () => {
    // A week outside any test board: 2026-W02 (only challenges of W02 can fire).
    const snapshot = derive([seen('icon-1', '2026-01-07T12:00:00.000Z', 'other', 'a')]);
    const sum = snapshot.ledger.reduce((total, entry) => total + entry.amount, 0);
    expect(snapshot.xp).to.equal(sum);
    // At least +10 spot, +40 common and +250 ignition (gold); no streak in the first week.
    expect(snapshot.xp).to.be.at.least(300);
    expect(entriesOf(snapshot, 'streak')).to.have.length(0);
    expect(snapshot.level.level).to.equal(levelForXp(sum).level);
  });
});
