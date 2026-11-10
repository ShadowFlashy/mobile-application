import notACar from '../../fixtures/identify/not_a_car.json';
import sure from '../../fixtures/identify/sure.json';
import unsure from '../../fixtures/identify/unsure.json';
import {
  confidenceTier,
  outcomeForHttpError,
  parseBox,
  parseIdentifyResponse,
  parseVerifyResponse,
} from '../../../src/utils/identification';

// App side of the frozen identify-car contract (SPEC §9.2, §9.3): unknown JSON → IdentifyOutcome.
describe('parseIdentifyResponse', () => {
  it('maps the sure fixture to an identified outcome with every field', () => {
    const outcome = parseIdentifyResponse(sure);
    expect(outcome.status).to.equal('identified');
    if (outcome.status !== 'identified') return;
    expect(outcome.remainingToday).to.equal(12);
    expect(outcome.provider).to.equal('cloudflare');
    expect(outcome.car).to.deep.include({
      make: 'Porsche',
      model: '911 GT3',
      generation: '992',
      yearFrom: 2021,
      bodyStyle: 'coupe',
      paint: 'blue',
      confidence: 0.94,
      catalogueId: 'porsche-911-gt3',
      plateText: '1ABC234',
    });
    expect(outcome.car.yearTo).to.equal(undefined);
    expect(outcome.car.plates).to.deep.equal([{ x: 0.42, y: 0.62, width: 0.16, height: 0.07 }]);
    expect(outcome.car.alternatives).to.deep.equal([{ make: 'Porsche', model: '911 GT3 RS', confidence: 0.04 }]);
    expect(outcome.car.vehicleBox).to.deep.equal({ x: 0.08, y: 0.22, width: 0.84, height: 0.6 });
    expect(outcome.car.funFact).to.contain('9,000 rpm');
  });

  it('turns empty strings into absent fields (unsure fixture)', () => {
    const outcome = parseIdentifyResponse(unsure);
    if (outcome.status !== 'identified') throw new Error('expected identified');
    expect(outcome.car.confidence).to.equal(0.55);
    expect(outcome.car.generation).to.equal(undefined);
    expect(outcome.car.catalogueId).to.equal(undefined);
    expect(outcome.car.plateText).to.equal(undefined);
    expect(outcome.car.funFact).to.equal(undefined);
    expect(outcome.car.alternatives).to.have.length(2);
  });

  it('maps no_car to not_a_car with the remaining count', () => {
    expect(parseIdentifyResponse(notACar)).to.deep.equal({ status: 'not_a_car', remainingToday: 11 });
  });

  it('clamps and filters hostile values', () => {
    const outcome = parseIdentifyResponse({
      status: 'identified',
      remainingToday: 3.7,
      provider: 'cloudflare',
      car: {
        make: '  BMW  ',
        model: 'M3',
        bodyStyle: 'spaceship',
        color: 'chartreuse',
        confidence: 7,
        catalogueId: 'DROP TABLE; --',
        yearFrom: 3000,
        yearTo: 1990,
        alternatives: [
          { make: 'BMW', model: 'M4', confidence: -1, catalogueId: 'bmw-m4' },
          { make: '', model: 'X' },
          { make: 'BMW', model: 'M2', confidence: 0.2 },
          { make: 'BMW', model: 'M5', confidence: 0.1 },
        ],
        plates: [
          { x: 0.9, y: 0.9, width: 0.5, height: 0.5 },
          { x: 'a', y: 0, width: 1, height: 1 },
          { x: 0.1, y: 0.1, width: 0.001, height: 0.1 },
          ...Array.from({ length: 10 }, () => ({ x: 0.1, y: 0.1, width: 0.1, height: 0.1 })),
        ],
        plateText: '1-abc 234!',
        funFact: 'x'.repeat(500),
      },
    });
    if (outcome.status !== 'identified') throw new Error('expected identified');
    const { car } = outcome;
    expect(outcome.remainingToday).to.equal(3);
    expect(car.make).to.equal('BMW');
    expect(car.bodyStyle).to.equal('other');
    expect(car.paint).to.equal('other');
    expect(car.confidence).to.equal(1);
    expect(car.catalogueId).to.equal(undefined);
    expect(car.yearFrom).to.equal(undefined);
    expect(car.yearTo).to.equal(1990);
    expect(car.alternatives).to.deep.equal([
      { make: 'BMW', model: 'M4', confidence: 0, catalogueId: 'bmw-m4' },
      { make: 'BMW', model: 'M2', confidence: 0.2 },
    ]);
    expect(car.plates).to.have.length(6);
    const first = car.plates[0];
    expect(first?.x).to.equal(0.9);
    expect(first?.width).to.be.closeTo(0.1, 1e-9);
    expect(car.plateText).to.equal('1ABC234');
    expect(car.funFact).to.have.length(160);
  });

  it('drops yearTo when it is before yearFrom', () => {
    const outcome = parseIdentifyResponse({
      status: 'identified',
      remainingToday: 1,
      car: { make: 'Fiat', model: '500', yearFrom: 2010, yearTo: 2005 },
    });
    if (outcome.status !== 'identified') throw new Error('expected identified');
    expect(outcome.car.yearFrom).to.equal(2010);
    expect(outcome.car.yearTo).to.equal(undefined);
    expect(outcome.provider).to.equal(undefined);
  });

  const unparseable: [string, unknown][] = [
    ['null', null],
    ['a string', 'Internal error'],
    ['an array', []],
    ['an unknown status', { status: 'maybe', remainingToday: 1 }],
    ['identified without a car', { status: 'identified', remainingToday: 1 }],
    ['a car without a model', { status: 'identified', remainingToday: 1, car: { make: 'Audi', model: '' } }],
    ['no remainingToday', { status: 'no_car' }],
    ['a negative remainingToday', { status: 'no_car', remainingToday: -1 }],
  ];
  unparseable.forEach(([label, body]) => {
    it(`treats ${label} as unavailable/error`, () => {
      expect(parseIdentifyResponse(body)).to.deep.equal({ status: 'unavailable', reason: 'error' });
    });
  });
});

describe('outcomeForHttpError (§9.3)', () => {
  const table: [number, string, string][] = [
    [401, 'unauthorized', 'error'],
    [405, 'method_not_allowed', 'error'],
    [413, 'image_too_large', 'error'],
    [415, 'bad_image', 'error'],
    [429, 'quota_exceeded', 'quota'],
    [429, 'provider_busy', 'busy'],
    [503, 'not_configured', 'not_configured'],
    [502, 'provider_error', 'error'],
    [504, 'provider_unreachable', 'error'],
  ];
  table.forEach(([status, code, reason]) => {
    it(`${status} ${code} → ${reason}`, () => {
      expect(outcomeForHttpError(status, { error: code })).to.deep.equal({ status: 'unavailable', reason });
    });
  });

  it('treats a bare 429 without a code as busy', () => {
    expect(outcomeForHttpError(429, undefined)).to.deep.equal({ status: 'unavailable', reason: 'busy' });
  });

  it('treats unknown codes and prototype keys as error', () => {
    expect(outcomeForHttpError(500, { error: 'constructor' })).to.deep.equal({
      status: 'unavailable',
      reason: 'error',
    });
    expect(outcomeForHttpError(500, 'oops')).to.deep.equal({ status: 'unavailable', reason: 'error' });
  });
});

describe('parseBox', () => {
  it('clamps a box to the photo and rejects tiny or malformed boxes', () => {
    expect(parseBox({ x: -0.2, y: 0.5, width: 0.3, height: 0.8 })).to.deep.equal({
      x: 0,
      y: 0.5,
      width: 0.3,
      height: 0.5,
    });
    expect(parseBox({ x: 0.5, y: 0.5, width: 0.001, height: 0.2 })).to.equal(undefined);
    expect(parseBox({ x: 0.5, y: 0.5, width: Number.NaN, height: 0.2 })).to.equal(undefined);
    expect(parseBox(undefined)).to.equal(undefined);
  });
});

describe('parseVerifyResponse (P1)', () => {
  it('accepts a known verification result', () => {
    expect(parseVerifyResponse({ status: 'verified', remainingToday: 4 })).to.deep.equal({
      status: 'result',
      result: 'verified',
      remainingToday: 4,
    });
    expect(parseVerifyResponse({ result: 'code_mismatch' })).to.deep.equal({
      status: 'result',
      result: 'code_mismatch',
      remainingToday: 0,
    });
  });

  it('rejects anything else', () => {
    expect(parseVerifyResponse({ status: 'owned_by_me' })).to.deep.equal({ status: 'unavailable', reason: 'error' });
    expect(parseVerifyResponse(null)).to.deep.equal({ status: 'unavailable', reason: 'error' });
  });
});

describe('confidenceTier (§4 P0-05)', () => {
  it('splits at 0.85 and 0.60', () => {
    expect(confidenceTier(1)).to.equal('sure');
    expect(confidenceTier(0.85)).to.equal('sure');
    expect(confidenceTier(0.8499)).to.equal('likely');
    expect(confidenceTier(0.6)).to.equal('likely');
    expect(confidenceTier(0.5999)).to.equal('guess');
    expect(confidenceTier(0)).to.equal('guess');
    expect(confidenceTier(Number.NaN)).to.equal('guess');
  });
});
