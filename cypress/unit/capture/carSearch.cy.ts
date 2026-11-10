import type { CarModel } from '../../../src/types/CarModel';
import { bestMatch, expandQuery, foldText, searchCatalogue } from '../../../src/utils/carSearch';
import { withCatalogue } from './catalogue';

describe('carSearch', () => {
  let models: CarModel[] = [];

  before(() => {
    withCatalogue((catalogue) => {
      models = catalogue;
    });
  });

  it('reads the whole catalogue from the seeds (48 + 70 models)', () => {
    expect(models).to.have.length(118);
  });

  it('folds accents, case and punctuation', () => {
    expect(foldText('Huracán')).to.equal('huracan');
    expect(foldText('Citroën 2CV')).to.equal('citroen 2cv');
    expect(foldText('  G-Wagon!! ')).to.equal('g wagon');
    expect(foldText('Käfer')).to.equal('kafer');
  });

  it('expands make nicknames', () => {
    expect(expandQuery('vw golf')).to.deep.equal(['volkswagen', 'golf']);
    expect(expandQuery('Merc AMG GT')).to.deep.equal(['mercedes', 'amg', 'gt']);
    expect(expandQuery('lambo')).to.deep.equal(['lamborghini']);
  });

  // SPEC P0-07: each everyday spelling finds the right model (first result).
  const SPELLINGS: [string, string[]][] = [
    ['huracan', ['lamborghini-huracan']],
    ['citroen 2cv', ['citroen-2cv']],
    ['vw golf', ['volkswagen-golf-gti', 'volkswagen-golf-r']],
    ['gtr', ['nissan-skyline-gt-r-r34', 'nissan-gt-r-r35']],
    ['supra mk4', ['toyota-supra-a80']],
    ['g-wagon', ['mercedes-g-class']],
    ['lambo', ['lamborghini-huracan', 'lamborghini-countach', 'lamborghini-aventador', 'lamborghini-miura']],
    ['merc amg gt', ['mercedes-amg-gt']],
    ['eend', ['citroen-2cv']],
    ['kever', ['volkswagen-beetle']],
  ];
  SPELLINGS.forEach(([query, expected]) => {
    it(`"${query}" finds ${expected[0]}`, () => {
      const results = searchCatalogue(models, query).map((model) => model.id);
      expect(results[0], `first result for "${query}"`).to.equal(expected[0]);
      expected.forEach((id) => expect(results, `results for "${query}"`).to.include(id));
    });
  });

  it('finds the Appendix E cars, including the Ferrari 308 GTSi', () => {
    expect(searchCatalogue(models, 'ferrari 308')[0]?.id).to.equal('ferrari-308-gtsi');
    expect(searchCatalogue(models, 'magnum')[0]?.id).to.equal('ferrari-308-gtsi');
    expect(searchCatalogue(models, 'ae86')[0]?.id).to.equal('toyota-sprinter-trueno-ae86');
    expect(searchCatalogue(models, 'bulli')[0]?.id).to.equal('volkswagen-type-2-t1');
    expect(searchCatalogue(models, 'mx5')[0]?.id).to.equal('mazda-mx-5');
  });

  it('requires every word to match (no stray stickers)', () => {
    expect(searchCatalogue(models, 'porsche chiron')).to.deep.equal([]);
    expect(searchCatalogue(models, 'delorean')).to.deep.equal([]);
    expect(searchCatalogue(models, '   ')).to.deep.equal([]);
  });

  it('limits the number of results', () => {
    expect(searchCatalogue(models, 'porsche', 3)).to.have.length(3);
  });

  describe('bestMatch (one clear sticker, or none)', () => {
    it('matches a full name, also with other spellings', () => {
      expect(bestMatch(models, 'Porsche 911 GT3')?.id).to.equal('porsche-911-gt3');
      expect(bestMatch(models, 'Lamborghini Huracan EVO')?.id).to.equal('lamborghini-huracan');
      expect(bestMatch(models, 'Mazda MX5')?.id).to.equal('mazda-mx-5');
      expect(bestMatch(models, 'vw golf gti')?.id).to.equal('volkswagen-golf-gti');
      expect(bestMatch(models, 'Nissan GT-R R35')?.id).to.equal('nissan-gt-r-r35');
      expect(bestMatch(models, 'Ferrari 308 GTSi')?.id).to.equal('ferrari-308-gtsi');
    });

    it('matches an exact alias', () => {
      expect(bestMatch(models, 'Citroën eend')?.id).to.equal('citroen-2cv');
      expect(bestMatch(models, 'Toyota Supra mk4')?.id).to.equal('toyota-supra-a80');
      expect(bestMatch(models, 'Audi RS6 Avant')?.id).to.equal('audi-rs6-avant');
    });

    it('prefers the more specific name', () => {
      expect(bestMatch(models, 'Ford Mustang Mach-E')?.id).to.equal('ford-mustang-mach-e');
      expect(bestMatch(models, 'Ford Mustang')?.id).to.equal('ford-mustang');
    });

    it('returns nothing for ambiguous or partial names', () => {
      expect(bestMatch(models, 'Porsche 911')).to.equal(undefined);
      expect(bestMatch(models, 'Toyota Yaris')).to.equal(undefined);
      expect(bestMatch(models, 'BMW M340i')).to.equal(undefined);
      expect(bestMatch(models, 'Nissan GTR')).to.equal(undefined);
      expect(bestMatch(models, 'Fiat Panda')).to.equal(undefined);
    });

    it('needs the right make', () => {
      expect(bestMatch(models, 'Ford Model 3')).to.equal(undefined);
      expect(bestMatch(models, 'Tesla Model 3')?.id).to.equal('tesla-model-3');
    });
  });
});
