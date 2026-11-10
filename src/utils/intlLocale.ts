/**
 * The Intl locale for an app language. The English copy is British ("colour", "licence"), so dates
 * read "9 Nov 2026, 14:32" rather than the en-US "Nov 9, 2026, 2:32 PM"; Dutch follows Belgium.
 */
export function intlLocale(language: string): string {
  const base = language.toLowerCase().split('-')[0];
  if (base === 'en') return 'en-GB';
  if (base === 'nl') return 'nl-BE';
  return language;
}
