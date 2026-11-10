import type { Sighting } from '../../../src/types/OwnerCar';
import {
  compareNewestFirst,
  countUnread,
  groupSightingsByDay,
  hourWindowLabel,
  markRead,
  mergeSightingPages,
  nextSightingsCursor,
  SIGHTINGS_PAGE_SIZE,
  truncateToHour,
} from '../../../src/utils/sightings';

/** Local wall-clock time, so the tests pass in every time zone. */
function local(year: number, month: number, day: number, hour: number, minute = 0): string {
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

function sighting(id: string, spottedHour: string, overrides: Partial<Sighting> = {}): Sighting {
  return {
    id,
    ownerCarId: 'car-1',
    carLabel: 'Rosso',
    city: 'Antwerpen',
    spottedHour,
    createdAt: spottedHour,
    isRead: false,
    ...overrides,
  };
}

describe('sightings: hour window', () => {
  it('labels the hour a car was spotted as a one-hour window', () => {
    expect(hourWindowLabel(local(2026, 11, 9, 14), 'en')).to.equal('14:00–15:00');
    expect(hourWindowLabel(local(2026, 11, 9, 14), 'nl')).to.equal('14:00–15:00');
  });

  it('never shows the exact minute, even when the input has one', () => {
    expect(hourWindowLabel(local(2026, 11, 9, 9, 47), 'en')).to.equal('09:00–10:00');
  });

  it('wraps around midnight', () => {
    expect(hourWindowLabel(local(2026, 11, 9, 23), 'en')).to.equal('23:00–00:00');
  });

  it('returns an empty label for an invalid date', () => {
    expect(hourWindowLabel('not a date', 'en')).to.equal('');
  });

  it('truncates a moment to the start of its hour', () => {
    expect(truncateToHour(local(2026, 11, 9, 14, 59))).to.equal(local(2026, 11, 9, 14));
    expect(truncateToHour('nonsense')).to.equal('nonsense');
  });
});

describe('sightings: grouping', () => {
  const now = new Date(2026, 10, 10, 12, 0);

  it('groups per local day, newest day first, as today / yesterday / earlier', () => {
    const groups = groupSightingsByDay(
      [
        sighting('old', local(2026, 11, 3, 10)),
        sighting('today-morning', local(2026, 11, 10, 8)),
        sighting('yesterday', local(2026, 11, 9, 22)),
        sighting('today-noon', local(2026, 11, 10, 11)),
      ],
      now,
    );
    expect(groups.map((group) => group.kind)).to.deep.equal(['today', 'yesterday', 'earlier']);
    expect(groups[0]?.sightings.map((item) => item.id)).to.deep.equal(['today-noon', 'today-morning']);
    expect(groups[1]?.dayKey).to.equal('2026-11-09');
    expect(groups[2]?.dayStart).to.equal(new Date(2026, 10, 3).toISOString());
  });

  it('keeps every sighting exactly once and drops invalid dates', () => {
    const groups = groupSightingsByDay(
      [sighting('a', local(2026, 11, 10, 9)), sighting('broken', 'x'), sighting('b', local(2026, 11, 8, 9))],
      now,
    );
    expect(groups.flatMap((group) => group.sightings.map((item) => item.id))).to.deep.equal(['a', 'b']);
  });

  it('returns no groups for an empty feed', () => {
    expect(groupSightingsByDay([], now)).to.deep.equal([]);
  });

  it('orders ties within the same hour by creation', () => {
    const hour = local(2026, 11, 10, 9);
    const first = sighting('first', hour, { createdAt: local(2026, 11, 10, 9, 5) });
    const second = sighting('second', hour, { createdAt: local(2026, 11, 10, 9, 40) });
    expect([first, second].sort(compareNewestFirst).map((item) => item.id)).to.deep.equal(['second', 'first']);
  });
});

describe('sightings: paging and read state', () => {
  it('merges pages without duplicates (a realtime insert can overlap a page)', () => {
    const a = sighting('a', local(2026, 11, 10, 9));
    const b = sighting('b', local(2026, 11, 10, 8));
    const c = sighting('c', local(2026, 11, 10, 7));
    expect(
      mergeSightingPages([
        [a, b],
        [b, c],
      ]).map((item) => item.id),
    ).to.deep.equal(['a', 'b', 'c']);
  });

  it('asks for a next page only after a full page of 20', () => {
    expect(SIGHTINGS_PAGE_SIZE).to.equal(20);
    const full = Array.from({ length: 20 }, (_, index) =>
      sighting(`s${index}`, local(2026, 11, 10, 9), {
        createdAt: `2026-11-10T09:${String(59 - index).padStart(2, '0')}:00.000Z`,
      }),
    );
    expect(nextSightingsCursor(full)).to.equal('2026-11-10T09:40:00.000Z');
    expect(nextSightingsCursor(full.slice(0, 19))).to.equal(undefined);
    expect(nextSightingsCursor([])).to.equal(undefined);
  });

  it('counts unread sightings and marks one or all as read', () => {
    const list = [sighting('a', local(2026, 11, 10, 9)), sighting('b', local(2026, 11, 10, 8), { isRead: true })];
    expect(countUnread(list)).to.equal(1);
    expect(countUnread(markRead(list, 'a'))).to.equal(0);
    expect(markRead(list, 'b')[0]?.isRead).to.equal(false);
    expect(markRead(list).every((item) => item.isRead)).to.equal(true);
    // Pure: the input is not changed.
    expect(list[0]?.isRead).to.equal(false);
  });
});
