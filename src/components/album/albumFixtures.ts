import type { CarModel } from '../../types/CarModel';
import type { Collection } from '../../types/Collection';
import type { ChallengeProgress, WeeklyChallenge } from '../../types/Progress';
import type { Spot } from '../../types/Spot';
import { levelForXp } from '../../utils/progression';

/**
 * Sample data for the album stories and component tests (never imported by the app).
 * The stand-in photo is an inline SVG drawn with opacity only, so it needs no network.
 */
export const SAMPLE_PHOTO_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">',
    '<rect width="160" height="120" fill-opacity="0.12"/>',
    '<path d="M14 84 L26 66 Q32 58 46 56 L62 44 Q70 38 84 38 L104 38 Q118 38 126 50 L134 60 Q148 62 150 74 L150 84 Z" fill-opacity="0.55"/>',
    '<circle cx="46" cy="86" r="12" fill-opacity="0.85"/>',
    '<circle cx="120" cy="86" r="12" fill-opacity="0.85"/>',
    '</svg>',
  ].join(''),
)}`;

function model(input: Omit<CarModel, 'season'>): CarModel {
  return { season: 1, ...input };
}

export const golf = model({
  id: 'volkswagen-golf-gti',
  stickerNumber: 1,
  make: 'Volkswagen',
  model: 'Golf GTI',
  category: 'icon',
  rarity: 'common',
  bodyStyle: 'hatchback',
  country: 'DE',
});
export const porsche = model({
  id: 'porsche-911-gt3',
  stickerNumber: 7,
  make: 'Porsche',
  model: '911 GT3',
  category: 'sports',
  rarity: 'rare',
  bodyStyle: 'coupe',
  country: 'DE',
});
export const mx5 = model({
  id: 'mazda-mx-5',
  stickerNumber: 8,
  make: 'Mazda',
  model: 'MX-5',
  category: 'sports',
  rarity: 'common',
  bodyStyle: 'convertible',
  country: 'JP',
});
export const ferrari296 = model({
  id: 'ferrari-296-gtb',
  stickerNumber: 13,
  make: 'Ferrari',
  model: '296 GTB',
  category: 'supercar',
  rarity: 'epic',
  bodyStyle: 'supercar',
  country: 'IT',
});
export const ferrari308 = model({
  id: 'ferrari-308-gtsi',
  stickerNumber: 60,
  make: 'Ferrari',
  model: '308 GTSi',
  category: 'classic',
  rarity: 'epic',
  bodyStyle: 'coupe',
  country: 'IT',
  yearFrom: 1980,
  yearTo: 1982,
});
export const chiron = model({
  id: 'bugatti-chiron',
  stickerNumber: 19,
  make: 'Bugatti',
  model: 'Chiron',
  category: 'hypercar',
  rarity: 'legendary',
  bodyStyle: 'supercar',
  country: 'FR',
});

/** One model per rarity, plus extra sports cars and the Ferrari 308 GTSi (Appendix E). */
export const SAMPLE_MODELS: CarModel[] = [golf, porsche, mx5, ferrari296, chiron, ferrari308];

export function sampleSpot(overrides: Partial<Spot> & { id: string }): Spot {
  return {
    userId: 'user-1',
    make: 'Porsche',
    model: '911 GT3',
    photoPath: `user-1/${overrides.id}.jpg`,
    photoUrl: SAMPLE_PHOTO_URL,
    spottedAt: '2026-11-09T14:12:00.000Z',
    createdAt: '2026-11-09T14:13:00.000Z',
    paint: 'blue',
    bodyStyle: 'coupe',
    platesHidden: 1,
    identifiedBy: 'ai',
    aiConfidence: 0.94,
    shareNameWithOwner: false,
    ...overrides,
  };
}

export const SAMPLE_SPOTS: Spot[] = [
  sampleSpot({ id: 'spot-porsche-1', carModelId: porsche.id, createdAt: '2026-11-03T10:00:00.000Z' }),
  sampleSpot({ id: 'spot-porsche-2', carModelId: porsche.id, createdAt: '2026-11-08T10:00:00.000Z', city: 'Leuven' }),
  sampleSpot({ id: 'spot-porsche-3', carModelId: porsche.id, createdAt: '2026-11-09T10:00:00.000Z' }),
  sampleSpot({
    id: 'spot-mx5',
    carModelId: mx5.id,
    make: 'Mazda',
    model: 'MX-5',
    bodyStyle: 'convertible',
    createdAt: '2026-11-05T10:00:00.000Z',
  }),
  sampleSpot({
    id: 'spot-308',
    carModelId: ferrari308.id,
    make: 'Ferrari',
    model: '308 GTSi',
    paint: 'red',
    createdAt: '2026-11-06T10:00:00.000Z',
  }),
  sampleSpot({
    id: 'spot-wildcard',
    make: 'Fiat',
    model: 'Multipla',
    bodyStyle: 'van',
    identifiedBy: 'manual',
    aiConfidence: undefined,
    createdAt: '2026-11-07T10:00:00.000Z',
  }),
];

export const SAMPLE_COLLECTIONS: Collection[] = [
  { id: 'italian-exotics', number: 4, modelIds: [ferrari308.id, ferrari296.id] },
  { id: 'jdm-legends', number: 1, modelIds: [mx5.id] },
  { id: 'autobahn-heroes', number: 3, modelIds: [porsche.id, golf.id] },
];

/** The mockup's level: 3,015 XP is level 8, 585 XP to level 9. */
export const SAMPLE_LEVEL = levelForXp(3015);

/** End of the sample challenge week (2026-W46, Monday 16 November 00:00 in Brussels). */
export const SAMPLE_WEEK_ENDS_AT = '2026-11-15T23:00:00.000Z';

function challenge(
  slot: WeeklyChallenge['slot'],
  template: WeeklyChallenge['template'],
  params: WeeklyChallenge['params'],
  target: number,
  xp: number,
): WeeklyChallenge {
  return { id: `2026-W46:${slot}`, weekKey: '2026-W46', slot, template, params, target, xp };
}

/** The mockup's week: 2/3 spots, 0/1 orange car, and the Epic stretch done. */
export const SAMPLE_CHALLENGES: ChallengeProgress[] = [
  { challenge: challenge('warmup', 'spots', {}, 3, 75), value: 2, isComplete: false },
  { challenge: challenge('main', 'paint', { paint: 'orange' }, 1, 125), value: 0, isComplete: false },
  {
    challenge: challenge('stretch', 'rarity_min', { rarity: 'epic' }, 1, 250),
    value: 1,
    isComplete: true,
    completedAt: '2026-11-09T12:00:00.000Z',
  },
];
