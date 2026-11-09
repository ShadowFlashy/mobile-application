import type { CarCategory, CarModel } from '../types/CarModel';
import type { Spot } from '../types/Spot';

/** One slot in the sticker book, with the user's spots of that model. */
export interface StickerSlot {
  model: CarModel;
  spots: Spot[];
  isCollected: boolean;
  /** Most recent spot, used as the sticker picture. */
  coverSpot?: Spot;
}

export interface CollectionProgress {
  collected: number;
  total: number;
  /** Between 0 and 1. */
  ratio: number;
}

/** Combines the catalogue with the user's spots into sticker slots, ordered by sticker number. */
export function buildStickerSlots(models: CarModel[], spots: Spot[]): StickerSlot[] {
  const spotsByModel = new Map<string, Spot[]>();
  for (const spot of spots) {
    if (spot.carModelId === undefined) continue;
    const list = spotsByModel.get(spot.carModelId) ?? [];
    list.push(spot);
    spotsByModel.set(spot.carModelId, list);
  }

  return [...models]
    .sort((a, b) => a.stickerNumber - b.stickerNumber)
    .map((model) => {
      const modelSpots = [...(spotsByModel.get(model.id) ?? [])].sort((a, b) => b.spottedAt.localeCompare(a.spottedAt));
      return {
        model,
        spots: modelSpots,
        isCollected: modelSpots.length > 0,
        coverSpot: modelSpots[0],
      };
    });
}

export function filterSlotsByCategory(slots: StickerSlot[], category?: CarCategory): StickerSlot[] {
  if (category === undefined) return slots;
  return slots.filter((slot) => slot.model.category === category);
}

export function computeProgress(slots: StickerSlot[]): CollectionProgress {
  const total = slots.length;
  const collected = slots.filter((slot) => slot.isCollected).length;
  return { collected, total, ratio: total === 0 ? 0 : collected / total };
}

/** Spots of cars that are not in the catalogue ("other finds"), newest first. */
export function getOtherSpots(spots: Spot[]): Spot[] {
  return spots.filter((spot) => spot.carModelId === undefined).sort((a, b) => b.spottedAt.localeCompare(a.spottedAt));
}
