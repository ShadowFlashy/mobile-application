import {
  BODY_STYLES,
  CAR_CATEGORIES,
  PAINT_COLORS,
  RARITIES,
  type BodyStyle,
  type CarCategory,
  type PaintColor,
  type Rarity,
} from '../types/CarModel';
import {
  OWNER_VISIBILITIES,
  VERIFICATION_RESULTS,
  type OwnerVisibility,
  type VerificationResult,
} from '../types/OwnerCar';
import { ALBUM_PAGE_IDS, type AlbumPageId } from '../types/Progress';
import { IDENTIFIED_BY, type IdentifiedBy } from '../types/Spot';

/**
 * Runtime narrowing without unsafe casts: database strings and parsed JSON are checked against the
 * one source of truth (the `as const` tuples in src/types) before the app trusts them.
 */
function isOneOf<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && values.some((item) => item === value);
}

/** Narrows a database string to a known category without an unsafe cast. */
export function isCarCategory(value: unknown): value is CarCategory {
  return isOneOf(CAR_CATEGORIES, value);
}

/** Narrows a database string to a known rarity without an unsafe cast. */
export function isRarity(value: unknown): value is Rarity {
  return isOneOf(RARITIES, value);
}

export function isBodyStyle(value: unknown): value is BodyStyle {
  return isOneOf(BODY_STYLES, value);
}

export function isPaintColor(value: unknown): value is PaintColor {
  return isOneOf(PAINT_COLORS, value);
}

export function isIdentifiedBy(value: unknown): value is IdentifiedBy {
  return isOneOf(IDENTIFIED_BY, value);
}

export function isOwnerVisibility(value: unknown): value is OwnerVisibility {
  return isOneOf(OWNER_VISIBILITIES, value);
}

export function isVerificationResult(value: unknown): value is VerificationResult {
  return isOneOf(VERIFICATION_RESULTS, value);
}

export function isAlbumPageId(value: unknown): value is AlbumPageId {
  return isOneOf(ALBUM_PAGE_IDS, value);
}

/** ISO 3166-1 alpha-2 shape (two capital letters), as the database check enforces. */
export function isCountryCode(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Z]{2}$/.test(value);
}

/** A plain object (not null, not an array), e.g. a parsed JSON body. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
