import { DAY, HOUR, MINUTE } from '../constants/time';
import { intlLocale } from './intlLocale';

/**
 * Date formatting with the Intl API in the user's language (course ch. 20: never format dates by hand).
 */

function toDate(iso: string): Date | undefined {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** "9 Nov 2026" / "9 nov 2026" */
export function formatDate(iso: string, locale: string): string {
  const date = toDate(iso);
  if (date === undefined) return '';
  return new Intl.DateTimeFormat(intlLocale(locale), { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

/** "5 minutes ago" / "5 minuten geleden", falling back to the date after a week. */
export function formatRelativeDate(iso: string, locale: string, now: Date = new Date()): string {
  const date = toDate(iso);
  if (date === undefined) return '';
  const diff = now.getTime() - date.getTime();
  // Hermes (Android) does not implement Intl.RelativeTimeFormat yet: show the date instead.
  if (typeof Intl.RelativeTimeFormat !== 'function' || diff >= 7 * DAY) return formatDate(iso, locale);

  const relative = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: 'auto' });
  if (diff < MINUTE) return relative.format(0, 'second');
  if (diff < HOUR) return relative.format(-Math.floor(diff / MINUTE), 'minute');
  if (diff < DAY) return relative.format(-Math.floor(diff / HOUR), 'hour');
  return relative.format(-Math.floor(diff / DAY), 'day');
}
