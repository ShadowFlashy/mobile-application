import type { CarCategory, CarModel, PaintColor, Rarity } from '../../../src/types/CarModel';
import type { Collection } from '../../../src/types/Collection';
import type { Spot } from '../../../src/types/Spot';

/** Wednesday 2026-11-11 10:00 UTC (2026-W46), the "now" of most tests. */
export const NOW = new Date(Date.UTC(2026, 10, 11, 10));

/** Brussels local time: CEST (+120) from the last Sunday of March 01:00 UTC to the last Sunday of October. */
export function brusselsOffset(date: Date): number {
  const year = date.getUTCFullYear();
  const lastSunday = (month: number) => {
    const last = new Date(Date.UTC(year, month + 1, 0, 1));
    return Date.UTC(year, month, last.getUTCDate() - last.getUTCDay(), 1);
  };
  const time = date.getTime();
  return time >= lastSunday(2) && time < lastSunday(9) ? 120 : 60;
}

export function model(
  id: string,
  category: CarCategory,
  rarity: Rarity,
  stickerNumber: number,
  country = 'DE',
  make = 'Make',
): CarModel {
  return { id, stickerNumber, make, model: id, category, rarity, bodyStyle: 'coupe', country, season: 1 };
}

/** A small catalogue: 2 sports, 1 supercar, the holy trinity, 6 icons, 1 jdm. */
export const CATALOGUE: CarModel[] = [
  model('sports-a', 'sports', 'common', 7, 'DE', 'Porsche'),
  model('sports-b', 'sports', 'rare', 8, 'JP', 'Mazda'),
  model('super-a', 'supercar', 'epic', 13, 'IT', 'Ferrari'),
  model('ferrari-laferrari', 'hypercar', 'legendary', 22, 'IT', 'Ferrari'),
  model('porsche-918-spyder', 'hypercar', 'legendary', 23, 'DE', 'Porsche'),
  model('mclaren-p1', 'hypercar', 'legendary', 24, 'GB', 'McLaren'),
  model('icon-1', 'icon', 'common', 1, 'DE', 'Volkswagen'),
  model('icon-2', 'icon', 'common', 2, 'DE', 'Volkswagen'),
  model('icon-3', 'icon', 'common', 3, 'FR', 'Citroen'),
  model('icon-4', 'icon', 'common', 4, 'IT', 'Fiat'),
  model('icon-5', 'icon', 'common', 5, 'GB', 'Mini'),
  model('icon-6', 'icon', 'common', 6, 'US', 'Ford'),
  model('jdm-a', 'jdm', 'rare', 31, 'JP', 'Toyota'),
];

export const COLLECTIONS: Collection[] = [
  { id: 'jdm-legends', number: 1, modelIds: ['jdm-a', 'sports-b'] },
  { id: 'italian-exotics', number: 4, modelIds: ['super-a', 'ferrari-laferrari', 'icon-4'] },
];

let sequence = 0;

/** A spot; `createdAt` defaults to `spottedAt`, which defaults to NOW. */
export function spot(overrides: Partial<Spot> & { id?: string } = {}): Spot {
  sequence += 1;
  const spottedAt = overrides.spottedAt ?? overrides.createdAt ?? NOW.toISOString();
  return {
    id: overrides.id ?? `spot-${String(sequence).padStart(4, '0')}`,
    userId: 'user-1',
    make: 'Make',
    model: 'Model',
    photoPath: 'user-1/x.jpg',
    spottedAt,
    createdAt: overrides.createdAt ?? spottedAt,
    paint: 'other',
    bodyStyle: 'coupe',
    platesHidden: 0,
    identifiedBy: 'manual',
    shareNameWithOwner: false,
    ...overrides,
  };
}

/** A catalogue spot at an ISO time. */
export function seen(carModelId: string, at: string, paint: PaintColor = 'other', id?: string): Spot {
  return spot({ carModelId, createdAt: at, spottedAt: at, paint, ...(id === undefined ? {} : { id }) });
}

/** ISO time `hours` after a base time. */
export function plusHours(base: string, hours: number): string {
  return new Date(Date.parse(base) + hours * 3600 * 1000).toISOString();
}
