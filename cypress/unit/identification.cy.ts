import {
  buildInstructions,
  jpegSize,
  parseBox,
  parseIdentification,
  type CatalogueEntry,
} from '../../supabase/functions/identify-car/identification';

const CATALOGUE: CatalogueEntry[] = [
  { id: 'porsche-911-gt3', make: 'Porsche', model: '911 GT3' },
  { id: 'toyota-gr-yaris', make: 'Toyota', model: 'GR Yaris' },
];

const ANSWER = {
  isCar: true,
  make: 'Porsche',
  model: '911 GT3',
  generation: '992',
  yearFrom: 2021,
  yearTo: 0,
  bodyStyle: 'coupe',
  color: 'blue',
  confidence: 0.91,
  catalogueId: 'porsche-911-gt3',
  alternatives: [{ make: 'Porsche', model: '911 GT3 RS', confidence: 0.06 }],
  vehicleBox: { x: 0.1, y: 0.2, width: 0.8, height: 0.6 },
  plates: [{ x: 0.45, y: 0.7, width: 0.12, height: 0.05 }],
  plateText: '1-abc-234',
  funFact: 'The 992 GT3 revs to 9,000 rpm.',
};

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

// The identify-car Edge Function trusts nothing the AI returns: these tests pin down the parsing.
describe('identify-car: parsing the AI answer', () => {
  it('returns a typed identification for a valid answer', () => {
    const result = parseIdentification(ANSWER, CATALOGUE);
    expect(result.status).to.equal('identified');
    if (result.status !== 'identified') return;
    expect(result.car.make).to.equal('Porsche');
    expect(result.car.generation).to.equal('992');
    expect(result.car.yearFrom).to.equal(2021);
    expect(result.car.yearTo).to.equal(undefined);
    expect(result.car.catalogueId).to.equal('porsche-911-gt3');
    expect(result.car.plates).to.have.length(1);
  });

  it('normalises the plate text to letters and digits', () => {
    const result = parseIdentification(ANSWER, CATALOGUE);
    expect(result.status === 'identified' && result.car.plateText).to.equal('1ABC234');
  });

  it('drops catalogue ids that are not in the catalogue', () => {
    const result = parseIdentification({ ...ANSWER, catalogueId: 'made-up-id' }, CATALOGUE);
    expect(result.status === 'identified' && result.car.catalogueId).to.equal(undefined);
  });

  it('reports no car when the model says so or leaves make/model empty', () => {
    expect(parseIdentification({ ...ANSWER, isCar: false }, CATALOGUE).status).to.equal('no_car');
    expect(parseIdentification({ ...ANSWER, model: '  ' }, CATALOGUE).status).to.equal('no_car');
  });

  it('clamps confidence and falls back for unknown enum values', () => {
    const result = parseIdentification({ ...ANSWER, confidence: 7, color: 'chartreuse', bodyStyle: 1 }, CATALOGUE);
    if (result.status !== 'identified') throw new Error('expected an identification');
    expect(result.car.confidence).to.equal(1);
    expect(result.car.color).to.equal('other');
    expect(result.car.bodyStyle).to.equal('other');
  });

  it('rejects an answer that is not an object', () => {
    expect(() => parseIdentification('Porsche', CATALOGUE)).to.throw();
  });
});

describe('identify-car: boxes', () => {
  it('keeps 0..1 boxes inside the photo', () => {
    expect(parseBox({ x: 0.9, y: 0.5, width: 0.5, height: 0.2 })).to.deep.equal({
      x: 0.9,
      y: 0.5,
      width: 0.09999999999999998,
      height: 0.2,
    });
  });

  it('converts 0..1000 boxes, a common vision-model convention', () => {
    expect(parseBox({ x: 450, y: 700, width: 120, height: 50 })).to.deep.equal({
      x: 0.45,
      y: 0.7,
      width: 0.12,
      height: 0.05,
    });
  });

  it('ignores malformed or empty boxes', () => {
    expect(parseBox({ x: 'left', y: 0, width: 1, height: 1 })).to.equal(undefined);
    expect(parseBox({ x: 0.2, y: 0.2, width: 0, height: 0.1 })).to.equal(undefined);
  });
});

describe('identify-car: request helpers', () => {
  it('reads the pixel size from a real JPEG', () => {
    cy.fixture('car.jpg', 'base64').then((base64: string) => {
      expect(jpegSize(base64ToBytes(base64))).to.deep.equal({ width: 800, height: 600 });
    });
  });

  it('rejects bytes that are not a JPEG', () => {
    expect(jpegSize(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).to.equal(undefined);
  });

  it('lists the catalogue and the photo size in the instructions', () => {
    const instructions = buildInstructions(CATALOGUE, 1024, 768);
    expect(instructions).to.contain('1024x768');
    expect(instructions).to.contain('toyota-gr-yaris = Toyota GR Yaris');
  });
});
