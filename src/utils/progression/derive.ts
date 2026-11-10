import { ACHIEVEMENTS, HOLY_TRINITY_IDS } from '../../constants/achievements';
import { ALBUM_PAGES } from '../../constants/albumPages';
import { XP } from '../../constants/xp';
import type { CarModel, PaintColor } from '../../types/CarModel';
import type { Collection } from '../../types/Collection';
import type {
  AchievementId,
  AchievementProgress,
  AchievementTier,
  AlbumPageId,
  ChallengeProgress,
  PageProgress,
  ProgressSnapshot,
  SetProgress,
  WeeklyChallenge,
  XpEntry,
  XpKind,
} from '../../types/Progress';
import type { Spot } from '../../types/Spot';
import {
  buildAchievements,
  thresholdsOf,
  tierFor,
  tierName,
  tiersBetween,
  type AchievementMetrics,
} from './achievements';
import { evaluateChallenge, weeklyChallenges, type ChallengeFact } from './challenges';
import { levelForXp } from './levels';
import { computeWeeklyStreak, runEndingAt } from './streak';
import { deviceUtcOffset, isLastDayOfWeek, isoWeekKey, weekBounds, type UtcOffset } from './weeks';
import { achievementTierXp, recordSpot, scoreSpot, streakXp, type ModelHistory } from './xp';

/** Milliseconds of an ISO timestamp; 0 for an unparseable one (sorted first, never crashes). */
export function timeOf(iso: string): number {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
}

/** Replay order (P0-13): by `createdAt`, ties broken by id. */
export function replayOrder(spots: readonly Spot[]): Spot[] {
  return [...spots].sort(
    (a, b) => timeOf(a.createdAt) - timeOf(b.createdAt) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}

/** The album page of a catalogue model (its category page), or Wildcards for anything else. */
export function pageIdOf(model: CarModel | undefined): AlbumPageId {
  if (model === undefined) return 'wildcards';
  return ALBUM_PAGES.find((page) => page.category === model.category)?.id ?? 'wildcards';
}

/** Catalogue model of a spot; a spot whose model is not (or no longer) in the catalogue is a wildcard. */
export function modelOfSpot(spot: Spot, modelById: ReadonlyMap<string, CarModel>): CarModel | undefined {
  return spot.carModelId === undefined ? undefined : modelById.get(spot.carModelId);
}

/** Collection members that exist in the catalogue, per collection id. */
export function collectionMembers(
  collections: readonly Collection[],
  modelById: ReadonlyMap<string, CarModel>,
): Map<string, string[]> {
  const members = new Map<string, string[]>();
  for (const collection of collections) {
    members.set(
      collection.id,
      [...new Set(collection.modelIds)].filter((id) => modelById.has(id)),
    );
  }
  return members;
}

/** Collection ids per model id. */
export function collectionsByModel(members: ReadonlyMap<string, readonly string[]>): Map<string, string[]> {
  const byModel = new Map<string, string[]>();
  for (const [collectionId, modelIds] of members) {
    for (const modelId of modelIds) byModel.set(modelId, [...(byModel.get(modelId) ?? []), collectionId]);
  }
  return byModel;
}

interface WeekState {
  challenges: WeeklyChallenge[];
  facts: ChallengeFact[];
  completedAt: Map<string, string>;
  swept: boolean;
}

interface Tally {
  spots: number;
  wildcards: number;
  platesHidden: number;
  notes: number;
  paints: Set<PaintColor>;
  countries: Set<string>;
  legendaries: number;
  completePages: number;
  completeSets: number;
  challengesDone: number;
  bestStreak: number;
  holyTrinity: number;
}

function metricsOf(tally: Tally, collected: number): AchievementMetrics {
  return {
    ignition: tally.spots,
    spotter: tally.spots,
    collector: collected,
    full_page: tally.completePages,
    legend_hunter: tally.legendaries,
    paint_shop: tally.paints.size,
    globetrotter: tally.countries.size,
    wildcard: tally.wildcards,
    regular: tally.bestStreak,
    pit_wall: tally.challengesDone,
    clean_plates: tally.platesHidden,
    logbook: tally.notes,
    holy_trinity: tally.holyTrinity,
    redline: collected,
    set_collector: tally.completeSets,
  };
}

/**
 * Derives all progression from the user's own spots (D-6): pure and deterministic, so deleting a
 * spot and re-deriving gives exactly the ledger without it. Spots are replayed by `createdAt` (ties
 * by id) into an XP ledger following SPEC §4.4. Weekly challenges count only spots whose `spottedAt`
 * falls in their week; the weekly streak counts the weeks in which spots were logged (`createdAt`).
 *
 * @param utcOffsetMinutes a fixed offset, or a DST-aware function; default: the device's rules
 * @param collections Appendix E themed collections (optional, so a missing list never blocks progress)
 */
export function deriveProgress(
  spots: readonly Spot[],
  models: readonly CarModel[],
  now: Date,
  utcOffsetMinutes: UtcOffset = deviceUtcOffset,
  collections: readonly Collection[] = [],
): ProgressSnapshot {
  const offset = utcOffsetMinutes;
  const modelById = new Map(models.map((model) => [model.id, model]));
  const members = collectionMembers(collections, modelById);
  const setsOfModel = collectionsByModel(members);
  const pageTotals = new Map<AlbumPageId, number>();
  for (const model of models) pageTotals.set(pageIdOf(model), (pageTotals.get(pageIdOf(model)) ?? 0) + 1);
  const catalogueSize = models.length;

  const ledger: XpEntry[] = [];
  const histories = new Map<string, ModelHistory>();
  const collectedIds: string[] = [];
  const pageCollected = new Map<AlbumPageId, number>();
  const pageCompletedAt = new Map<AlbumPageId, string>();
  const setCollected = new Map<string, number>();
  const setCompletedAt = new Map<string, string>();
  const activeWeeks = new Set<string>();
  const weeks = new Map<string, WeekState>();
  const tiers = new Map<AchievementId, AchievementTier>();
  const unlockedAt: Partial<Record<AchievementId, AchievementProgress['unlockedAt']>> = {};
  const tally: Tally = {
    spots: 0,
    wildcards: 0,
    platesHidden: 0,
    notes: 0,
    paints: new Set(),
    countries: new Set(),
    legendaries: 0,
    completePages: 0,
    completeSets: 0,
    challengesDone: 0,
    bestStreak: 0,
    holyTrinity: 0,
  };
  let albumComplete = false;

  const weekState = (weekKey: string): WeekState => {
    const existing = weeks.get(weekKey);
    if (existing !== undefined) return existing;
    const created: WeekState = {
      challenges: weeklyChallenges(weekKey, models, collections),
      facts: [],
      completedAt: new Map(),
      swept: false,
    };
    weeks.set(weekKey, created);
    return created;
  };

  for (const spot of replayOrder(spots)) {
    const at = spot.createdAt;
    const add = (kind: XpKind, amount: number, ref?: string) => {
      ledger.push(
        ref === undefined ? { kind, amount, at, spotId: spot.id } : { kind, amount, at, spotId: spot.id, ref },
      );
    };
    const model = modelOfSpot(spot, modelById);
    const pageId = pageIdOf(model);
    const spottedAtMs = timeOf(spot.spottedAt);

    // 1. Logging the spot, then the sticker itself.
    add('spot', XP.spot);
    const history = model === undefined ? undefined : histories.get(model.id);
    const score = scoreSpot(model, spot.paint, spottedAtMs, history);
    switch (score.kind) {
      case 'new':
        add('new_sticker', score.amount, model?.id);
        break;
      case 'fresh_paint':
        add('fresh_paint', score.amount, model?.id);
        break;
      case 'duplicate':
        if (score.amount > 0) add('duplicate', score.amount, model?.id);
        break;
      case 'wildcard':
        add('wildcard', score.amount);
        break;
    }

    // 2. Counters.
    tally.spots += 1;
    tally.platesHidden += Math.max(0, spot.platesHidden);
    if ((spot.notes ?? '').trim().length > 0) tally.notes += 1;
    if (spot.paint !== 'other') tally.paints.add(spot.paint);
    if (model === undefined) tally.wildcards += 1;
    else histories.set(model.id, recordSpot(history, spot.paint, spottedAtMs, score.scored));

    // 3. A new sticker can complete a page, collections and the album.
    if (model !== undefined && score.kind === 'new') {
      collectedIds.push(model.id);
      if (model.country !== 'XX') tally.countries.add(model.country);
      if (model.rarity === 'legendary') tally.legendaries += 1;
      if (HOLY_TRINITY_IDS.some((id) => id === model.id)) tally.holyTrinity += 1;
      const onPage = (pageCollected.get(pageId) ?? 0) + 1;
      pageCollected.set(pageId, onPage);
      if (onPage === pageTotals.get(pageId)) {
        pageCompletedAt.set(pageId, at);
        tally.completePages += 1;
        add('page_complete', XP.pageComplete, pageId);
      }
      for (const collectionId of setsOfModel.get(model.id) ?? []) {
        const inSet = (setCollected.get(collectionId) ?? 0) + 1;
        setCollected.set(collectionId, inSet);
        if (inSet === members.get(collectionId)?.length) {
          setCompletedAt.set(collectionId, at);
          tally.completeSets += 1;
          add('set_complete', XP.setComplete, collectionId);
        }
      }
      if (!albumComplete && catalogueSize > 0 && collectedIds.length === catalogueSize) {
        albumComplete = true;
        add('album_complete', XP.albumComplete);
      }
    }

    // 4. Weekly streak: the first spot logged in a new consecutive week.
    const logWeek = isoWeekKey(new Date(timeOf(at)), offset);
    if (!activeWeeks.has(logWeek)) {
      activeWeeks.add(logWeek);
      const run = runEndingAt(activeWeeks, logWeek);
      const bonus = streakXp(run);
      if (bonus > 0) add('streak', bonus, logWeek);
      tally.bestStreak = Math.max(tally.bestStreak, run);
    }

    // 5. Weekly challenges of the week the car was spotted in.
    const spotWeek = isoWeekKey(new Date(spottedAtMs), offset);
    const week = weekState(spotWeek);
    week.facts.push({
      spot,
      model,
      isNew: score.kind === 'new',
      pageId,
      collectionIds: model === undefined ? [] : (setsOfModel.get(model.id) ?? []),
    });
    for (const challenge of week.challenges) {
      if (week.completedAt.has(challenge.id)) continue;
      if (evaluateChallenge(challenge, week.facts) >= challenge.target) {
        week.completedAt.set(challenge.id, at);
        tally.challengesDone += 1;
        add('challenge', challenge.xp, challenge.id);
      }
    }
    if (!week.swept && week.challenges.length > 0 && week.completedAt.size === week.challenges.length) {
      week.swept = true;
      add('clean_sweep', XP.cleanSweep, spotWeek);
    }

    // 6. Achievement tiers (their own XP never feeds another achievement).
    const metrics = metricsOf(tally, collectedIds.length);
    for (const definition of ACHIEVEMENTS) {
      const thresholds = thresholdsOf(definition, catalogueSize);
      const before = tiers.get(definition.id) ?? 0;
      const after = tierFor(metrics[definition.id], thresholds);
      if (after <= before) continue;
      tiers.set(definition.id, after);
      const record = { ...(unlockedAt[definition.id] ?? {}) };
      for (const tier of tiersBetween(before, after, thresholds.length === 1)) {
        const name = tierName(tier);
        if (name !== undefined) record[name] = at;
        add('achievement', achievementTierXp(tier), definition.id);
      }
      unlockedAt[definition.id] = record;
    }
  }

  const xp = ledger.reduce((sum, entry) => sum + entry.amount, 0);
  const weekKey = isoWeekKey(now, offset);
  const current = weekState(weekKey);

  const pages: PageProgress[] = ALBUM_PAGES.flatMap((page): PageProgress[] => {
    if (page.category === undefined) return [];
    const total = pageTotals.get(page.id) ?? 0;
    const collected = pageCollected.get(page.id) ?? 0;
    const completedAt = pageCompletedAt.get(page.id);
    const progress: PageProgress = { pageId: page.id, collected, total, isComplete: total > 0 && collected >= total };
    return [completedAt === undefined ? progress : { ...progress, completedAt }];
  });

  const sets: SetProgress[] = [...collections]
    .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id))
    .map((collection) => {
      const total = members.get(collection.id)?.length ?? 0;
      const collected = setCollected.get(collection.id) ?? 0;
      const completedAt = setCompletedAt.get(collection.id);
      const progress: SetProgress = {
        collectionId: collection.id,
        collected,
        total,
        isComplete: total > 0 && collected >= total,
      };
      return completedAt === undefined ? progress : { ...progress, completedAt };
    });

  const challenges: ChallengeProgress[] = current.challenges.map((challenge) => {
    const value = evaluateChallenge(challenge, current.facts);
    const completedAt = current.completedAt.get(challenge.id);
    const progress: ChallengeProgress = { challenge, value, isComplete: completedAt !== undefined };
    return completedAt === undefined ? progress : { ...progress, completedAt };
  });

  const paintsByModel: Record<string, PaintColor[]> = {};
  for (const [modelId, history] of histories) paintsByModel[modelId] = history.paints;

  return {
    xp,
    level: levelForXp(xp),
    ledger,
    pages,
    sets,
    achievements: buildAchievements(metricsOf(tally, collectedIds.length), catalogueSize, unlockedAt),
    challenges,
    streak: computeWeeklyStreak(activeWeeks, weekKey, isLastDayOfWeek(now, offset)),
    collectedIds,
    paintsByModel,
    weekKey,
    weekEndsAt: weekBounds(weekKey, offset).end.toISOString(),
  };
}
