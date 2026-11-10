import { bestRun, computeWeeklyStreak, deriveProgress, shiftWeekKey } from '../../../src/utils/progression';
import { brusselsOffset, CATALOGUE, spot } from './helpers';

const weeksBack = (week: string, ...offsets: number[]) => offsets.map((offset) => shiftWeekKey(week, -offset));

describe('streak: computeWeeklyStreak', () => {
  it('counts the run ending this week', () => {
    const streak = computeWeeklyStreak(weeksBack('2026-W46', 0, 1, 2), '2026-W46', false);
    expect(streak).to.deep.include({ current: 3, best: 3, atRisk: false });
    expect(streak.lastWeeks).to.deep.equal([false, false, false, false, false, true, true, true]);
  });

  it("keeps last week's run alive while this week is open, and flags it at risk only on Sunday", () => {
    const active = weeksBack('2026-W46', 1, 2, 3, 4, 5, 6);
    expect(computeWeeklyStreak(active, '2026-W46', false)).to.deep.include({ current: 6, atRisk: false });
    expect(computeWeeklyStreak(active, '2026-W46', true)).to.deep.include({ current: 6, atRisk: true });
  });

  it('is not at risk once this week has a spot, nor when there is nothing to lose', () => {
    expect(computeWeeklyStreak(weeksBack('2026-W46', 0, 1), '2026-W46', true).atRisk).to.equal(false);
    expect(computeWeeklyStreak([], '2026-W46', true)).to.deep.include({ current: 0, best: 0, atRisk: false });
  });

  it('breaks after a full week without spots but remembers the best run', () => {
    const active = weeksBack('2026-W46', 2, 3, 4, 5, 10);
    const streak = computeWeeklyStreak(active, '2026-W46', false);
    expect(streak).to.deep.include({ current: 0, best: 4 });
    expect(bestRun(new Set(active))).to.equal(4);
    expect(streak.lastWeeks).to.have.length(8);
  });

  it('runs across a year boundary', () => {
    const active = ['2025-W51', '2025-W52', '2026-W01', '2026-W02'];
    expect(computeWeeklyStreak(active, '2026-W02', false).current).to.equal(4);
  });
});

describe('streak: derived from spots', () => {
  it('counts the weeks in which spots were logged (createdAt), in local time', () => {
    const spots = [
      spot({ createdAt: '2026-11-03T12:00:00.000Z' }),
      // Sunday 23:30 local (W45) and Monday 00:30 local (W46).
      spot({ createdAt: '2026-11-08T22:30:00.000Z' }),
      spot({ createdAt: '2026-11-08T23:30:00.000Z' }),
    ];
    const snapshot = deriveProgress(spots, CATALOGUE, new Date('2026-11-11T10:00:00Z'), brusselsOffset);
    expect(snapshot.streak).to.deep.include({ current: 2, best: 2, atRisk: false });
    const sunday = deriveProgress(spots.slice(0, 2), CATALOGUE, new Date('2026-11-15T12:00:00Z'), brusselsOffset);
    expect(sunday.streak).to.deep.include({ current: 1, atRisk: true });
  });
});
