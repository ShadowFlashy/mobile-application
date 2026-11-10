import { PLACES } from '../../../src/constants/places';
import type { Place } from '../../../src/types/Location';
import { haversineKm, isValidCoordinate, nearestPlace, placeLabel, roundCoordinate } from '../../../src/utils/geo';

// On-device city resolution (SPEC D-7, Appendix D).
const KM_PER_DEGREE_LAT = 111.195;

describe('haversineKm', () => {
  it('is 0 for the same point and symmetric', () => {
    const leuven = { latitude: 50.879, longitude: 4.7 };
    const brussels = { latitude: 50.847, longitude: 4.352 };
    expect(haversineKm(leuven, leuven)).to.equal(0);
    expect(haversineKm(leuven, brussels)).to.be.closeTo(haversineKm(brussels, leuven), 1e-9);
    expect(haversineKm(leuven, brussels)).to.be.closeTo(24.7, 0.5);
  });

  it('matches known distances', () => {
    const paris = { latitude: 48.8566, longitude: 2.3522 };
    const london = { latitude: 51.5074, longitude: -0.1278 };
    expect(haversineKm(paris, london)).to.be.closeTo(343.5, 2);
    expect(haversineKm({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 })).to.be.closeTo(
      KM_PER_DEGREE_LAT,
      0.01,
    );
  });
});

describe('roundCoordinate', () => {
  it('rounds to 2 decimals by default (≈1 km) and never returns -0', () => {
    expect(roundCoordinate({ latitude: 50.87949, longitude: 4.70051 })).to.deep.equal({
      latitude: 50.88,
      longitude: 4.7,
    });
    expect(roundCoordinate({ latitude: -33.86882, longitude: 151.20929 }, 3)).to.deep.equal({
      latitude: -33.869,
      longitude: 151.209,
    });
    const nearZero = roundCoordinate({ latitude: -0.001, longitude: -0.004 });
    expect(Object.is(nearZero.latitude, -0)).to.equal(false);
    expect(Object.is(nearZero.longitude, -0)).to.equal(false);
  });
});

describe('nearestPlace', () => {
  it('finds Leuven, Antwerpen and Spa from a point in town', () => {
    expect(nearestPlace({ latitude: 50.8795, longitude: 4.7009 }, PLACES)?.id).to.equal('leuven');
    expect(nearestPlace({ latitude: 51.2194, longitude: 4.4025 }, PLACES)?.id).to.equal('antwerpen');
    expect(nearestPlace({ latitude: 50.4925, longitude: 5.8645 }, PLACES)?.id).to.equal('spa');
  });

  it('resolves a rounded position to the same town', () => {
    expect(nearestPlace(roundCoordinate({ latitude: 50.87949, longitude: 4.70051 }), PLACES)?.id).to.equal('leuven');
  });

  it('returns undefined beyond 25 km (the middle of the North Sea)', () => {
    expect(nearestPlace({ latitude: 51.6, longitude: 2.6 }, PLACES)).to.equal(undefined);
  });

  it('cuts off at exactly the max distance', () => {
    const only: Place[] = [{ id: 'origin', nameEn: 'Origin', nameNl: 'Oorsprong', country: 'BE', lat: 50, lon: 4 }];
    expect(nearestPlace({ latitude: 50 + 24 / KM_PER_DEGREE_LAT, longitude: 4 }, only)?.id).to.equal('origin');
    expect(nearestPlace({ latitude: 50 + 26 / KM_PER_DEGREE_LAT, longitude: 4 }, only)).to.equal(undefined);
    expect(nearestPlace({ latitude: 50 + 9 / KM_PER_DEGREE_LAT, longitude: 4 }, only, 8)).to.equal(undefined);
  });

  it('rejects invalid coordinates', () => {
    expect(nearestPlace({ latitude: Number.NaN, longitude: 4.7 }, PLACES)).to.equal(undefined);
    expect(nearestPlace({ latitude: 95, longitude: 4.7 }, PLACES)).to.equal(undefined);
    expect(isValidCoordinate({ latitude: 50, longitude: 181 })).to.equal(false);
    expect(nearestPlace({ latitude: 50.88, longitude: 4.7 }, [])).to.equal(undefined);
  });
});

describe('placeLabel', () => {
  const antwerp = PLACES.find((place) => place.id === 'antwerpen');

  it('uses the Dutch name for nl and nl-BE, English otherwise', () => {
    if (antwerp === undefined) throw new Error('antwerpen missing');
    expect(placeLabel(antwerp, 'nl')).to.equal('Antwerpen');
    expect(placeLabel(antwerp, 'nl-BE')).to.equal('Antwerpen');
    expect(placeLabel(antwerp, 'en')).to.equal('Antwerp');
    expect(placeLabel(antwerp, 'fr')).to.equal('Antwerp');
  });
});

describe('PLACES gazetteer (Appendix D)', () => {
  it('has at least 120 places with unique slug ids', () => {
    expect(PLACES.length).to.be.at.least(120);
    const ids = PLACES.map((place) => place.id);
    expect(new Set(ids).size).to.equal(ids.length);
    ids.forEach((id) => expect(id).to.match(/^[a-z0-9]+(-[a-z0-9]+)*$/));
  });

  it('stores plausible town-centre coordinates with at most 3 decimals', () => {
    PLACES.forEach((place) => {
      expect(Math.round(place.lat * 1000) / 1000, `${place.id} lat`).to.equal(place.lat);
      expect(Math.round(place.lon * 1000) / 1000, `${place.id} lon`).to.equal(place.lon);
      // Everything sits in western Europe (Monaco to Assen, Le Mans to Munich).
      expect(place.lat, place.id).to.be.within(43, 54);
      expect(place.lon, place.id).to.be.within(-2, 12);
      expect(place.country, place.id).to.be.oneOf(['BE', 'NL', 'FR', 'LU', 'DE', 'MC', 'IT', 'GB']);
      expect(place.nameEn.trim(), place.id).to.not.equal('');
      expect(place.nameNl.trim(), place.id).to.not.equal('');
    });
  });

  it('has Brussels as a single entry', () => {
    expect(PLACES.filter((place) => /bruss|brux/i.test(`${place.nameEn} ${place.nameNl}`))).to.have.length(1);
  });

  it('contains every required place', () => {
    const required = [
      // Brussels and the Belgian provincial capitals
      'brussels',
      'antwerpen',
      'gent',
      'brugge',
      'leuven',
      'hasselt',
      'wavre',
      'mons',
      'namur',
      'liege',
      'arlon',
      // Belgian cities above about 20k (a sample of the largest)
      'charleroi',
      'mechelen',
      'aalst',
      'la-louviere',
      'kortrijk',
      'sint-niklaas',
      'oostende',
      'tournai',
      'genk',
      'seraing',
      'roeselare',
      'verviers',
      'mouscron',
      'turnhout',
      'ieper',
      'waterloo',
      'nivelles',
      'eupen',
      // Belgian car hotspots
      'spa',
      'stavelot',
      'heusden-zolder',
      'knokke-heist',
      'mettet',
      // The Netherlands
      'maastricht',
      'eindhoven',
      'breda',
      'tilburg',
      'roosendaal',
      'bergen-op-zoom',
      'middelburg',
      'vlissingen',
      'terneuzen',
      'venlo',
      'heerlen',
      'rotterdam',
      'den-haag',
      'amsterdam',
      'utrecht',
      'zandvoort',
      'assen',
      // Border and hotspot towns elsewhere
      'lille',
      'dunkerque',
      'reims',
      'paris',
      'le-mans',
      'monaco',
      'molsheim',
      'luxembourg',
      'aachen',
      'koeln',
      'duesseldorf',
      'nuerburg',
      'stuttgart',
      'muenchen',
      'wolfsburg',
      'ingolstadt',
      'maranello',
      'modena',
      'sant-agata-bolognese',
      'monza',
      'milano',
      'woking',
      'silverstone',
      'goodwood',
      'london',
    ];
    const ids = new Set(PLACES.map((place) => place.id));
    required.forEach((id) => expect(ids.has(id), id).to.equal(true));
  });

  it('follows common English and Dutch names', () => {
    const names: [string, string, string][] = [
      ['antwerpen', 'Antwerp', 'Antwerpen'],
      ['brussels', 'Brussels', 'Brussel'],
      ['gent', 'Ghent', 'Gent'],
      ['brugge', 'Bruges', 'Brugge'],
      ['liege', 'Liège', 'Luik'],
      ['namur', 'Namur', 'Namen'],
      ['mons', 'Mons', 'Bergen'],
      ['tournai', 'Tournai', 'Doornik'],
      ['aachen', 'Aachen', 'Aken'],
      ['koeln', 'Cologne', 'Keulen'],
      ['lille', 'Lille', 'Rijsel'],
      ['paris', 'Paris', 'Parijs'],
      ['den-haag', 'The Hague', 'Den Haag'],
    ];
    names.forEach(([id, nameEn, nameNl]) => {
      expect(
        PLACES.find((place) => place.id === id),
        id,
      ).to.deep.include({ nameEn, nameNl });
    });
  });

  it('puts known towns within 3 km of their real centre (10 spot checks)', () => {
    const checks: [string, number, number][] = [
      ['leuven', 50.879, 4.7],
      ['antwerpen', 51.219, 4.402],
      ['gent', 51.054, 3.717],
      ['spa', 50.492, 5.864],
      ['maastricht', 50.851, 5.691],
      ['brussels', 50.8467, 4.3525],
      ['brugge', 51.2093, 3.2247],
      ['namur', 50.4674, 4.8718],
      ['amsterdam', 52.3676, 4.9041],
      ['koeln', 50.9375, 6.9603],
    ];
    checks.forEach(([id, latitude, longitude]) => {
      const place = nearestPlace({ latitude, longitude }, PLACES);
      expect(place?.id, id).to.equal(id);
      if (place !== undefined) {
        expect(haversineKm({ latitude, longitude }, { latitude: place.lat, longitude: place.lon }), id).to.be.below(3);
      }
    });
  });
});
