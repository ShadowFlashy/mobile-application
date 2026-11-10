import type { CarModel } from '../../../src/types/CarModel';
import type { IdentifiedCar, IdentifyOutcome } from '../../../src/types/Identification';
import { createDraft } from '../../../src/utils/captureMachine';

/** A small catalogue for the capture unit tests. */
export const GT3: CarModel = {
  id: 'porsche-911-gt3',
  stickerNumber: 7,
  make: 'Porsche',
  model: '911 GT3',
  category: 'sports',
  rarity: 'rare',
  bodyStyle: 'coupe',
  country: 'DE',
  season: 1,
};

export const TURBO_930: CarModel = {
  id: 'porsche-911-turbo-930',
  stickerNumber: 71,
  make: 'Porsche',
  model: '911 Turbo (930)',
  category: 'classic',
  rarity: 'epic',
  bodyStyle: 'coupe',
  country: 'DE',
  season: 1,
};

export const MX5: CarModel = {
  id: 'mazda-mx-5',
  stickerNumber: 34,
  make: 'Mazda',
  model: 'MX-5',
  category: 'jdm',
  rarity: 'common',
  bodyStyle: 'convertible',
  country: 'JP',
  season: 1,
};

export const CHIRON: CarModel = {
  id: 'bugatti-chiron',
  stickerNumber: 19,
  make: 'Bugatti',
  model: 'Chiron',
  category: 'hypercar',
  rarity: 'legendary',
  bodyStyle: 'supercar',
  country: 'FR',
  season: 1,
};

export const MODELS: CarModel[] = [GT3, TURBO_930, MX5, CHIRON];

export const SURE_CAR: IdentifiedCar = {
  make: 'Porsche',
  model: '911 GT3',
  generation: '992',
  yearFrom: 2021,
  bodyStyle: 'coupe',
  paint: 'blue',
  confidence: 0.94,
  catalogueId: 'porsche-911-gt3',
  alternatives: [{ make: 'Porsche', model: '911 GT3 RS', confidence: 0.04 }],
  plates: [{ x: 0.42, y: 0.62, width: 0.16, height: 0.07 }],
  plateText: '1ABC234',
  funFact: 'Revs to 9,000 rpm.',
};

export const LIKELY_CAR: IdentifiedCar = { ...SURE_CAR, confidence: 0.7 };

export const GUESS_CAR: IdentifiedCar = {
  make: 'Porsche',
  model: '911',
  bodyStyle: 'coupe',
  paint: 'silver',
  confidence: 0.55,
  alternatives: [
    { make: 'Porsche', model: '911 GT3', confidence: 0.3 },
    { make: 'Mazda', model: 'MX-5', confidence: 0.1 },
  ],
  plates: [{ x: 0.4, y: 0.66, width: 0.15, height: 0.06 }],
  plateText: '',
};

export function identified(car: IdentifiedCar): IdentifyOutcome {
  return { status: 'identified', car, remainingToday: 12, provider: 'cloudflare' };
}

export const NOW = '2026-11-10T12:00:00.000Z';

export function newDraft(source: 'camera' | 'library' = 'camera') {
  return createDraft({
    id: 'draft-1',
    photo: { uri: 'data:image/jpeg;base64,AAAA', width: 800, height: 600 },
    source,
    now: NOW,
    shareNameDefault: false,
  });
}
