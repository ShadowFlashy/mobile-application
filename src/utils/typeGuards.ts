import { CAR_CATEGORIES, RARITIES, type CarCategory, type Rarity } from '../types/CarModel';

/** Narrows a database string to a known category without an unsafe cast. */
export function isCarCategory(value: string): value is CarCategory {
  return CAR_CATEGORIES.some((category) => category === value);
}

/** Narrows a database string to a known rarity without an unsafe cast. */
export function isRarity(value: string): value is Rarity {
  return RARITIES.some((rarity) => rarity === value);
}
