import type { PlateRegion } from '../../src/types/Spot';
import { fitWithin, pixelBlockSize, regionFromDrag, toPixelRect } from '../../src/utils/redactionMath';

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
});
