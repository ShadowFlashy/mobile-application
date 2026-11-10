import { ALBUM_PAGES } from '../../../src/constants/albumPages';
import type { CarModel } from '../../../src/types/CarModel';
import type { Collection } from '../../../src/types/Collection';
import type { Spot } from '../../../src/types/Spot';
import {
  buildAlbumCover,
  buildAlbumPages,
  buildCollectionPages,
  collectionsOfModel,
  compareByCreatedAt,
  coverSpotOf,
  isCollectionId,
  isCollectionPage,
  isWildcardSpot,
  needleAngle,
  pageIdOfModel,
  pageProgress,
  stickerXp,
} from '../../../src/utils/album';

function model(
  id: string,
  stickerNumber: number,
  category: CarModel['category'],
  rarity: CarModel['rarity'] = 'common',
): CarModel {
  return {
    id,
    stickerNumber,
    make: 'Make',
    model: id,
    category,
    rarity,
    bodyStyle: 'coupe',
    country: 'DE',
    season: 1,
  };
}

function spot(id: string, createdAt: string, carModelId?: string): Spot {
  return {
    id,
    userId: 'user-1',
    carModelId,
    make: 'Make',
    model: 'Model',
    photoPath: `user-1/${id}.jpg`,
    spottedAt: createdAt,
    createdAt,
    paint: 'other',
    bodyStyle: 'other',
    platesHidden: 0,
    identifiedBy: 'manual',
    shareNameWithOwner: false,
  };
}

// Six supercars on one page (Season 1 shape), plus a sports car and an 8-car category page (D-18).
const supercars = [13, 14, 15, 16, 17, 18].map((n) => model(`super-${n}`, n, 'supercar', n === 13 ? 'epic' : 'rare'));
const classics = Array.from({ length: 8 }, (_, index) => model(`classic-${index}`, 60 + index, 'classic'));
const porsche = model('porsche-911-gt3', 7, 'sports', 'rare');
const models: CarModel[] = [...classics, porsche, ...supercars].reverse();

const spots: Spot[] = [
  spot('p-late', '2026-11-05T10:00:00.000Z', 'porsche-911-gt3'),
  spot('p-first', '2026-11-01T10:00:00.000Z', 'porsche-911-gt3'),
  spot('s13', '2026-11-02T10:00:00.000Z', 'super-13'),
  spot('wild-old', '2026-11-03T10:00:00.000Z'),
  spot('wild-new', '2026-11-04T10:00:00.000Z'),
];

describe('buildAlbumPages', () => {
  const pages = buildAlbumPages(models, spots);

  it('returns the 9 pages in print order', () => {
    expect(pages.map((page) => page.id)).to.deep.equal(ALBUM_PAGES.map((page) => page.id));
    expect(pages.map((page) => page.number)).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('puts every model on its category page in sticker-number order', () => {
    const supercar = pages.find((page) => page.id === 'supercar');
    expect(supercar?.slots.map((slot) => slot.model.stickerNumber)).to.deep.equal([13, 14, 15, 16, 17, 18]);
  });

  it('supports pages with more than 6 slots (variable size, D-18)', () => {
    const classic = pages.find((page) => page.id === 'classic');
    expect(classic?.total).to.equal(8);
    expect(classic?.slots.map((slot) => slot.model.stickerNumber)).to.deep.equal([60, 61, 62, 63, 64, 65, 66, 67]);
  });

  it('counts collected stickers, not spots', () => {
    const sports = pages.find((page) => page.id === 'sports');
    expect(sports?.collected).to.equal(1);
    expect(sports?.total).to.equal(1);
    expect(sports?.isComplete).to.equal(true);
    expect(sports?.slots[0]?.spots).to.have.length(2);
  });

  it('uses the first spot by createdAt as the cover', () => {
    const sports = pages.find((page) => page.id === 'sports');
    expect(sports?.slots[0]?.cover?.id).to.equal('p-first');
  });

  it('never completes an empty page', () => {
    const icon = pages.find((page) => page.id === 'icon');
    expect(icon?.total).to.equal(0);
    expect(icon?.isComplete).to.equal(false);
  });

  it('lists every off-catalogue spot on the Wildcards page only, newest first', () => {
    const wildcards = pages.find((page) => page.id === 'wildcards');
    expect(wildcards?.wildcards.map((item) => item.id)).to.deep.equal(['wild-new', 'wild-old']);
    expect(wildcards?.slots).to.have.length(0);
    expect(pages.filter((page) => page.wildcards.length > 0)).to.have.length(1);
  });

  it('files a spot whose model left the catalogue as a wildcard', () => {
    const orphan = spot('orphan', '2026-11-06T10:00:00.000Z', 'deleted-model');
    const wildcards = buildAlbumPages(models, [...spots, orphan]).find((page) => page.id === 'wildcards');
    expect(wildcards?.wildcards.map((item) => item.id)).to.include('orphan');
  });
});

describe('coverSpotOf and compareByCreatedAt', () => {
  it('picks the oldest spot', () => {
    expect(coverSpotOf({ spots })?.id).to.equal('p-first');
  });

  it('breaks createdAt ties by id, whatever the input order', () => {
    const a = spot('a', '2026-11-01T10:00:00.000Z');
    const b = spot('b', '2026-11-01T10:00:00.000Z');
    expect(coverSpotOf({ spots: [b, a] })?.id).to.equal('a');
    expect([b, a].sort(compareByCreatedAt).map((item) => item.id)).to.deep.equal(['a', 'b']);
  });

  it('returns undefined without spots', () => {
    expect(coverSpotOf({ spots: [] })).to.equal(undefined);
  });
});

describe('isWildcardSpot', () => {
  it('is true without a model and for an unknown model once the catalogue is known', () => {
    const ids = new Set(['porsche-911-gt3']);
    expect(isWildcardSpot(spot('x', '2026-11-01T00:00:00Z'), ids)).to.equal(true);
    expect(isWildcardSpot(spot('y', '2026-11-01T00:00:00Z', 'gone'), ids)).to.equal(true);
    expect(isWildcardSpot(spot('z', '2026-11-01T00:00:00Z', 'porsche-911-gt3'), ids)).to.equal(false);
    expect(isWildcardSpot(spot('w', '2026-11-01T00:00:00Z', 'gone'), new Set())).to.equal(false);
  });
});

describe('pageProgress', () => {
  it('reports the counts of a page', () => {
    const supercar = buildAlbumPages(models, spots).find((page) => page.id === 'supercar');
    if (supercar === undefined) throw new Error('missing page');
    expect(pageProgress(supercar)).to.deep.equal({ pageId: 'supercar', collected: 1, total: 6, isComplete: false });
  });

  it('dates a complete page by the spot that filled its last slot', () => {
    const allSupercars = supercars.map((item, index) =>
      spot(`s-${item.id}`, `2026-11-0${index + 1}T10:00:00.000Z`, item.id),
    );
    const supercar = buildAlbumPages(models, allSupercars).find((page) => page.id === 'supercar');
    if (supercar === undefined) throw new Error('missing page');
    const progress = pageProgress(supercar);
    expect(progress.isComplete).to.equal(true);
    expect(progress.completedAt).to.equal('2026-11-06T10:00:00.000Z');
  });
});

describe('buildAlbumCover', () => {
  it('sums the category pages and shows the newest 6 catches', () => {
    const many = Array.from({ length: 8 }, (_, index) => spot(`n${index}`, `2026-11-0${index + 1}T10:00:00.000Z`));
    const cover = buildAlbumCover(buildAlbumPages(models, many), many);
    expect(cover.total).to.equal(15);
    expect(cover.collected).to.equal(0);
    expect(cover.ratio).to.equal(0);
    expect(cover.latest.map((item) => item.id)).to.deep.equal(['n7', 'n6', 'n5', 'n4', 'n3', 'n2']);
  });

  it('computes the completion ratio', () => {
    const cover = buildAlbumCover(buildAlbumPages(models, spots), spots);
    expect(cover.collected).to.equal(2);
    expect(cover.ratio).to.be.closeTo(2 / 15, 1e-9);
  });

  it('handles an empty catalogue', () => {
    expect(buildAlbumCover([], []).ratio).to.equal(0);
  });
});

describe('buildCollectionPages (Appendix E)', () => {
  const collections: Collection[] = [
    { id: 'italian-exotics', number: 4, modelIds: ['super-15', 'super-13', 'super-13', 'missing-model'] },
    { id: 'autobahn-heroes', number: 3, modelIds: ['porsche-911-gt3'] },
    { id: 'not-a-real-set', number: 9, modelIds: ['porsche-911-gt3'] },
  ];
  const sets = buildCollectionPages(collections, models, spots);

  it('orders sets by number and skips unknown set ids', () => {
    expect(sets.map((set) => set.collectionId)).to.deep.equal(['autobahn-heroes', 'italian-exotics']);
  });

  it('sorts members by sticker number, drops duplicates and unknown models', () => {
    const italian = sets.find((set) => set.collectionId === 'italian-exotics');
    expect(italian?.slots.map((slot) => slot.model.id)).to.deep.equal(['super-13', 'super-15']);
    expect(italian?.total).to.equal(2);
    expect(italian?.collected).to.equal(1);
    expect(italian?.isComplete).to.equal(false);
  });

  it('completes a set when every member is collected (SET COMPLETE)', () => {
    const autobahn = sets.find((set) => set.collectionId === 'autobahn-heroes');
    expect(autobahn?.isComplete).to.equal(true);
    expect(autobahn?.slots[0]?.cover?.id).to.equal('p-first');
  });

  it('lets one car belong to several sets', () => {
    const both: Collection[] = [
      { id: 'hypercar-hall-of-fame', number: 8, modelIds: ['super-13'] },
      { id: 'italian-exotics', number: 4, modelIds: ['super-13'] },
    ];
    const pages = buildCollectionPages(both, models, spots);
    expect(collectionsOfModel(pages, 'super-13').map((set) => set.collectionId)).to.deep.equal([
      'italian-exotics',
      'hypercar-hall-of-fame',
    ]);
    expect(collectionsOfModel(pages, 'porsche-911-gt3')).to.have.length(0);
  });

  it('tells collection pages from album pages', () => {
    const [first] = sets;
    const [albumPage] = buildAlbumPages(models, spots);
    if (first === undefined || albumPage === undefined) throw new Error('missing page');
    expect(isCollectionPage(first)).to.equal(true);
    expect(isCollectionPage(albumPage)).to.equal(false);
  });

  it('recognises the 8 set ids', () => {
    expect(isCollectionId('jdm-legends')).to.equal(true);
    expect(isCollectionId('hypercar-hall-of-fame')).to.equal(true);
    expect(isCollectionId('jdm')).to.equal(false);
    expect(isCollectionId(42)).to.equal(false);
  });
});

describe('needleAngle', () => {
  it('starts the dial at 135° and ends it at 405°', () => {
    expect(needleAngle(0)).to.equal(135);
    expect(needleAngle(1)).to.equal(405);
    expect(needleAngle(2)).to.equal(405);
    expect(needleAngle(Number.NaN)).to.equal(135);
  });
});

describe('stickerXp and pageIdOfModel', () => {
  it('follows the new-sticker XP table (§4.4)', () => {
    expect(stickerXp('common')).to.equal(40);
    expect(stickerXp('rare')).to.equal(80);
    expect(stickerXp('epic')).to.equal(160);
    expect(stickerXp('legendary')).to.equal(400);
  });

  it('prints a model on its category page', () => {
    expect(pageIdOfModel(porsche)).to.equal('sports');
  });
});
