import { durations } from '../theme/motion';
import type { CarModel } from '../types/CarModel';
import { COLLECTION_IDS, type Collection, type CollectionId } from '../types/Collection';
import {
  ACHIEVEMENT_IDS,
  type AchievementId,
  type AchievementTier,
  type AlbumPageId,
  type RevealData,
} from '../types/Progress';
import type { Spot } from '../types/Spot';

/**
 * The sticker reveal as data (SPEC P0-15). The reveal is one calm result screen: a single entrance
 * (fade and a short rise, none with reduced motion) and a quick count-up of the XP total. Everything
 * here is pure, so what it shows and how it counts are unit-tested without rendering anything.
 */

/** The reveal's one entrance animation, in ms (at most 300; 0 with reduced motion). */
export const REVEAL_ENTRANCE_MS = durations.base;
/** The quick count-up of the XP total, in ms (skipped with reduced motion). */
export const XP_COUNT_UP_MS = durations.slow;

/** Set progress of one themed collection at the moment of the revealed spot (Appendix E). */
export interface RevealSetProgress {
  id: CollectionId;
  number: number;
  collected: number;
  total: number;
  isComplete: boolean;
  /** This spot completed the set: SET COMPLETE. */
  justCompleted: boolean;
}

/** Album page progress at the moment of the revealed spot ("SUPERCARS 4/6"). */
export interface RevealPageProgress {
  pageId: AlbumPageId;
  /** Stickers on the page (for Wildcards: wildcard spots so far). */
  collected: number;
  /** Slots on the page (0 for Wildcards, which has no slots). */
  total: number;
  isComplete: boolean;
  /** This spot completed the page: FULL PAGE. */
  justCompleted: boolean;
}

export type PlaqueTierName = 'bronze' | 'silver' | 'gold';

/** True when the spot moved the driver up at least one level. */
export function hasLevelUp(reveal: RevealData): boolean {
  return reveal.levelAfter.level > reveal.levelBefore.level;
}

/** True when the spot earned an achievement tier or completed a weekly challenge. */
export function hasRewards(reveal: RevealData): boolean {
  return reveal.achievementsUnlocked.length > 0 || reveal.challengesCompleted.length > 0;
}

/**
 * The XP total while it counts up: an ease-out from 0 to `target` over `duration` ms, rounded down
 * and clamped, so it never overshoots and lands exactly on the target.
 */
export function countUpValue(target: number, elapsed: number, duration: number): number {
  if (!Number.isFinite(target) || target <= 0) return 0;
  if (duration <= 0 || elapsed >= duration) return target;
  const progress = Math.max(0, elapsed) / duration;
  const eased = 1 - (1 - progress) ** 3;
  return Math.min(target, Math.floor(target * eased));
}

/** Plaque tier name of an achievement tier (0 = locked). */
export function tierName(tier: AchievementTier): PlaqueTierName | undefined {
  switch (tier) {
    case 1:
      return 'bronze';
    case 2:
      return 'silver';
    case 3:
      return 'gold';
    default:
      return undefined;
  }
}

/** Narrows a collection id from the database to the known Appendix E sets. */
export function toCollectionId(value: string): CollectionId | undefined {
  return COLLECTION_IDS.find((id) => id === value);
}

/** Narrows an XP entry's `ref` to an achievement id. */
export function toAchievementId(value: string | undefined): AchievementId | undefined {
  return ACHIEVEMENT_IDS.find((id) => id === value);
}

/** Spots ordered like the progression engine replays them: by createdAt, ties broken by id. */
function compareSpots(a: Spot, b: Spot): number {
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

/** Every spot up to and including the revealed one (later spots do not count for its reveal). */
export function spotsUpTo(spots: readonly Spot[], target: Spot): Spot[] {
  const earlier = spots.filter((spot) => spot.id !== target.id && compareSpots(spot, target) < 0);
  return [...earlier, target];
}

function collectedModelIds(spots: readonly Spot[]): Set<string> {
  const ids = new Set<string>();
  for (const spot of spots) if (spot.carModelId !== undefined) ids.add(spot.carModelId);
  return ids;
}

/** The catalogue id of the revealed car, if it is in the catalogue. */
function revealedModelId(reveal: RevealData): string | undefined {
  return reveal.model?.id ?? reveal.spot.carModelId;
}

/** Page progress right after the revealed spot ("SUPERCARS 4/6"; Wildcards counts its spots). */
export function revealPageProgress(
  reveal: RevealData,
  spots: readonly Spot[],
  models: readonly CarModel[],
): RevealPageProgress {
  const upTo = spotsUpTo(spots, reveal.spot);
  if (reveal.pageId === 'wildcards') {
    const collected = upTo.filter((spot) => spot.carModelId === undefined).length;
    return { pageId: reveal.pageId, collected, total: 0, isComplete: false, justCompleted: false };
  }
  const pageModels = new Set(models.filter((model) => model.category === reveal.pageId).map((model) => model.id));
  const owned = collectedModelIds(upTo);
  const collected = [...pageModels].filter((id) => owned.has(id)).length;
  const total = pageModels.size;
  const isComplete = total > 0 && collected === total;
  return { pageId: reveal.pageId, collected, total, isComplete, justCompleted: isComplete && reveal.kind === 'new' };
}

/**
 * The set progress the progression engine put in the reveal (RevealData.sets / setsCompleted),
 * narrowed to the known Appendix E sets.
 */
export function revealSets(reveal: RevealData): RevealSetProgress[] {
  const result: RevealSetProgress[] = [];
  reveal.sets.forEach((set, index) => {
    const id = toCollectionId(set.collectionId);
    if (id === undefined) return;
    result.push({
      id,
      number: index + 1,
      collected: set.collected,
      total: set.total,
      isComplete: set.isComplete,
      justCompleted: reveal.setsCompleted.includes(set.collectionId),
    });
  });
  return result;
}

/**
 * Progress of every themed collection the revealed car belongs to, right after the spot
 * ("ITALIAN EXOTICS 3/10"), in set order. A set is just completed when this spot was the car's
 * first (a NEW sticker) and the set is now full.
 */
export function revealSetProgress(
  reveal: RevealData,
  spots: readonly Spot[],
  collections: readonly Collection[],
): RevealSetProgress[] {
  const modelId = revealedModelId(reveal);
  if (modelId === undefined) return [];
  const owned = collectedModelIds(spotsUpTo(spots, reveal.spot));
  const result: RevealSetProgress[] = [];
  for (const collection of collections) {
    const id = toCollectionId(collection.id);
    if (id === undefined || !collection.modelIds.includes(modelId)) continue;
    const members = new Set(collection.modelIds);
    const collected = [...members].filter((member) => owned.has(member)).length;
    const total = members.size;
    const isComplete = total > 0 && collected === total;
    result.push({
      id,
      number: collection.number,
      collected,
      total,
      isComplete,
      justCompleted: isComplete && reveal.kind === 'new',
    });
  }
  return result.sort((a, b) => a.number - b.number);
}
