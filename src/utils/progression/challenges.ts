import { CHALLENGE_PAINTS, CHALLENGE_RARITIES, CHALLENGE_SLOTS_TABLE } from '../../constants/challengeTemplates';
import type { ChallengeParamKind, ChallengeTemplate } from '../../constants/challengeTemplates';
import { CAR_CATEGORIES, RARITIES, type CarModel, type Rarity } from '../../types/CarModel';
import type { Collection } from '../../types/Collection';
import type { AlbumPageId, ChallengeParams, ChallengeSlot, WeeklyChallenge } from '../../types/Progress';
import type { Spot } from '../../types/Spot';
import { fnv1a32, mulberry32, pick, randomInt } from './prng';

/** One spot as a challenge sees it (built once by the replay). */
export interface ChallengeFact {
  spot: Spot;
  model?: CarModel;
  /** True when this spot collected a new sticker. */
  isNew: boolean;
  pageId: AlbumPageId;
  /** Collections the spot's model belongs to. */
  collectionIds: readonly string[];
}

/** Challenge ids are `<weekKey>:<slot>`, so a reveal can rebuild a past week's board. */
export function challengeId(weekKey: string, slot: ChallengeSlot): string {
  return `${weekKey}:${slot}`;
}

export function parseChallengeId(id: string): { weekKey: string; slot: ChallengeSlot } | undefined {
  const [weekKey, slot] = id.split(':');
  if (weekKey === undefined || slot === undefined) return undefined;
  const match = CHALLENGE_SLOTS_TABLE.find((definition) => definition.slot === slot);
  return match === undefined ? undefined : { weekKey, slot: match.slot };
}

interface ParamPools {
  category: ChallengeParams[];
  paint: ChallengeParams[];
  country: ChallengeParams[];
  rarity: ChallengeParams[];
  collection: ChallengeParams[];
}

/** Parameter pools in a fixed order, independent of the order the catalogue arrived in. */
function paramPools(models: readonly CarModel[], collections: readonly Collection[]): ParamPools {
  const categories = CAR_CATEGORIES.filter((category) => models.some((model) => model.category === category));
  const countries = [...new Set(models.map((model) => model.country))].filter((code) => code !== 'XX').sort();
  const rarities = CHALLENGE_RARITIES.filter((rarity) =>
    models.some((model) => rarityRank(model.rarity) >= rarityRank(rarity)),
  );
  const known = new Set(models.map((model) => model.id));
  const sets = [...collections]
    .filter((collection) => collection.modelIds.filter((id) => known.has(id)).length >= 2)
    .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));
  return {
    category: categories.map((category) => ({ category })),
    paint: CHALLENGE_PAINTS.map((paint) => ({ paint })),
    country: countries.map((country) => ({ country })),
    rarity: rarities.map((rarity) => ({ rarity })),
    collection: sets.map((collection) => ({ collection: collection.id })),
  };
}

function poolFor(pools: ParamPools, kind: ChallengeParamKind): ChallengeParams[] {
  switch (kind) {
    case 'category':
      return pools.category;
    case 'paint':
      return pools.paint;
    case 'country':
      return pools.country;
    case 'rarity':
      return pools.rarity;
    case 'collection':
      return pools.collection;
  }
}

function isEligible(template: ChallengeTemplate, pools: ParamPools): boolean {
  return template.param === undefined || poolFor(pools, template.param).length > 0;
}

/**
 * The three challenges of an ISO week (warm-up, main, stretch), the same for everyone with the same
 * catalogue: picks come from `mulberry32(fnv1a32(weekKey))`. A template whose parameter pool is
 * empty (e.g. `collection` before the collections loaded) is skipped.
 */
export function weeklyChallenges(
  weekKey: string,
  models: readonly CarModel[],
  collections: readonly Collection[] = [],
): WeeklyChallenge[] {
  const random = mulberry32(fnv1a32(weekKey));
  const pools = paramPools(models, collections);
  const challenges: WeeklyChallenge[] = [];
  for (const definition of CHALLENGE_SLOTS_TABLE) {
    const template = pick(
      random,
      definition.templates.filter((candidate) => isEligible(candidate, pools)),
    );
    if (template === undefined) continue;
    const params = template.param === undefined ? {} : (pick(random, poolFor(pools, template.param)) ?? {});
    challenges.push({
      id: challengeId(weekKey, definition.slot),
      weekKey,
      slot: definition.slot,
      template: template.id,
      params,
      target: randomInt(random, template.target[0], template.target[1]),
      xp: definition.xp,
    });
  }
  return challenges;
}

export function rarityRank(rarity: Rarity): number {
  return RARITIES.indexOf(rarity);
}

function makeOf(fact: ChallengeFact): string {
  return (fact.model?.make ?? fact.spot.make).trim().toLocaleLowerCase('en');
}

function countDistinct(values: readonly string[]): number {
  return new Set(values).size;
}

/** The current value of a challenge over the facts of its week (only spots spotted in that week). */
export function evaluateChallenge(challenge: WeeklyChallenge, facts: readonly ChallengeFact[]): number {
  const { params } = challenge;
  switch (challenge.template) {
    case 'spots':
      return facts.length;
    case 'notes':
      return facts.filter((fact) => (fact.spot.notes ?? '').trim().length > 0).length;
    case 'wildcard':
      return facts.filter((fact) => fact.model === undefined).length;
    case 'new_stickers':
      return facts.filter((fact) => fact.isNew).length;
    case 'category':
      return facts.filter((fact) => fact.model !== undefined && fact.model.category === params.category).length;
    case 'distinct_pages':
      return countDistinct(facts.map((fact) => fact.pageId));
    case 'paint':
      return facts.filter((fact) => fact.spot.paint === params.paint).length;
    case 'country':
      return facts.filter((fact) => fact.model !== undefined && fact.model.country === params.country).length;
    case 'rarity_min': {
      const minimum = rarityRank(params.rarity ?? 'epic');
      return facts.filter((fact) => fact.model !== undefined && rarityRank(fact.model.rarity) >= minimum).length;
    }
    case 'same_make': {
      const counts = new Map<string, number>();
      for (const fact of facts) {
        const make = makeOf(fact);
        if (make.length > 0) counts.set(make, (counts.get(make) ?? 0) + 1);
      }
      return Math.max(0, ...counts.values());
    }
    case 'collection': {
      const set = params.collection;
      if (set === undefined) return 0;
      return countDistinct(
        facts.flatMap((fact) => (fact.model !== undefined && fact.collectionIds.includes(set) ? [fact.model.id] : [])),
      );
    }
  }
}
