import { CHALLENGE_PAINTS, CHALLENGE_SLOTS_TABLE } from '../../../src/constants/challengeTemplates';
import type { WeeklyChallenge } from '../../../src/types/Progress';
import {
  deriveProgress,
  evaluateChallenge,
  parseChallengeId,
  shiftWeekKey,
  weekBounds,
  weeklyChallenges,
  type ChallengeFact,
} from '../../../src/utils/progression';
import { brusselsOffset, CATALOGUE, COLLECTIONS, NOW, plusHours, spot } from './helpers';

function weeks(count: number, from = '2026-W01'): string[] {
  return Array.from({ length: count }, (_, index) => shiftWeekKey(from, index));
}

function challenge(template: WeeklyChallenge['template'], params: WeeklyChallenge['params'] = {}): WeeklyChallenge {
  return { id: '2026-W46:main', weekKey: '2026-W46', slot: 'main', template, params, target: 1, xp: 125 };
}

const byId = new Map(CATALOGUE.map((entry) => [entry.id, entry]));

function fact(carModelId: string | undefined, extra: Partial<ChallengeFact> = {}, spotExtra = {}): ChallengeFact {
  const model = carModelId === undefined ? undefined : byId.get(carModelId);
  return {
    spot: spot({ carModelId, ...spotExtra }),
    model,
    isNew: false,
    pageId: model === undefined ? 'wildcards' : model.category,
    collectionIds: COLLECTIONS.filter((set) => carModelId !== undefined && set.modelIds.includes(carModelId)).map(
      (set) => set.id,
    ),
    ...extra,
  };
}

describe('challenges: weeklyChallenges', () => {
  it('is deterministic per week and independent of catalogue order', () => {
    const board = weeklyChallenges('2026-W46', CATALOGUE, COLLECTIONS);
    expect(weeklyChallenges('2026-W46', CATALOGUE, COLLECTIONS)).to.deep.equal(board);
    expect(weeklyChallenges('2026-W46', [...CATALOGUE].reverse(), [...COLLECTIONS].reverse())).to.deep.equal(board);
    const others = weeks(10, '2026-W47').map((week) =>
      JSON.stringify(
        weeklyChallenges(week, CATALOGUE, COLLECTIONS).map((entry) => [entry.template, entry.params, entry.target]),
      ),
    );
    expect(new Set(others).size).to.be.greaterThan(1);
  });

  it('gives three boards in slot order with the slot XP and parseable ids', () => {
    weeks(60).forEach((week) => {
      const board = weeklyChallenges(week, CATALOGUE, COLLECTIONS);
      expect(board.map((entry) => entry.slot)).to.deep.equal(['warmup', 'main', 'stretch']);
      expect(board.map((entry) => entry.xp)).to.deep.equal([75, 125, 250]);
      board.forEach((entry) => {
        expect(entry.weekKey).to.equal(week);
        expect(parseChallengeId(entry.id)).to.deep.equal({ weekKey: week, slot: entry.slot });
      });
    });
  });

  it('only picks templates of the slot pool, with targets in range and valid parameters', () => {
    const countries = new Set(CATALOGUE.map((entry) => entry.country));
    weeks(150).forEach((week) => {
      weeklyChallenges(week, CATALOGUE, COLLECTIONS).forEach((entry) => {
        const definition = CHALLENGE_SLOTS_TABLE.find((slot) => slot.slot === entry.slot);
        const templates = definition?.templates.filter((template) => template.id === entry.template) ?? [];
        expect(templates, `${week} ${entry.slot} ${entry.template}`).to.have.length.greaterThan(0);
        const inRange = templates.some(
          (template) => entry.target >= template.target[0] && entry.target <= template.target[1],
        );
        expect(inRange).to.equal(true);
        if (entry.template === 'category')
          expect(CATALOGUE.some((m) => m.category === entry.params.category)).to.equal(true);
        if (entry.template === 'paint') expect(CHALLENGE_PAINTS).to.include(entry.params.paint);
        if (entry.template === 'country') expect(countries.has(entry.params.country ?? '')).to.equal(true);
        if (entry.template === 'rarity_min') expect(entry.params.rarity).to.equal('epic');
        if (entry.template === 'collection') {
          expect(COLLECTIONS.map((set) => set.id)).to.include(entry.params.collection);
          expect(entry.target).to.equal(2);
        }
      });
    });
  });

  it('offers the Appendix E "2 cars from {set}" board only when collections are known', () => {
    const withSets = weeks(200).flatMap((week) => weeklyChallenges(week, CATALOGUE, COLLECTIONS));
    expect(withSets.some((entry) => entry.template === 'collection')).to.equal(true);
    const withoutSets = weeks(200).flatMap((week) => weeklyChallenges(week, CATALOGUE));
    expect(withoutSets.some((entry) => entry.template === 'collection')).to.equal(false);
  });
});

describe('challenges: evaluateChallenge', () => {
  it('counts spots, notes, wildcards and new stickers', () => {
    const facts = [
      fact('icon-1', { isNew: true }, { notes: 'Leuven meet' }),
      fact('icon-1', {}, { notes: '   ' }),
      fact(undefined),
    ];
    expect(evaluateChallenge(challenge('spots'), facts)).to.equal(3);
    expect(evaluateChallenge(challenge('notes'), facts)).to.equal(1);
    expect(evaluateChallenge(challenge('wildcard'), facts)).to.equal(1);
    expect(evaluateChallenge(challenge('new_stickers'), facts)).to.equal(1);
  });

  it('counts by category, paint, country and minimum rarity', () => {
    const facts = [
      fact('super-a', {}, { paint: 'red' }),
      fact('mclaren-p1', {}, { paint: 'orange' }),
      fact('icon-1', {}, { paint: 'red' }),
      fact(undefined, {}, { paint: 'red' }),
    ];
    expect(evaluateChallenge(challenge('category', { category: 'icon' }), facts)).to.equal(1);
    expect(evaluateChallenge(challenge('paint', { paint: 'red' }), facts)).to.equal(3);
    expect(evaluateChallenge(challenge('country', { country: 'IT' }), facts)).to.equal(1);
    expect(evaluateChallenge(challenge('rarity_min', { rarity: 'epic' }), facts)).to.equal(2);
  });

  it('counts distinct album pages and the most spotted make', () => {
    const facts = [fact('icon-1'), fact('icon-2'), fact('sports-a'), fact(undefined)];
    expect(evaluateChallenge(challenge('distinct_pages'), facts)).to.equal(3);
    // icon-1 and icon-2 are both Volkswagen.
    expect(evaluateChallenge(challenge('same_make'), facts)).to.equal(2);
    expect(evaluateChallenge(challenge('same_make'), [])).to.equal(0);
  });

  it('counts distinct cars of a collection (Appendix E)', () => {
    const facts = [fact('jdm-a'), fact('jdm-a'), fact('icon-1')];
    expect(evaluateChallenge(challenge('collection', { collection: 'jdm-legends' }), facts)).to.equal(1);
    expect(
      evaluateChallenge(challenge('collection', { collection: 'jdm-legends' }), [...facts, fact('sports-b')]),
    ).to.equal(2);
    expect(evaluateChallenge(challenge('collection'), facts)).to.equal(0);
  });

  it('only counts spots whose spottedAt falls in the week of the board', () => {
    const start = weekBounds('2026-W46', brusselsOffset).start.toISOString();
    const spots = [
      // Logged in W46, but spotted in W45 (an older gallery photo): not on the W46 board.
      spot({ id: 'old', createdAt: plusHours(start, 30), spottedAt: plusHours(start, -30), notes: 'Old photo' }),
      spot({ id: 'fresh', createdAt: plusHours(start, 31), notes: 'At the meet' }),
    ];
    const snapshot = deriveProgress(spots, CATALOGUE, NOW, brusselsOffset, COLLECTIONS);
    expect(snapshot.challenges.map((entry) => entry.challenge.weekKey)).to.deep.equal([
      '2026-W46',
      '2026-W46',
      '2026-W46',
    ]);
    // The deterministic W46 board has a 'notes' challenge; both spots have a note, only one counts.
    const notesBoard = snapshot.challenges.find((entry) => entry.challenge.template === 'notes');
    expect(notesBoard, 'notes board of 2026-W46').to.not.equal(undefined);
    expect(notesBoard?.value).to.equal(1);
  });
});
