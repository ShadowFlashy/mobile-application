import type { Rarity } from '../types/CarModel';
import type { ThemeColors } from './colors';

/**
 * Rarity in direction A: one device, a small monochrome roundel with the tier letter, read like an
 * F1 tyre compound (A-NOTES "Rarity roundel"):
 * - C (Common): a text-2 ring with a text-2 letter.
 * - R (Rare): a text-colour ring with a text-colour letter.
 * - E (Epic): a solid text-colour disc with a bg-colour letter.
 * - L (Legendary): the Epic disc plus an outer text-colour ring.
 * The letter and the spoken tier word are i18n (`rarity.letter_*`, `rarity.*`).
 */
export interface RoundelStyle {
  /** Token of the ring (border), or undefined for none. */
  ring?: keyof ThemeColors;
  /** Token of the disc fill, or undefined for none. */
  fill?: keyof ThemeColors;
  /** Token of the letter. */
  ink: keyof ThemeColors;
  /** Legendary: an extra ring around the disc. */
  outerRing: boolean;
}

export const roundels: Record<Rarity, RoundelStyle> = {
  common: { ring: 'text2', ink: 'text2', outerRing: false },
  rare: { ring: 'text', ink: 'text', outerRing: false },
  epic: { fill: 'inverse', ink: 'onInverse', outerRing: false },
  legendary: { fill: 'inverse', ink: 'onInverse', outerRing: true },
};

/** Roundel diameter in dp (A: 18) and the outer ring's extra size for Legendary. */
export const ROUNDEL_SIZE = 18;
export const ROUNDEL_OUTER = 24;

/** Tier order, lowest first. */
export const RARITY_ORDER: readonly Rarity[] = ['common', 'rare', 'epic', 'legendary'];
