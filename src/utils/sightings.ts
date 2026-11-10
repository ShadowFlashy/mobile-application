import { DAY, HOUR } from '../constants/time';
import type { Sighting } from '../types/OwnerCar';

/**
 * Pure helpers for the owner's sightings feed (SPEC §4 P0-17). A sighting is a privacy-safe
 * snapshot: it only knows the hour in which a car was spotted, never the exact moment.
 */

/** Page size of the sightings feed (no 50 cap: older pages load on demand). */
export const SIGHTINGS_PAGE_SIZE = 20;

function toDate(iso: string): Date | undefined {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Start of the hour (local clock) of an ISO moment, as ISO. Invalid input stays as it is. */
export function truncateToHour(iso: string): string {
  const date = toDate(iso);
  if (date === undefined) return iso;
  date.setMinutes(0, 0, 0);
  return date.toISOString();
}

/** "14:00" / "14:00" in a 24-hour clock, in the user's language. */
function formatHour(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
}

/**
 * The hour window of a sighting, e.g. "14:00–15:00". The end is one hour later, so a sighting at
 * 23:00 reads "23:00–00:00". Returns '' for an invalid date.
 */
export function hourWindowLabel(spottedHour: string, locale: string): string {
  const start = toDate(spottedHour);
  if (start === undefined) return '';
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + HOUR);
  return `${formatHour(start, locale)}–${formatHour(end, locale)}`;
}

export type SightingDayKind = 'today' | 'yesterday' | 'earlier';

export interface SightingDayGroup {
  /** Local calendar day, "YYYY-MM-DD"; stable React key. */
  dayKey: string;
  kind: SightingDayKind;
  /** Start of that day (ISO), for a formatted date label. */
  dayStart: string;
  sightings: Sighting[];
}

function startOfDay(date: Date): Date {
  const start = new Date(date.getTime());
  start.setHours(0, 0, 0, 0);
  return start;
}

function dayKeyOf(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Calendar days between two day starts (DST-safe: rounds the 23 h / 25 h days). */
function daysBetween(later: Date, earlier: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / DAY);
}

/**
 * Groups sightings per local calendar day of their hour window, newest day first, newest sighting
 * first inside a day. Sightings with an invalid date are left out.
 */
export function groupSightingsByDay(sightings: readonly Sighting[], now: Date = new Date()): SightingDayGroup[] {
  const today = startOfDay(now);
  const groups = new Map<string, SightingDayGroup>();
  const sorted = [...sightings].sort((a, b) => compareNewestFirst(a, b));
  for (const sighting of sorted) {
    const date = toDate(sighting.spottedHour);
    if (date === undefined) continue;
    const day = startOfDay(date);
    const key = dayKeyOf(day);
    const existing = groups.get(key);
    if (existing !== undefined) {
      existing.sightings.push(sighting);
      continue;
    }
    const age = daysBetween(today, day);
    const kind: SightingDayKind = age <= 0 ? 'today' : age === 1 ? 'yesterday' : 'earlier';
    groups.set(key, { dayKey: key, kind, dayStart: day.toISOString(), sightings: [sighting] });
  }
  return [...groups.values()];
}

/** Newest first: by hour window, then by creation (ties within the same hour). */
export function compareNewestFirst(a: Sighting, b: Sighting): number {
  const byHour = (toDate(b.spottedHour)?.getTime() ?? 0) - (toDate(a.spottedHour)?.getTime() ?? 0);
  if (byHour !== 0) return byHour;
  return (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0);
}

/** Flattens feed pages into one list without duplicates (a realtime insert can overlap a page). */
export function mergeSightingPages(pages: readonly (readonly Sighting[])[]): Sighting[] {
  const seen = new Set<string>();
  const merged: Sighting[] = [];
  for (const page of pages) {
    for (const sighting of page) {
      if (seen.has(sighting.id)) continue;
      seen.add(sighting.id);
      merged.push(sighting);
    }
  }
  return merged;
}

/** Cursor for the next page (`createdAt` of the oldest item), or undefined when this was the last page. */
export function nextSightingsCursor(
  page: readonly Sighting[],
  pageSize: number = SIGHTINGS_PAGE_SIZE,
): string | undefined {
  if (page.length < pageSize) return undefined;
  return page[page.length - 1]?.createdAt;
}

/** Number of unread sightings in a list. */
export function countUnread(sightings: readonly Sighting[]): number {
  return sightings.filter((sighting) => !sighting.isRead).length;
}

/** Marks one sighting (or, without an id, every sighting) as read; returns a new list. */
export function markRead(sightings: readonly Sighting[], sightingId?: string): Sighting[] {
  return sightings.map((sighting) =>
    sightingId === undefined || sighting.id === sightingId ? { ...sighting, isRead: true } : sighting,
  );
}
