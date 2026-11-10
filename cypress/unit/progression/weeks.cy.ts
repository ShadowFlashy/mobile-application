import {
  isLastDayOfWeek,
  isoWeekKey,
  localDayKey,
  parseWeekKey,
  shiftWeekKey,
  weekBounds,
} from '../../../src/utils/progression';
import { brusselsOffset, NOW } from './helpers';

const at = (iso: string) => new Date(iso);

describe('weeks: isoWeekKey', () => {
  it('gives the ISO 8601 week in local time', () => {
    expect(isoWeekKey(NOW, 60)).to.equal('2026-W46');
    expect(isoWeekKey(at('2026-01-01T12:00:00Z'), 0)).to.equal('2026-W01');
    expect(isoWeekKey(at('2025-12-29T12:00:00Z'), 0)).to.equal('2026-W01');
    // 2026 starts on a Thursday, so it has 53 weeks.
    expect(isoWeekKey(at('2027-01-01T12:00:00Z'), 0)).to.equal('2026-W53');
    expect(isoWeekKey(at('2027-01-04T12:00:00Z'), 0)).to.equal('2027-W01');
  });

  it('starts the week on Monday 00:00 local: Sunday 23:59 vs Monday 00:00', () => {
    // Brussels winter (+60): Monday 2026-11-16 00:00 local = Sunday 23:00 UTC.
    expect(isoWeekKey(at('2026-11-15T22:59:00Z'), brusselsOffset)).to.equal('2026-W46');
    expect(isoWeekKey(at('2026-11-15T23:00:00Z'), brusselsOffset)).to.equal('2026-W47');
  });

  it('handles the DST start in 2026-W13 (Sunday 29 March)', () => {
    // After the change Brussels is +120: Monday 30 March 00:00 local = 22:00 UTC on Sunday.
    expect(isoWeekKey(at('2026-03-29T21:59:00Z'), brusselsOffset)).to.equal('2026-W13');
    expect(isoWeekKey(at('2026-03-29T22:00:00Z'), brusselsOffset)).to.equal('2026-W14');
    // A fixed winter offset would put 22:00 UTC on Sunday 23:00 (still W13): the reason for offset functions.
    expect(isoWeekKey(at('2026-03-29T22:00:00Z'), 60)).to.equal('2026-W13');
  });

  it('handles the DST end before 2026-W44 (Sunday 25 October)', () => {
    // After the change Brussels is +60 again: Monday 26 October 00:00 local = 23:00 UTC on Sunday.
    expect(isoWeekKey(at('2026-10-25T22:59:00Z'), brusselsOffset)).to.equal('2026-W43');
    expect(isoWeekKey(at('2026-10-25T23:00:00Z'), brusselsOffset)).to.equal('2026-W44');
  });
});

describe('weeks: weekBounds', () => {
  it('returns Monday 00:00 local to the next Monday 00:00 local', () => {
    const { start, end } = weekBounds('2026-W46', brusselsOffset);
    expect(start.toISOString()).to.equal('2026-11-08T23:00:00.000Z');
    expect(end.toISOString()).to.equal('2026-11-15T23:00:00.000Z');
  });

  it('is 167 hours long in 2026-W13 and 169 hours in 2026-W43', () => {
    const w13 = weekBounds('2026-W13', brusselsOffset);
    expect(w13.start.toISOString()).to.equal('2026-03-22T23:00:00.000Z');
    expect(w13.end.toISOString()).to.equal('2026-03-29T22:00:00.000Z');
    expect((w13.end.getTime() - w13.start.getTime()) / 3600000).to.equal(167);

    const w43 = weekBounds('2026-W43', brusselsOffset);
    expect(w43.start.toISOString()).to.equal('2026-10-18T22:00:00.000Z');
    expect(w43.end.toISOString()).to.equal('2026-10-25T23:00:00.000Z');
    expect((w43.end.getTime() - w43.start.getTime()) / 3600000).to.equal(169);

    const w44 = weekBounds('2026-W44', brusselsOffset);
    expect(w44.start.toISOString()).to.equal('2026-10-25T23:00:00.000Z');
  });

  it('agrees with isoWeekKey at both edges', () => {
    ['2026-W13', '2026-W14', '2026-W43', '2026-W44', '2026-W53'].forEach((weekKey) => {
      const { start, end } = weekBounds(weekKey, brusselsOffset);
      expect(isoWeekKey(start, brusselsOffset)).to.equal(weekKey);
      expect(isoWeekKey(new Date(end.getTime() - 1), brusselsOffset)).to.equal(weekKey);
      expect(isoWeekKey(end, brusselsOffset)).to.equal(shiftWeekKey(weekKey, 1));
    });
  });
});

describe('weeks: helpers', () => {
  it('shifts week keys across years', () => {
    expect(shiftWeekKey('2026-W46', -1)).to.equal('2026-W45');
    expect(shiftWeekKey('2026-W01', -1)).to.equal('2025-W52');
    expect(shiftWeekKey('2026-W53', 1)).to.equal('2027-W01');
    expect(shiftWeekKey('2026-W46', -8)).to.equal('2026-W38');
  });

  it('parses only valid week keys', () => {
    expect(parseWeekKey('2026-W46')).to.deep.equal({ year: 2026, week: 46 });
    expect(parseWeekKey('2026-46')).to.equal(undefined);
    expect(parseWeekKey('2026-W00')).to.equal(undefined);
    expect(parseWeekKey('2026-W54')).to.equal(undefined);
  });

  it('knows Sunday is the last day of the week, in local time', () => {
    expect(isLastDayOfWeek(at('2026-11-15T22:59:00Z'), brusselsOffset)).to.equal(true);
    expect(isLastDayOfWeek(at('2026-11-15T23:00:00Z'), brusselsOffset)).to.equal(false);
    expect(isLastDayOfWeek(NOW, brusselsOffset)).to.equal(false);
    expect(localDayKey(at('2026-11-15T23:30:00Z'), brusselsOffset)).to.equal('2026-11-16');
  });
});
