import type { PlateRegion } from '../../../src/types/Spot';
import {
  defaultRegion,
  fitWithin,
  MIN_BOX_SIDE,
  moveRegion,
  pixelateRgba,
  pixelBlockSize,
  regionFromDrag,
  resizeRegion,
  toNormalisedDelta,
  toPixelRect,
  variance,
} from '../../../src/utils/redactionMath';

const display = { width: 400, height: 300 };
const expectedRegion: PlateRegion = { x: 0.25, y: 0.5, width: 0.5, height: 0.2 };

/** Floating point safe comparison of two regions. */
function isCloseTo(actual: PlateRegion | undefined, expected: PlateRegion): boolean {
  if (actual === undefined) return false;
  return (['x', 'y', 'width', 'height'] as const).every((field) => Math.abs(actual[field] - expected[field]) < 1e-9);
}

describe('plate redaction maths', () => {
  it('converts a drag into a normalised region', () => {
    expect(isCloseTo(regionFromDrag({ x: 100, y: 150 }, { x: 300, y: 210 }, display), expectedRegion)).to.equal(true);
  });

  it('accepts a drag from bottom-right to top-left', () => {
    expect(isCloseTo(regionFromDrag({ x: 300, y: 210 }, { x: 100, y: 150 }, display), expectedRegion)).to.equal(true);
  });

  it('ignores a tap that is too small to be a plate', () => {
    expect(regionFromDrag({ x: 100, y: 100 }, { x: 102, y: 101 }, display)).to.equal(undefined);
  });

  it('clamps a drag that leaves the photo', () => {
    const region = regionFromDrag({ x: 350, y: 250 }, { x: 600, y: 500 }, display);
    expect(region?.x !== undefined && region.x + region.width).to.be.at.most(1);
  });

  it('ignores drags before the photo has a size', () => {
    expect(regionFromDrag({ x: 0, y: 0 }, { x: 10, y: 10 }, { width: 0, height: 0 })).to.equal(undefined);
  });

  it('maps a region to whole pixels of the image', () => {
    expect(toPixelRect({ x: 0.25, y: 0.5, width: 0.5, height: 0.2 }, { width: 1600, height: 1200 })).to.deep.equal({
      x: 400,
      y: 600,
      width: 800,
      height: 240,
    });
  });

  it('uses blocks big enough to make a plate unreadable', () => {
    expect(pixelBlockSize({ x: 0, y: 0, width: 300, height: 60 })).to.equal(50);
  });

  it('never uses blocks smaller than 8 pixels', () => {
    expect(pixelBlockSize({ x: 0, y: 0, width: 12, height: 6 })).to.equal(8);
  });

  it('scales large photos down to the maximum side', () => {
    expect(fitWithin({ width: 4000, height: 3000 }, 1600)).to.deep.equal({ width: 1600, height: 1200 });
  });

  it('keeps small photos at their original size', () => {
    expect(fitWithin({ width: 800, height: 600 }, 1600)).to.deep.equal({ width: 800, height: 600 });
  });

  it('moves a box without leaving the photo', () => {
    expect(isCloseTo(moveRegion(expectedRegion, 0.1, -0.1), { x: 0.35, y: 0.4, width: 0.5, height: 0.2 })).to.equal(
      true,
    );
    expect(isCloseTo(moveRegion(expectedRegion, 1, 1), { x: 0.5, y: 0.8, width: 0.5, height: 0.2 })).to.equal(true);
    expect(isCloseTo(moveRegion(expectedRegion, -1, -1), { x: 0, y: 0, width: 0.5, height: 0.2 })).to.equal(true);
  });

  it('resizes from the corner handle, within the photo and never below the minimum', () => {
    expect(isCloseTo(resizeRegion(expectedRegion, 0.1, 0.05), { x: 0.25, y: 0.5, width: 0.6, height: 0.25 })).to.equal(
      true,
    );
    const grown = resizeRegion(expectedRegion, 2, 2);
    expect(grown.x + grown.width).to.be.closeTo(1, 1e-9);
    expect(grown.y + grown.height).to.be.closeTo(1, 1e-9);
    const shrunk = resizeRegion(expectedRegion, -2, -2);
    expect(shrunk.width).to.equal(MIN_BOX_SIDE);
    expect(shrunk.height).to.equal(MIN_BOX_SIDE);
  });

  it('places the "Add box" box inside the photo, offset per box', () => {
    const first = defaultRegion(0);
    const second = defaultRegion(1);
    expect(first.x + first.width).to.be.at.most(1);
    expect(first.y + first.height).to.be.at.most(1);
    expect(second.x).to.be.greaterThan(first.x);
  });

  it('converts gesture pixels into photo fractions', () => {
    expect(toNormalisedDelta(40, 30, display)).to.deep.equal({ x: 0.1, y: 0.1 });
    expect(toNormalisedDelta(40, 30, { width: 0, height: 0 })).to.deep.equal({ x: 0, y: 0 });
  });

  it('computes the variance of pixel values', () => {
    expect(variance([])).to.equal(0);
    expect(variance([5, 5, 5])).to.equal(0);
    expect(variance([0, 10])).to.equal(25);
  });

  it('pixelates RGBA data into exact block averages', () => {
    // 4 × 2 pixels: a black/white pattern, block 2 → two grey blocks.
    const data = new Uint8ClampedArray([
      0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255,
      255, 255, 0, 0, 0, 255,
    ]);
    pixelateRgba(data, 4, 2, 2);
    for (let index = 0; index < data.length; index += 4) {
      expect([data[index], data[index + 1], data[index + 2], data[index + 3]]).to.deep.equal([128, 128, 128, 255]);
    }
  });

  it('handles blocks at the edge that are smaller than the block size', () => {
    const data = new Uint8ClampedArray([10, 10, 10, 255, 20, 20, 20, 255, 90, 90, 90, 255]);
    pixelateRgba(data, 3, 1, 2);
    expect(Array.from(data)).to.deep.equal([15, 15, 15, 255, 15, 15, 15, 255, 90, 90, 90, 255]);
  });
});
