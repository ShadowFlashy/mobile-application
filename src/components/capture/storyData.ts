import type { CarModel } from '../../types/CarModel';
import type { PickedPhoto } from '../../types/Spot';
import type { CarCandidate } from '../../utils/captureForm';

/** Shared sample data for the capture stories (a drawn "car" with a white plate, no real photo). */
const SVG = [
  "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>",
  "<rect width='800' height='600' fill='slategray'/>",
  "<rect x='120' y='220' width='560' height='240' rx='60' fill='steelblue'/>",
  "<circle cx='240' cy='470' r='60' fill='black'/><circle cx='560' cy='470' r='60' fill='black'/>",
  "<rect x='336' y='372' width='128' height='42' fill='white'/>",
  '</svg>',
].join('');

export const SAMPLE_PHOTO: PickedPhoto = {
  uri: `data:image/svg+xml;utf8,${encodeURIComponent(SVG)}`,
  width: 800,
  height: 600,
};

export const SAMPLE_MODELS: CarModel[] = [
  {
    id: 'porsche-911-gt3',
    stickerNumber: 7,
    make: 'Porsche',
    model: '911 GT3',
    category: 'sports',
    rarity: 'rare',
    bodyStyle: 'coupe',
    country: 'DE',
    season: 1,
  },
  {
    id: 'lamborghini-huracan',
    stickerNumber: 14,
    make: 'Lamborghini',
    model: 'Huracán',
    category: 'supercar',
    rarity: 'epic',
    bodyStyle: 'supercar',
    country: 'IT',
    season: 1,
  },
  {
    id: 'citroen-2cv',
    stickerNumber: 29,
    make: 'Citroën',
    model: '2CV',
    category: 'classic',
    rarity: 'common',
    bodyStyle: 'sedan',
    country: 'FR',
    season: 1,
  },
  {
    id: 'mazda-mx-5',
    stickerNumber: 34,
    make: 'Mazda',
    model: 'MX-5',
    category: 'jdm',
    rarity: 'common',
    bodyStyle: 'convertible',
    country: 'JP',
    season: 1,
  },
  {
    id: 'ferrari-308-gtsi',
    stickerNumber: 82,
    make: 'Ferrari',
    model: '308 GTSi',
    category: 'classic',
    rarity: 'epic',
    bodyStyle: 'coupe',
    country: 'IT',
    season: 1,
  },
];

export const SAMPLE_CANDIDATES: CarCandidate[] = [
  { key: 'text:porsche 911', make: 'Porsche', modelName: '911', confidence: 0.55 },
  { key: 'porsche-911-gt3', carModel: SAMPLE_MODELS[0], make: 'Porsche', modelName: '911 GT3', confidence: 0.3 },
  { key: 'mazda-mx-5', carModel: SAMPLE_MODELS[3], make: 'Mazda', modelName: 'MX-5', confidence: 0.1 },
];

export const SAMPLE_SUGGESTION = { x: 0.388, y: 0.6, width: 0.224, height: 0.126 };
