/**
 * A curated, cross-category set of catalogue cars (SPEC Appendix E), e.g. `jdm-legends`.
 * Title and description are translated: t(`collections.${id}.title`) / t(`collections.${id}.description`).
 */
export const COLLECTION_IDS = [
  'jdm-legends',
  'american-muscle',
  'autobahn-heroes',
  'italian-exotics',
  'british-icons',
  'hot-hatch-heroes',
  'electric-era',
  'hypercar-hall-of-fame',
] as const;
export type CollectionId = (typeof COLLECTION_IDS)[number];

export interface Collection {
  id: string;
  /** Display number of the set (1-based), also its default order. */
  number: number;
  /** Catalogue ids of the member cars (8–12), sorted by sticker number when the catalogue is known. */
  modelIds: string[];
}
