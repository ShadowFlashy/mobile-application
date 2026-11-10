import { ALBUM_PAGES } from '../constants/albumPages';
import { XP } from '../constants/xp';
import type { AlbumCoverData, AlbumPageData, AlbumSlotData } from '../types/Album';
import type { CarModel, Rarity } from '../types/CarModel';
import { COLLECTION_IDS, type Collection, type CollectionId } from '../types/Collection';
import type { AlbumPageId, PageProgress, StampKind } from '../types/Progress';
import type { Spot } from '../types/Spot';

/**
 * Album engine (W5). Pure functions only, so everything here is unit-tested
 * (cypress/unit/album/album.cy.ts).
 *
 * Pages are data-driven and variable-size (D-18): a category page holds every model of its
 * category in sticker-number order, the Wildcards page holds every off-catalogue spot, and a
 * themed collection (Appendix E) holds its 8–12 member cars, also in sticker-number order.
 */

/** How many of the newest catches the album cover shows. */
export const COVER_LATEST_COUNT = 6;

/** A themed collection page (Appendix E): the same slots as an album page, keyed by its set id. */
export interface CollectionPageData {
  collectionId: CollectionId;
  /** Display number of the set (1-based). */
  number: number;
  slots: AlbumSlotData[];
  collected: number;
  total: number;
  isComplete: boolean;
}

/** Any page the AlbumPage component can render. */
export type AnyAlbumPage = AlbumPageData | CollectionPageData;

/** Narrows a page to a themed collection page. */
export function isCollectionPage(page: AnyAlbumPage): page is CollectionPageData {
  return 'collectionId' in page;
}

/** True for the 8 known set ids; unknown ids from a newer database are skipped (no translation yet). */
export function isCollectionId(value: unknown): value is CollectionId {
  return typeof value === 'string' && COLLECTION_IDS.some((id) => id === value);
}

/** Oldest first by `createdAt`; ties are broken by id, so the order never depends on the input order. */
export function compareByCreatedAt(a: Spot, b: Spot): number {
  const byTime = a.createdAt.localeCompare(b.createdAt);
  return byTime !== 0 ? byTime : a.id.localeCompare(b.id);
}

/**
 * The album photo of a sticker: its FIRST collected spot (the one that was revealed), by
 * `createdAt`. Later duplicates never replace it.
 */
export function coverSpotOf(slot: { spots: readonly Spot[] }): Spot | undefined {
  let first: Spot | undefined;
  for (const spot of slot.spots) {
    if (first === undefined || compareByCreatedAt(spot, first) < 0) first = spot;
  }
  return first;
}

/**
 * A wildcard is a spot without a catalogue model. A spot whose model is no longer in the
 * catalogue also counts, but only once the catalogue is known (an empty catalogue = still loading).
 */
export function isWildcardSpot(spot: Spot, catalogueIds: ReadonlySet<string>): boolean {
  if (spot.carModelId === undefined) return true;
  return catalogueIds.size > 0 && !catalogueIds.has(spot.carModelId);
}

/** Groups spots by catalogue model, each group oldest first. */
function groupSpotsByModel(spots: readonly Spot[]): Map<string, Spot[]> {
  const byModel = new Map<string, Spot[]>();
  for (const spot of spots) {
    if (spot.carModelId === undefined) continue;
    const list = byModel.get(spot.carModelId);
    if (list === undefined) byModel.set(spot.carModelId, [spot]);
    else list.push(spot);
  }
  for (const list of byModel.values()) list.sort(compareByCreatedAt);
  return byModel;
}

function slotFor(model: CarModel, spotsByModel: Map<string, Spot[]>): AlbumSlotData {
  const spots = spotsByModel.get(model.id) ?? [];
  return { model, spots, isCollected: spots.length > 0, cover: coverSpotOf({ spots }) };
}

function bySticker(a: CarModel, b: CarModel): number {
  return a.stickerNumber - b.stickerNumber;
}

function countCollected(slots: readonly AlbumSlotData[]): number {
  return slots.filter((slot) => slot.isCollected).length;
}

/**
 * The 9 album pages in print order (§4.4): one per category, then Wildcards (newest first).
 * Every page holds every model of its category, however many there are (D-18).
 */
export function buildAlbumPages(models: CarModel[], spots: Spot[]): AlbumPageData[] {
  const spotsByModel = groupSpotsByModel(spots);
  const sorted = [...models].sort(bySticker);
  const catalogueIds = new Set(models.map((model) => model.id));
  const wildcards = spots.filter((spot) => isWildcardSpot(spot, catalogueIds)).sort((a, b) => compareByCreatedAt(b, a));

  return ALBUM_PAGES.map((page): AlbumPageData => {
    const slots =
      page.category === undefined
        ? []
        : sorted.filter((model) => model.category === page.category).map((model) => slotFor(model, spotsByModel));
    const collected = countCollected(slots);
    return {
      id: page.id,
      number: page.number,
      slots,
      wildcards: page.category === undefined ? wildcards : [],
      collected,
      total: slots.length,
      isComplete: slots.length > 0 && collected === slots.length,
    };
  });
}

/**
 * The themed collections as album pages, in set order. Member ids that are not in the catalogue
 * are dropped, members are sorted by sticker number, and set ids without a translation are skipped.
 */
export function buildCollectionPages(
  collections: readonly Collection[],
  models: CarModel[],
  spots: Spot[],
): CollectionPageData[] {
  const spotsByModel = groupSpotsByModel(spots);
  const modelsById = new Map(models.map((model) => [model.id, model]));
  const pages: CollectionPageData[] = [];
  for (const collection of [...collections].sort((a, b) => a.number - b.number)) {
    const collectionId = collection.id;
    if (!isCollectionId(collectionId)) continue;
    const members: CarModel[] = [];
    for (const modelId of new Set(collection.modelIds)) {
      const model = modelsById.get(modelId);
      if (model !== undefined) members.push(model);
    }
    const slots = members.sort(bySticker).map((model) => slotFor(model, spotsByModel));
    const collected = countCollected(slots);
    pages.push({
      collectionId,
      number: collection.number,
      slots,
      collected,
      total: slots.length,
      isComplete: slots.length > 0 && collected === slots.length,
    });
  }
  return pages;
}

/** The sets a catalogue model belongs to (a car can be in several), in set order. */
export function collectionsOfModel(pages: readonly CollectionPageData[], modelId: string): CollectionPageData[] {
  return pages.filter((page) => page.slots.some((slot) => slot.model.id === modelId));
}

/**
 * Progress of one category page, as the progression engine reports it. `completedAt` is the
 * `createdAt` of the spot that filled the last empty slot.
 */
export function pageProgress(page: AlbumPageData): PageProgress {
  const progress: PageProgress = {
    pageId: page.id,
    collected: page.collected,
    total: page.total,
    isComplete: page.isComplete,
  };
  if (!page.isComplete) return progress;
  let completedAt: string | undefined;
  for (const slot of page.slots) {
    const at = slot.cover?.createdAt;
    if (at !== undefined && (completedAt === undefined || at > completedAt)) completedAt = at;
  }
  return completedAt !== undefined ? { ...progress, completedAt } : progress;
}

/** The stamp on a page or set card: FULL PAGE when complete, ONE TO GO with one slot left. */
export function pageStamp(page: {
  collected: number;
  total: number;
}): Extract<StampKind, 'full_page' | 'one_to_go'> | undefined {
  if (page.total === 0) return undefined;
  if (page.collected >= page.total) return 'full_page';
  if (page.total - page.collected === 1) return 'one_to_go';
  return undefined;
}

/** Album cover numbers: collected / total over the category pages, and the newest catches. */
export function buildAlbumCover(
  pages: readonly AlbumPageData[],
  spots: readonly Spot[],
  latestCount: number = COVER_LATEST_COUNT,
): AlbumCoverData {
  const collected = pages.reduce((sum, page) => sum + page.collected, 0);
  const total = pages.reduce((sum, page) => sum + page.total, 0);
  const latest = [...spots].sort((a, b) => compareByCreatedAt(b, a)).slice(0, Math.max(0, latestCount));
  return { collected, total, ratio: total === 0 ? 0 : collected / total, latest };
}

/** The album page a catalogue model is printed on (its category). */
export function pageIdOfModel(model: CarModel): AlbumPageId {
  return model.category;
}

/** XP a new sticker of this rarity is worth ("Worth +80 XP"), from the §4.4 table in constants/xp. */
export function stickerXp(rarity: Rarity): number {
  return XP.newSticker[rarity];
}

/** Deterministic hand-stuck tilt in degrees, within [-2.5, 2.5], derived from a seed (e.g. the id). */
export function slotTilt(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return Math.round(((hash % 1001) / 1000) * 50 - 25) / 10;
}

/** Gutter between slots as a share of the page width. */
export const SLOT_GUTTER_RATIO = 0.04;

/** Position of a slot in the page grid (default 2 columns, 3:4 slots, a gutter of 4 % of the width). */
export function slotRect(
  index: number,
  pageWidth: number,
  columns: number = 2,
): { x: number; y: number; width: number; height: number } {
  const safeColumns = Math.max(1, Math.floor(columns));
  const width = Math.max(0, pageWidth);
  const gutter = width * SLOT_GUTTER_RATIO;
  const slotWidth = (width - gutter * (safeColumns - 1)) / safeColumns;
  const height = (slotWidth * 4) / 3;
  const column = index % safeColumns;
  const row = Math.floor(index / safeColumns);
  return { x: column * (slotWidth + gutter), y: row * (height + gutter), width: slotWidth, height };
}

/** Sweep of the tacho dial in degrees (from 135° to 405°, clockwise on screen). */
export const TACHO_START_DEG = 135;
export const TACHO_SWEEP_DEG = 270;
/** The red zone covers the last 15 % of the dial. */
export const TACHO_RED_ZONE = 0.15;

/** A point on a circle; 0° is to the right and angles grow clockwise on screen (y points down). */
export function polarPoint(cx: number, cy: number, radius: number, degrees: number): { x: number; y: number } {
  const radians = (degrees * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * An SVG arc path along the tacho dial between two ratios (0–1) of its sweep. Returns an empty
 * string for an empty range, so nothing is drawn at 0 %.
 */
export function gaugeArcPath(cx: number, cy: number, radius: number, fromRatio: number, toRatio: number): string {
  const from = Math.min(1, Math.max(0, fromRatio));
  const to = Math.min(1, Math.max(0, toRatio));
  if (to - from <= 0) return '';
  const startDeg = TACHO_START_DEG + TACHO_SWEEP_DEG * from;
  const endDeg = TACHO_START_DEG + TACHO_SWEEP_DEG * to;
  const start = polarPoint(cx, cy, radius, startDeg);
  const end = polarPoint(cx, cy, radius, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${round2(start.x)} ${round2(start.y)} A ${radius} ${radius} 0 ${largeArc} 1 ${round2(end.x)} ${round2(end.y)}`;
}

/** The needle angle in degrees for a completion ratio. */
export function needleAngle(ratio: number): number {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(ratio) ? ratio : 0));
  return TACHO_START_DEG + TACHO_SWEEP_DEG * clamped;
}
