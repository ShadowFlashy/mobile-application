import { levelForXp, titleForLevel, xpForLevel } from '../../../src/utils/progression';

describe('levels', () => {
  it('needs 50 × L × (L − 1) XP per level', () => {
    expect(xpForLevel(1)).to.equal(0);
    expect(xpForLevel(2)).to.equal(100);
    expect(xpForLevel(5)).to.equal(1000);
    expect(xpForLevel(10)).to.equal(4500);
    expect(xpForLevel(20)).to.equal(19000);
  });

  it('puts XP totals on the right level at the exact thresholds', () => {
    expect(levelForXp(0).level).to.equal(1);
    expect(levelForXp(99).level).to.equal(1);
    expect(levelForXp(100).level).to.equal(2);
    expect(levelForXp(999).level).to.equal(4);
    expect(levelForXp(1000).level).to.equal(5);
    expect(levelForXp(4499).level).to.equal(9);
    expect(levelForXp(4500).level).to.equal(10);
    expect(levelForXp(19000).level).to.equal(20);
    for (let level = 1; level <= 80; level += 1) {
      expect(levelForXp(xpForLevel(level)).level).to.equal(level);
      if (level > 1) expect(levelForXp(xpForLevel(level) - 1).level).to.equal(level - 1);
    }
  });

  it('reports the level range and the ratio towards the next level', () => {
    const info = levelForXp(4210);
    expect(info).to.deep.include({ level: 9, xp: 4210, levelStartXp: 3600, nextLevelXp: 4500 });
    expect(info.ratio).to.be.closeTo((4210 - 3600) / 900, 1e-9);
    expect(levelForXp(-50)).to.deep.include({ level: 1, xp: 0, ratio: 0 });
  });

  it('gives each title from its first level up to the level before the next title', () => {
    const expected: [number, string][] = [
      [1, 'learner'],
      [2, 'learner'],
      [3, 'kerbside_scout'],
      [5, 'kerbside_scout'],
      [6, 'car_park_hunter'],
      [9, 'car_park_hunter'],
      [10, 'meet_regular'],
      [15, 'track_day_spotter'],
      [20, 'paddock_pass'],
      [29, 'paddock_pass'],
      [30, 'pit_lane_pro'],
      [40, 'works_spotter'],
      [50, 'redline_legend'],
      [99, 'redline_legend'],
    ];
    expected.forEach(([level, title]) => expect(titleForLevel(level)).to.equal(title));
    expect(levelForXp(4500).titleKey).to.equal('meet_regular');
  });
});
