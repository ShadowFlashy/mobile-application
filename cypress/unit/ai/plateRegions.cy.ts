import sure from '../../fixtures/identify/sure.json';
import { clampRegion, coverage, mergeRegions, padRegion, regionsFromDetections } from '../../../src/utils/plateRegions';
import type { PlateRegion } from '../../../src/types/Spot';

// AI plate boxes → padded, merged, clamped blur suggestions (SPEC P0-04, §9.4).
function expectBox(actual: PlateRegion | undefined, expected: PlateRegion) {
  expect(actual, 'box').to.not.equal(undefined);
  if (actual === undefined) return;
  expect(actual.x).to.be.closeTo(expected.x, 1e-9);
  expect(actual.y).to.be.closeTo(expected.y, 1e-9);
  expect(actual.width).to.be.closeTo(expected.width, 1e-9);
  expect(actual.height).to.be.closeTo(expected.height, 1e-9);
}

describe('padRegion', () => {
  it('grows the box by 40 % of its width and 80 % of its height around its centre', () => {
    expectBox(padRegion({ x: 0.4, y: 0.6, width: 0.1, height: 0.05 }), { x: 0.38, y: 0.58, width: 0.14, height: 0.09 });
  });

  it('clamps at the photo edges', () => {
    expectBox(padRegion({ x: 0, y: 0.97, width: 0.1, height: 0.03 }), { x: 0, y: 0.958, width: 0.12, height: 0.042 });
    expectBox(padRegion({ x: 0.95, y: 0, width: 0.05, height: 0.05 }), { x: 0.94, y: 0, width: 0.06, height: 0.07 });
  });
});

describe('clampRegion', () => {
  it('keeps a box inside 0..1 and turns negative sizes into 0', () => {
    expectBox(clampRegion({ x: -0.1, y: 0.5, width: 0.3, height: 0.9 }), { x: 0, y: 0.5, width: 0.2, height: 0.5 });
    expectBox(clampRegion({ x: 0.5, y: 0.5, width: -0.2, height: 0.1 }), { x: 0.5, y: 0.5, width: 0, height: 0.1 });
    expectBox(clampRegion({ x: Number.NaN, y: 0.5, width: 0.1, height: 0.1 }), { x: 0, y: 0.5, width: 0, height: 0.1 });
  });
});

describe('mergeRegions', () => {
  it('merges overlapping boxes into their bounding box', () => {
    const merged = mergeRegions([
      { x: 0.1, y: 0.1, width: 0.2, height: 0.1 },
      { x: 0.25, y: 0.15, width: 0.2, height: 0.1 },
    ]);
    expect(merged).to.have.length(1);
    expectBox(merged[0], { x: 0.1, y: 0.1, width: 0.35, height: 0.15 });
  });

  it('merges chains (a merged box that now overlaps a third)', () => {
    const merged = mergeRegions([
      { x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
      { x: 0.5, y: 0.1, width: 0.1, height: 0.3 },
      { x: 0.15, y: 0.15, width: 0.1, height: 0.2 },
      { x: 0.2, y: 0.3, width: 0.35, height: 0.05 },
    ]);
    expect(merged).to.have.length(1);
    expectBox(merged[0], { x: 0.1, y: 0.1, width: 0.5, height: 0.3 });
  });

  it('keeps disjoint and merely touching boxes separate, without mutating the input', () => {
    const input = [
      { x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
      { x: 0.2, y: 0.1, width: 0.1, height: 0.1 },
      { x: 0.7, y: 0.7, width: 0.1, height: 0.1 },
    ];
    const copy = JSON.parse(JSON.stringify(input));
    expect(mergeRegions(input)).to.have.length(3);
    expect(input).to.deep.equal(copy);
    expect(mergeRegions([])).to.deep.equal([]);
  });
});

describe('regionsFromDetections', () => {
  it('pads the plate of the sure fixture', () => {
    const regions = regionsFromDetections(sure.car.plates);
    expect(regions).to.have.length(1);
    expectBox(regions[0], { x: 0.388, y: 0.592, width: 0.224, height: 0.126 });
  });

  it('merges boxes that overlap once padded and drops degenerate ones', () => {
    const regions = regionsFromDetections([
      { x: 0.3, y: 0.5, width: 0.1, height: 0.05 },
      { x: 0.41, y: 0.5, width: 0.1, height: 0.05 },
      { x: 0.8, y: 0.8, width: 0, height: 0.05 },
    ]);
    expect(regions).to.have.length(1);
    expect(regionsFromDetections([])).to.deep.equal([]);
  });
});

describe('coverage', () => {
  const plate = { x: 0.4, y: 0.6, width: 0.2, height: 0.1 };

  it('is 1 when a region covers the whole plate and 0 without regions', () => {
    expect(coverage(plate, [{ x: 0.3, y: 0.5, width: 0.5, height: 0.3 }])).to.be.closeTo(1, 1e-9);
    expect(coverage(plate, [])).to.equal(0);
    expect(coverage(plate, [{ x: 0, y: 0, width: 0.1, height: 0.1 }])).to.equal(0);
  });

  it('measures partial cover and counts overlaps once', () => {
    const leftHalf = { x: 0.4, y: 0.6, width: 0.1, height: 0.1 };
    expect(coverage(plate, [leftHalf])).to.be.closeTo(0.5, 1e-9);
    expect(coverage(plate, [leftHalf, { ...leftHalf }])).to.be.closeTo(0.5, 1e-9);
    // An L shape: left half plus the top half of the right half.
    expect(coverage(plate, [leftHalf, { x: 0.5, y: 0.6, width: 0.1, height: 0.05 }])).to.be.closeTo(0.75, 1e-9);
  });

  it('treats a zero-area detection as covered', () => {
    expect(coverage({ x: 0.5, y: 0.5, width: 0, height: 0 }, [])).to.equal(1);
  });
});
