import { ALBUM_PAGES } from '../../../src/constants/albumPages';
import { en, nl } from '../../../src/i18n/resources';
import { BODY_STYLES, CAR_CATEGORIES, RARITIES } from '../../../src/types/CarModel';
import { COLLECTION_IDS } from '../../../src/types/Collection';

/**
 * The catalogue seed is the source of truth (supabase/seed.sql + seed_collections.sql). This test
 * parses the SQL and checks the data rules of SPEC Appendix C and E, so a bad row fails CI before
 * anyone runs it in the SQL editor.
 */
interface SeedModel {
  id: string;
  number: number;
  make: string;
  model: string;
  category: string;
  rarity: string;
  bodyStyle: string;
  country: string;
  yearFrom?: number;
  yearTo?: number;
}

/** The 48 Season 1 ids in sticker-number order: live spots reference them, so they never change. */
const SEASON_ONE = [
  'volkswagen-golf-gti',
  'mini-cooper-s',
  'abarth-595',
  'land-rover-defender',
  'range-rover',
  'mercedes-g-class',
  'porsche-911-gt3',
  'bmw-m3',
  'audi-rs6-avant',
  'mercedes-amg-gt',
  'alpine-a110',
  'lotus-emira',
  'ferrari-296-gtb',
  'lamborghini-huracan',
  'mclaren-720s',
  'audi-r8',
  'aston-martin-vantage',
  'maserati-mc20',
  'bugatti-chiron',
  'koenigsegg-jesko',
  'pagani-huayra',
  'ferrari-laferrari',
  'porsche-918-spyder',
  'mclaren-p1',
  'porsche-356',
  'jaguar-e-type',
  'mercedes-300-sl',
  'volkswagen-beetle',
  'citroen-2cv',
  'volvo-240',
  'toyota-supra-a80',
  'nissan-skyline-gt-r-r34',
  'honda-nsx',
  'mazda-mx-5',
  'subaru-impreza-wrx-sti',
  'toyota-gr-yaris',
  'ford-mustang',
  'chevrolet-camaro',
  'dodge-challenger',
  'chevrolet-corvette-c8',
  'ford-gt',
  'shelby-cobra',
  'tesla-model-3',
  'polestar-2',
  'porsche-taycan',
  'audi-e-tron-gt',
  'lucid-air',
  'rimac-nevera',
];

const SQL_STRING = "'((?:[^']|'')*)'";
const SEASON_ONE_ROW = new RegExp(
  `^\\s*\\(${SQL_STRING},\\s*(\\d+),\\s*${SQL_STRING},\\s*${SQL_STRING},\\s*${SQL_STRING},\\s*${SQL_STRING},\\s*${SQL_STRING},\\s*${SQL_STRING},\\s*1\\)`,
);
const EXTENDED_ROW = new RegExp(
  `^\\s*\\(${SQL_STRING},\\s*(\\d+),\\s*${SQL_STRING},\\s*${SQL_STRING},\\s*${SQL_STRING},\\s*${SQL_STRING},\\s*${SQL_STRING},\\s*${SQL_STRING},\\s*1,\\s*(\\d{4}|null),\\s*(\\d{4}|null)\\)`,
);
const COLLECTION_ROW = /^\s*\('([a-z0-9-]+)',\s*(\d+),\s*(\d+)\)/;
const MEMBER_ROW = /^\s*\('([a-z0-9-]+)',\s*'([a-z0-9-]+)'\)/;

const unquote = (value: string | undefined): string => (value ?? '').replace(/''/g, "'");
const year = (value: string | undefined): number | undefined =>
  value === undefined || value === 'null' ? undefined : Number(value);

function parseModels(sql: string, extended: boolean): SeedModel[] {
  const pattern = extended ? EXTENDED_ROW : SEASON_ONE_ROW;
  return sql.split(/\r?\n/).flatMap((line) => {
    const match = pattern.exec(line);
    if (match === null) return [];
    return [
      {
        id: unquote(match[1]),
        number: Number(match[2]),
        make: unquote(match[3]),
        model: unquote(match[4]),
        category: unquote(match[5]),
        rarity: unquote(match[6]),
        bodyStyle: unquote(match[7]),
        country: unquote(match[8]),
        yearFrom: extended ? year(match[9]) : undefined,
        yearTo: extended ? year(match[10]) : undefined,
      },
    ];
  });
}

function parseCollections(sql: string): { ids: string[]; members: Map<string, string[]> } {
  const lines = sql.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith('insert into public.collections'));
  const memberStart = lines.findIndex((line) => line.startsWith('insert into public.collection_models'));
  const ids = lines.slice(start, memberStart).flatMap((line) => {
    const match = COLLECTION_ROW.exec(line);
    return match === null ? [] : [match[1] ?? ''];
  });
  const members = new Map<string, string[]>();
  for (const line of lines.slice(memberStart)) {
    const match = MEMBER_ROW.exec(line);
    if (match === null) continue;
    const collection = match[1] ?? '';
    members.set(collection, [...(members.get(collection) ?? []), match[2] ?? '']);
  }
  return { ids, members };
}

describe('catalogue seed and collections (Appendix E)', () => {
  let seasonOne: SeedModel[] = [];
  let extension: SeedModel[] = [];
  let collections: { ids: string[]; members: Map<string, string[]> } = { ids: [], members: new Map() };

  before(() => {
    cy.readFile('supabase/seed.sql').then((sql: string) => {
      seasonOne = parseModels(sql, false);
    });
    cy.readFile('supabase/seed_collections.sql').then((sql: string) => {
      extension = parseModels(sql, true);
      collections = parseCollections(sql);
    });
  });

  const catalogue = () => [...seasonOne, ...extension];

  it('keeps the 48 Season 1 ids and sticker numbers unchanged', () => {
    expect(seasonOne.map((model) => model.id)).to.deep.equal(SEASON_ONE);
    expect(seasonOne.map((model) => model.number)).to.deep.equal(SEASON_ONE.map((_, index) => index + 1));
  });

  it('adds about 70 real models numbered from 49 without gaps', () => {
    expect(extension.length).to.be.within(60, 82);
    expect(extension.map((model) => model.number)).to.deep.equal(extension.map((_, index) => 49 + index));
  });

  it('has unique ids and valid enums for every model', () => {
    const ids = catalogue().map((model) => model.id);
    expect(new Set(ids).size).to.equal(ids.length);
    for (const model of catalogue()) {
      expect(model.id, model.id).to.match(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(CAR_CATEGORIES, model.id).to.include(model.category);
      expect(RARITIES, model.id).to.include(model.rarity);
      expect(BODY_STYLES, model.id).to.include(model.bodyStyle);
      expect(model.make.length, model.id).to.be.within(1, 40);
      expect(model.model.length, model.id).to.be.within(1, 60);
    }
  });

  it('gives every model a translated ISO country of origin', () => {
    for (const model of catalogue()) {
      expect(model.country, model.id).to.match(/^[A-Z]{2}$/);
      expect(en.countries, model.id).to.have.property(model.country);
      expect(nl.countries, model.id).to.have.property(model.country);
    }
  });

  it('gives every new model plausible production years', () => {
    for (const model of extension) {
      expect(model.yearFrom, model.id).to.be.a('number');
      expect(model.yearFrom ?? 0, model.id).to.be.within(1885, 2026);
      if (model.yearTo !== undefined) {
        expect(model.yearTo, model.id).to.be.within(model.yearFrom ?? 0, 2026);
      }
    }
  });

  it('contains the Ferrari 308 GTSi in Italian Exotics, with a fun fact in en and nl', () => {
    const ferrari = extension.find((model) => model.id === 'ferrari-308-gtsi');
    expect(ferrari).to.deep.include({
      make: 'Ferrari',
      model: '308 GTSi',
      country: 'IT',
      rarity: 'epic',
      bodyStyle: 'coupe',
      yearFrom: 1980,
      yearTo: 1982,
    });
    expect(collections.members.get('italian-exotics')).to.include('ferrari-308-gtsi');
    expect(en.collections.fun_facts['ferrari-308-gtsi']).to.contain('Magnum, P.I.');
    expect(nl.collections.fun_facts['ferrari-308-gtsi']).to.contain('Magnum, P.I.');
  });

  it('seeds exactly the 8 collections, each with 8–12 existing, distinct cars', () => {
    expect(collections.ids).to.deep.equal([...COLLECTION_IDS]);
    const ids = new Set(catalogue().map((model) => model.id));
    for (const id of COLLECTION_IDS) {
      const members = collections.members.get(id) ?? [];
      expect(members.length, id).to.be.within(8, 12);
      expect(new Set(members).size, id).to.equal(members.length);
      for (const member of members) expect(ids.has(member), `${id}: ${member}`).to.equal(true);
    }
  });

  it('puts every catalogue model on at least one album page or in a collection', () => {
    const pageCategories = new Set<string>(
      ALBUM_PAGES.flatMap((page) => (page.category !== undefined ? [page.category] : [])),
    );
    const inCollection = new Set([...collections.members.values()].flat());
    const orphans = catalogue().filter((model) => !pageCategories.has(model.category) && !inCollection.has(model.id));
    expect(orphans.map((model) => model.id)).to.deep.equal([]);
  });

  it('lets a car belong to several sets', () => {
    const all = [...collections.members.values()].flat();
    expect(all.length).to.be.greaterThan(new Set(all).size);
  });

  it('translates the title and description of every collection in en and nl', () => {
    for (const id of COLLECTION_IDS) {
      expect(en.collections[id].title.length, id).to.be.greaterThan(0);
      expect(en.collections[id].description.length, id).to.be.greaterThan(0);
      expect(nl.collections[id].title.length, id).to.be.greaterThan(0);
      expect(nl.collections[id].description.length, id).to.be.greaterThan(0);
    }
  });
});
