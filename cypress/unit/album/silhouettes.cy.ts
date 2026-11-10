import {
  buildSilhouettePath,
  SILHOUETTE_VIEWBOX,
  SILHOUETTE_WHEEL_RADIUS,
  SILHOUETTE_WHEEL_Y,
  SILHOUETTES,
} from '../../../src/constants/silhouettes';
import { BODY_STYLES } from '../../../src/types/CarModel';

/** Every number in a path, as [x, y] pairs where the command uses absolute coordinates. */
function numbers(path: string): number[] {
  return (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
}

describe('car silhouettes', () => {
  it('has a silhouette for each of the 10 body styles', () => {
    expect(Object.keys(SILHOUETTES).sort()).to.deep.equal([...BODY_STYLES].sort());
  });

  it('draws closed paths that start with a move command', () => {
    for (const style of BODY_STYLES) {
      const { path } = SILHOUETTES[style];
      expect(path, style).to.match(/^M/);
      expect(path.trim(), style).to.match(/Z$/);
    }
  });

  it('stays inside the 120×48 viewBox', () => {
    for (const style of BODY_STYLES) {
      for (const value of numbers(SILHOUETTES[style].path)) {
        expect(value, style).to.be.within(0, SILHOUETTE_VIEWBOX.width);
      }
      for (const cx of SILHOUETTES[style].wheels) {
        expect(cx - SILHOUETTE_WHEEL_RADIUS, style).to.be.greaterThan(0);
        expect(cx + SILHOUETTE_WHEEL_RADIUS, style).to.be.lessThan(SILHOUETTE_VIEWBOX.width);
      }
    }
    expect(SILHOUETTE_WHEEL_Y + SILHOUETTE_WHEEL_RADIUS).to.be.at.most(SILHOUETTE_VIEWBOX.height);
  });

  it('puts the rear wheel behind the front wheel', () => {
    for (const style of BODY_STYLES) {
      const [rear, front] = SILHOUETTES[style].wheels;
      expect(rear, style).to.be.lessThan(front);
    }
  });

  it('cuts two wheel arches into the sill line', () => {
    const path = buildSilhouettePath({ top: 'M4,36 L4,20 L116,20 L116,36', rear: 4, front: 116, wheels: [24, 96] });
    expect(path.match(/A8,8 0 0 0/g)).to.have.length(2);
    expect(path).to.contain('L104,38 A8,8 0 0 0 88,38');
    expect(path).to.contain('L32,38 A8,8 0 0 0 16,38');
  });

  it('appends the windows as extra sub-paths', () => {
    const path = buildSilhouettePath({
      top: 'M4,36 L4,20 L116,20 L116,36',
      rear: 4,
      front: 116,
      wheels: [24, 96],
      windows: ['M40,22 L80,22 L80,26 Z'],
    });
    expect(path.match(/M/g)).to.have.length(2);
  });
});
