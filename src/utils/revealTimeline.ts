import { durations } from '../theme/motion';
import type { CarModel } from '../types/CarModel';
import { COLLECTION_IDS, type Collection, type CollectionId } from '../types/Collection';
import {
  ACHIEVEMENT_IDS,
  type AchievementId,
  type AchievementTier,
  type AlbumPageId,
  type RevealData,
  type StampKind,
  type XpKind,
} from '../types/Progress';
import type { HapticPattern } from '../types/Settings';
import type { Spot } from '../types/Spot';

/**
 * The sticker reveal as data (SPEC P0-15, W7). Everything here is pure, so the order of the ritual,
 * its timings and what it shows are unit-tested without rendering anything.
 */

/** The steps of the reveal, in the order they play (SPEC P0-15 1–8). */
export const REVEAL_STEP_IDS = [
  'packet',
  'tear',
  'stamp',
  'xp',
  'shiftLights',
  'levelUp',
  'pageProgress',
  'sets',
  'rewards',
  'stick',
] as const;
export type RevealStepId = (typeof REVEAL_STEP_IDS)[number];

export interface RevealStep {
  id: RevealStepId;
  /** Length of the step's own animation in ms (0 with reduced motion). */
  duration: number;
  /** Pause after the animation before the next step starts, in ms (0 with reduced motion). */
  hold: number;
  /** Vibration played when the step starts. */
  haptic?: HapticPattern;
  /** The step waits for the user (the STICK IT button) instead of a timer. */
  awaitsTap: boolean;
}

/** The reveal shows 15 shift lights, like the Pit Wall. */
export const SHIFT_LIGHT_LEDS = 15;
/** Time between two LEDs lighting up. */
export const LED_STEP_MS = 60;

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

export type TimingColor = 'purple' | 'green' | 'yellow';
export type PlaqueTierName = 'bronze' | 'silver' | 'gold';

/** True when the spot moved the driver up at least one level. */
export function hasLevelUp(reveal: RevealData): boolean {
  return reveal.levelAfter.level > reveal.levelBefore.level;
}

/** True when the spot unlocked a dash plaque or completed a weekly challenge. */
export function hasRewards(reveal: RevealData): boolean {
  return reveal.achievementsUnlocked.length > 0 || reveal.challengesCompleted.length > 0;
}

/** Number of lit LEDs for a level ratio: round(ratio × 15), clamped. */
export function litLeds(ratio: number): number {
  const clamped = Number.isFinite(ratio) ? Math.min(Math.max(ratio, 0), 1) : 0;
  return Math.round(clamped * SHIFT_LIGHT_LEDS);
}

/**
 * The LED counts the shift lights pass through, one LED at a time. Without a level-up they climb
 * from the old ratio to the new one; with a level-up they climb all the way to the redline (the
 * SHIFT UP step then drops them to the new level's ratio).
 */
export function ledFrames(reveal: RevealData): number[] {
  const from = litLeds(reveal.levelBefore.ratio);
  const to = hasLevelUp(reveal) ? SHIFT_LIGHT_LEDS : litLeds(reveal.levelAfter.ratio);
  const frames: number[] = [];
  for (let lit = from + 1; lit <= to; lit += 1) frames.push(lit);
  return frames;
}

/**
 * The step list for one reveal. `levelUp` appears only when the level changed, `sets` only when the
 * car belongs to a themed collection and `rewards` only when a plaque or challenge was won.
 * With reduced motion every duration and hold is 0 (the stage shows the final values at once) and
 * only the STICK IT tap still vibrates.
 */
export function revealTimeline(
  reveal: RevealData,
  reduced: boolean,
  sets: readonly RevealSetProgress[] = [],
): RevealStep[] {
  const step = (id: RevealStepId, duration: number, hold: number, haptic?: HapticPattern): RevealStep => ({
    id,
    duration: reduced ? 0 : duration,
    hold: reduced ? 0 : hold,
    haptic: reduced ? undefined : haptic,
    awaitsTap: false,
  });

  const steps: RevealStep[] = [
    // The packet waits a moment (or a tap) before it tears.
    step('packet', durations.base, durations.sheen),
    step('tear', durations.flip, durations.base, 'tear'),
    step('stamp', durations.stamp, durations.slow, 'stamp'),
    step('xp', durations.odometer, durations.base),
    step('shiftLights', ledFrames(reveal).length * LED_STEP_MS, durations.base),
  ];
  if (hasLevelUp(reveal)) steps.push(step('levelUp', durations.slow, durations.sheen, 'shiftUp'));
  steps.push(step('pageProgress', durations.base, durations.slow));
  if (sets.length > 0) steps.push(step('sets', durations.base, durations.slow));
  if (hasRewards(reveal)) steps.push(step('rewards', durations.base, durations.slow));
  steps.push({ id: 'stick', duration: reduced ? 0 : durations.stick, hold: 0, haptic: 'stick', awaitsTap: true });
  return steps;
}

/** The stamp slammed on the sticker: NEW, ×N, FRESH PAINT or WILDCARD. */
export function revealStamp(reveal: RevealData): { kind: StampKind; count?: number } {
  switch (reveal.kind) {
    case 'new':
      return { kind: 'new' };
    case 'duplicate':
      return { kind: 'count', count: reveal.count };
    case 'fresh_paint':
      return { kind: 'fresh_paint' };
    case 'wildcard':
      return { kind: 'wildcard' };
  }
}

/**
 * Timing-screen colour of an XP row: purple for a first (new sticker, full page, album, set),
 * green for streaks, challenges and plaques, yellow for everything else.
 */
export function xpTiming(kind: XpKind): TimingColor {
  switch (kind) {
    case 'new_sticker':
    case 'page_complete':
    case 'album_complete':
    case 'set_complete':
      return 'purple';
    case 'streak':
    case 'challenge':
    case 'clean_sweep':
    case 'achievement':
      return 'green';
    default:
      return 'yellow';
  }
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
