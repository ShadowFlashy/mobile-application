import type { CarModel } from '../../src/types/CarModel';
import type { Spot } from '../../src/types/Spot';
import { buildStickerSlots, computeProgress, filterSlotsByCategory, getOtherSpots } from '../../src/utils/collection';

const models: CarModel[] = [
  { id: 'porsche-911-gt3', stickerNumber: 7, make: 'Porsche', model: '911 GT3', category: 'sports', rarity: 'rare' },
  {
    id: 'volkswagen-golf-gti',
    stickerNumber: 1,
    make: 'Volkswagen',
    model: 'Golf GTI',
    category: 'icon',
    rarity: 'common',
  },
  {
    id: 'bugatti-chiron',
    stickerNumber: 19,
    make: 'Bugatti',
    model: 'Chiron',
    category: 'hypercar',
    rarity: 'legendary',
  },
];

function spot(id: string, spottedAt: string, carModelId?: string): Spot {
  return { id, userId: 'user-1', carModelId, make: 'Make', model: 'Model', photoPath: `user-1/${id}.jpg`, spottedAt };
}

const spots: Spot[] = [
  spot('a', '2026-11-01T10:00:00Z', 'porsche-911-gt3'),
  spot('b', '2026-11-05T10:00:00Z', 'porsche-911-gt3'),
  spot('c', '2026-11-03T10:00:00Z'),
];

describe('sticker book logic', () => {
  it('orders the slots by sticker number', () => {
    const slots = buildStickerSlots(models, spots);
    expect(slots.map((slot) => slot.model.stickerNumber)).to.deep.equal([1, 7, 19]);
  });

  it('marks a model as collected when it was spotted', () => {
    const porsche = buildStickerSlots(models, spots).find((slot) => slot.model.id === 'porsche-911-gt3');
    expect(porsche?.isCollected).to.equal(true);
  });

  it('keeps unspotted models locked', () => {
    const bugatti = buildStickerSlots(models, spots).find((slot) => slot.model.id === 'bugatti-chiron');
    expect(bugatti?.isCollected).to.equal(false);
  });

  it('uses the most recent spot as sticker picture', () => {
    const porsche = buildStickerSlots(models, spots).find((slot) => slot.model.id === 'porsche-911-gt3');
    expect(porsche?.coverSpot?.id).to.equal('b');
  });

  it('counts collected stickers, not spots', () => {
    expect(computeProgress(buildStickerSlots(models, spots))).to.deep.equal({ collected: 1, total: 3, ratio: 1 / 3 });
  });

  it('reports zero progress for an empty catalogue', () => {
    expect(computeProgress([]).ratio).to.equal(0);
  });

  it('filters the slots on a category', () => {
    const icons = filterSlotsByCategory(buildStickerSlots(models, spots), 'icon');
    expect(icons.map((slot) => slot.model.id)).to.deep.equal(['volkswagen-golf-gti']);
  });

  it('shows every slot when no category is selected', () => {
    expect(filterSlotsByCategory(buildStickerSlots(models, spots), undefined)).to.have.length(3);
  });

  it('lists spots outside the catalogue as other finds', () => {
    expect(getOtherSpots(spots).map((item) => item.id)).to.deep.equal(['c']);
  });
});
