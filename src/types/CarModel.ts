// `as const` is a const assertion, not a type cast: it keeps the literal values
// so the union types below can be derived from one single source of truth.
export const CAR_CATEGORIES = [
  'icon',
  'sports',
  'supercar',
  'hypercar',
  'classic',
  'jdm',
  'muscle',
  'electric',
] as const;
export const RARITIES = ['common', 'rare', 'epic', 'legendary'] as const;

/** `(typeof X)[number]` turns the readonly tuples above into string unions. */
export type CarCategory = (typeof CAR_CATEGORIES)[number];
export type Rarity = (typeof RARITIES)[number];

/** A collectible "sticker slot" in the sticker book. */
export interface CarModel {
  id: string;
  stickerNumber: number;
  make: string;
  model: string;
  category: CarCategory;
  rarity: Rarity;
}
