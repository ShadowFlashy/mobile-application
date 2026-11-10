import type { CarModel } from '../../types/CarModel';
import type { Collection } from '../../types/Collection';
import {
  ACHIEVEMENT_IDS,
  type AchievementId,
  type AchievementTier,
  type ProgressSnapshot,
  type RevealData,
  type RevealKind,
  type SetProgress,
  type WeeklyChallenge,
  type XpEntry,
} from '../../types/Progress';
import type { Spot } from '../../types/Spot';
import { isAlbumPageId } from '../typeGuards';
import { achievementDefinition, thresholdsOf } from './achievements';
import { parseChallengeId, weeklyChallenges } from './challenges';
import { collectionMembers, modelOfSpot, pageIdOf, replayOrder } from './derive';
import { levelForXp } from './levels';

function isAchievementId(value: string | undefined): value is AchievementId {
  return ACHIEVEMENT_IDS.some((id) => id === value);
}

function revealKind(entries: readonly XpEntry[], model: CarModel | undefined): RevealKind {
  if (model === undefined) return 'wildcard';
  if (entries.some((entry) => entry.kind === 'new_sticker')) return 'new';
  if (entries.some((entry) => entry.kind === 'fresh_paint')) return 'fresh_paint';
  return 'duplicate';
}

/** Tiers unlocked by this spot: the n-th ledger entry of an achievement is its n-th tier. */
function unlockedTiers(
  ledger: readonly XpEntry[],
  spotId: string,
  catalogueSize: number,
): { id: AchievementId; tier: AchievementTier }[] {
  const seen = new Map<AchievementId, number>();
  const unlocked: { id: AchievementId; tier: AchievementTier }[] = [];
  for (const entry of ledger) {
    if (entry.kind !== 'achievement' || !isAchievementId(entry.ref)) continue;
    const id = entry.ref;
    const index = (seen.get(id) ?? 0) + 1;
    seen.set(id, index);
    if (entry.spotId !== spotId) continue;
    const definition = achievementDefinition(id);
    const single = definition !== undefined && thresholdsOf(definition, catalogueSize).length === 1;
    const tier: AchievementTier = single || index >= 3 ? 3 : index === 2 ? 2 : 1;
    unlocked.push({ id, tier });
  }
  return unlocked;
}

/**
 * Everything the reveal of one spot shows (P0-13), re-derived from the snapshot and the cached
 * spots, so a refresh or deep link of /reveal/<id> works. Undefined when the spot does not exist.
 */
export function revealFor(
  snapshot: ProgressSnapshot,
  spots: readonly Spot[],
  models: readonly CarModel[],
  spotId: string,
  collections: readonly Collection[] = [],
): RevealData | undefined {
  const ordered = replayOrder(spots);
  const position = ordered.findIndex((candidate) => candidate.id === spotId);
  const spot = ordered[position];
  if (spot === undefined) return undefined;

  const modelById = new Map(models.map((model) => [model.id, model]));
  const model = modelOfSpot(spot, modelById);
  const pageId = pageIdOf(model);
  const upToHere = ordered.slice(0, position + 1);

  const firstIndex = snapshot.ledger.findIndex((entry) => entry.spotId === spotId);
  const entries = snapshot.ledger.filter((entry) => entry.spotId === spotId);
  const xpBefore =
    firstIndex < 0 ? snapshot.xp : snapshot.ledger.slice(0, firstIndex).reduce((sum, entry) => sum + entry.amount, 0);
  const xpGained = entries.reduce((sum, entry) => sum + entry.amount, 0);

  const challengeCache = new Map<string, WeeklyChallenge[]>();
  const challengesCompleted = entries.flatMap((entry): WeeklyChallenge[] => {
    if (entry.kind !== 'challenge' || entry.ref === undefined) return [];
    const parsed = parseChallengeId(entry.ref);
    if (parsed === undefined) return [];
    const board = challengeCache.get(parsed.weekKey) ?? weeklyChallenges(parsed.weekKey, models, collections);
    challengeCache.set(parsed.weekKey, board);
    const challenge = board.find((candidate) => candidate.id === entry.ref);
    return challenge === undefined ? [] : [challenge];
  });

  // Collections this model belongs to, counted as of this spot.
  const members = collectionMembers(collections, modelById);
  const collectedSoFar = new Set(
    upToHere.flatMap((candidate) => {
      const candidateModel = modelOfSpot(candidate, modelById);
      return candidateModel === undefined ? [] : [candidateModel.id];
    }),
  );
  const setsCompleted = entries.flatMap((entry) =>
    entry.kind === 'set_complete' && entry.ref !== undefined ? [entry.ref] : [],
  );
  const sets: SetProgress[] =
    model === undefined
      ? []
      : [...collections]
          .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id))
          .flatMap((collection): SetProgress[] => {
            const ids = members.get(collection.id) ?? [];
            if (!ids.includes(model.id)) return [];
            const collected = ids.filter((id) => collectedSoFar.has(id)).length;
            const progress: SetProgress = {
              collectionId: collection.id,
              collected,
              total: ids.length,
              isComplete: ids.length > 0 && collected >= ids.length,
            };
            const completed = snapshot.sets.find((set) => set.collectionId === collection.id)?.completedAt;
            return completed === undefined || !progress.isComplete
              ? [progress]
              : [{ ...progress, completedAt: completed }];
          });

  const pageModels =
    model === undefined
      ? []
      : models
          .filter((candidate) => candidate.category === model.category)
          .sort((a, b) => a.stickerNumber - b.stickerNumber);
  const slotIndex = model === undefined ? -1 : pageModels.findIndex((candidate) => candidate.id === model.id);

  const reveal: RevealData = {
    spot,
    model,
    kind: revealKind(entries, model),
    count: model === undefined ? 1 : upToHere.filter((candidate) => candidate.carModelId === model.id).length,
    entries,
    xpGained,
    levelBefore: levelForXp(xpBefore),
    levelAfter: levelForXp(xpBefore + xpGained),
    pagesCompleted: entries.flatMap((entry) =>
      entry.kind === 'page_complete' && isAlbumPageId(entry.ref) ? [entry.ref] : [],
    ),
    setsCompleted,
    sets,
    achievementsUnlocked: unlockedTiers(snapshot.ledger, spotId, models.length),
    challengesCompleted,
    pageId,
  };
  return slotIndex < 0 ? reveal : { ...reveal, slotIndex };
}
