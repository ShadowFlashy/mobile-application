import { DAY, MINUTE } from '../../constants/time';

/**
 * Local-time offset from UTC in minutes (Brussels: +60 in winter, +120 in summer). Either a fixed
 * number or a function of the instant, so weeks stay correct across a DST change (2026-W13, W44).
 */
export type UtcOffset = number | ((date: Date) => number);

/** The device's own offset rules, per instant (DST-aware). */
export const deviceUtcOffset = (date: Date): number => -date.getTimezoneOffset();

export function offsetAt(offset: UtcOffset, date: Date): number {
  return typeof offset === 'number' ? offset : offset(date);
}

/** The local wall-clock time of an instant, expressed as a UTC date (read it with getUTC*). */
function toLocal(date: Date, offset: UtcOffset): Date {
  return new Date(date.getTime() + offsetAt(offset, date) * MINUTE);
}

/** ISO weekday of a UTC-expressed date: Monday 1 … Sunday 7. */
function isoWeekday(local: Date): number {
  const day = local.getUTCDay();
  return day === 0 ? 7 : day;
}

/** ISO 8601 week key in local time, e.g. '2026-W46'. The week starts Monday 00:00 local. */
export function isoWeekKey(date: Date, offset: UtcOffset): string {
  const local = toLocal(date, offset);
  const thursday = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + 4 - isoWeekday(local));
  const year = new Date(thursday).getUTCFullYear();
  const week = Math.floor((thursday - Date.UTC(year, 0, 1)) / DAY / 7) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Parses '2026-W46'; undefined for anything else. */
export function parseWeekKey(weekKey: string): { year: number; week: number } | undefined {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekKey);
  if (match === null) return undefined;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (week < 1 || week > 53) return undefined;
  return { year, week };
}

/** Monday 00:00 of an ISO week as a UTC-expressed wall-clock date (ms). */
function mondayWallClock(year: number, week: number): number {
  const jan4 = Date.UTC(year, 0, 4);
  const jan4Weekday = isoWeekday(new Date(jan4));
  return jan4 - (jan4Weekday - 1) * DAY + (week - 1) * 7 * DAY;
}

/** The instant at which a local wall-clock time happens (two passes handle a DST change). */
function wallClockToInstant(wallClock: number, offset: UtcOffset): Date {
  const first = wallClock - offsetAt(offset, new Date(wallClock)) * MINUTE;
  return new Date(wallClock - offsetAt(offset, new Date(first)) * MINUTE);
}

/** Start (Monday 00:00 local, inclusive) and end (next Monday 00:00 local, exclusive) of a week. */
export function weekBounds(weekKey: string, offset: UtcOffset): { start: Date; end: Date } {
  const parsed = parseWeekKey(weekKey);
  const monday = parsed === undefined ? 0 : mondayWallClock(parsed.year, parsed.week);
  return {
    start: wallClockToInstant(monday, offset),
    end: wallClockToInstant(monday + 7 * DAY, offset),
  };
}

/** The week key `delta` weeks before (negative) or after (positive) the given one. */
export function shiftWeekKey(weekKey: string, delta: number): string {
  const parsed = parseWeekKey(weekKey);
  if (parsed === undefined) return weekKey;
  // Thursday of the week, so the ISO year is unambiguous.
  const thursday = mondayWallClock(parsed.year, parsed.week) + 3 * DAY + delta * 7 * DAY;
  return isoWeekKey(new Date(thursday), 0);
}

/** True on Sunday local time: the last day to keep a weekly streak alive. */
export function isLastDayOfWeek(date: Date, offset: UtcOffset): boolean {
  return isoWeekday(toLocal(date, offset)) === 7;
}

/** Local calendar day, e.g. '2026-11-11' (to re-derive once a day). */
export function localDayKey(date: Date, offset: UtcOffset): string {
  return toLocal(date, offset).toISOString().slice(0, 10);
}
