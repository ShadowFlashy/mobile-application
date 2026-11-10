// `as const` is a const assertion (not a cast): the unions below derive from one source of truth.
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
/** Must equal BODY_STYLES in supabase/functions/identify-car/identification.ts (unit-tested). */
export const BODY_STYLES = [
  'hatchback',
  'sedan',
  'wagon',
  'coupe',
  'convertible',
  'suv',
  'pickup',
  'van',
  'supercar',
  'other',
] as const;
/** Must equal CAR_COLORS in supabase/functions/identify-car/identification.ts (unit-tested). */
export const PAINT_COLORS = [
  'black',
  'white',
  'silver',
  'grey',
  'red',
  'blue',
  'green',
  'yellow',
  'orange',
  'brown',
  'beige',
  'purple',
  'gold',
  'other',
] as const;
export type CarCategory = (typeof CAR_CATEGORIES)[number];
export type Rarity = (typeof RARITIES)[number];
export type BodyStyle = (typeof BODY_STYLES)[number];
export type PaintColor = (typeof PAINT_COLORS)[number];

export interface CarModel {
  id: string;
  stickerNumber: number;
  make: string;
  model: string;
  category: CarCategory;
  rarity: Rarity;
  bodyStyle: BodyStyle;
  /** ISO 3166-1 alpha-2 of the make's origin; 'XX' = unknown. */
  country: string;
  season: number;
  /** First production year of the model (generation); undefined when unknown. Appendix E. */
  yearFrom?: number;
  /** Last production year; undefined while still in production or unknown. Appendix E. */
  yearTo?: number;
}
