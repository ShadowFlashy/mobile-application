import type { PaintColor, Rarity } from '../types/CarModel';
import type { ChallengeSlot, ChallengeTemplateId } from '../types/Progress';
import { XP } from './xp';

/** Which parameter a template needs (picked by the seeded PRNG from the pool of that kind). */
export type ChallengeParamKind = 'category' | 'paint' | 'country' | 'rarity' | 'collection';

export interface ChallengeTemplate {
  id: ChallengeTemplateId;
  /** Inclusive target range; the PRNG picks one value. */
  target: readonly [number, number];
  param?: ChallengeParamKind;
}

export interface ChallengeSlotDefinition {
  slot: ChallengeSlot;
  xp: number;
  templates: readonly ChallengeTemplate[];
}

/** Paints a `paint` challenge can ask for (SPEC §4.4). */
export const CHALLENGE_PAINTS: readonly PaintColor[] = ['red', 'blue', 'yellow', 'green', 'orange', 'white', 'black'];

/** Minimum rarities a `rarity_min` challenge can ask for. */
export const CHALLENGE_RARITIES: readonly Rarity[] = ['epic'];

/**
 * Three weekly challenges, one per slot, in this order (SPEC §4.4; Appendix E adds `collection`,
 * "2 cars from {set}", to the main slot). Descriptions: t(`challenges.${template}`, params).
 */
export const CHALLENGE_SLOTS_TABLE: readonly ChallengeSlotDefinition[] = [
  {
    slot: 'warmup',
    xp: XP.challenge.warmup,
    templates: [
      { id: 'spots', target: [3, 5] },
      { id: 'notes', target: [2, 2] },
      { id: 'wildcard', target: [1, 1] },
    ],
  },
  {
    slot: 'main',
    xp: XP.challenge.main,
    templates: [
      { id: 'new_stickers', target: [1, 2] },
      { id: 'category', target: [1, 2], param: 'category' },
      { id: 'distinct_pages', target: [3, 3] },
      { id: 'paint', target: [1, 1], param: 'paint' },
      { id: 'country', target: [1, 1], param: 'country' },
      { id: 'collection', target: [2, 2], param: 'collection' },
    ],
  },
  {
    slot: 'stretch',
    xp: XP.challenge.stretch,
    templates: [
      { id: 'rarity_min', target: [1, 1], param: 'rarity' },
      { id: 'new_stickers', target: [3, 3] },
      { id: 'same_make', target: [2, 2] },
      { id: 'spots', target: [10, 10] },
    ],
  },
];
