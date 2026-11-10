/**
 * Pure helpers of the service worker (SPEC §13.1). They run in two places:
 * - inside `dist/sw.js`: scripts/postbuild-web.mjs inlines their source (Function#toString), so every
 *   function here must be self-contained (no imports, no references to other module-level values);
 * - in the unit test cypress/unit/trust/sw.cy.ts.
 */

/** Name of the runtime cache for spot photos. Survives updates, cleared on logout. */
export const PHOTO_CACHE = 'redline-photos';

/** At most this many photos are kept; the oldest go first. */
export const PHOTO_CACHE_MAX = 200;

/**
 * App-shell templates of the dynamic routes (the pre-rendered `[param].html` pages), most specific
 * first. A static sibling such as `/garage/new` is listed before the template that would catch it.
 */
export const ROUTE_TEMPLATES = [
  '/garage/new',
  '/garage/[carId]/verify',
  '/garage/[carId]',
  '/reveal/[spotId]',
  '/sighting/[id]',
  '/details/[id]',
  '/sticker/[id]',
  '/share/[spotId]',
  '/album/collection/[id]',
  '/album/[page]',
];

/**
 * The template key of a pathname, e.g. `/details/abc` → `/details/[id]`; undefined when no
 * template matches. Trailing slashes and a `.html` suffix are ignored.
 */
export function templateKey(pathname, templates) {
  const clean = pathname.replace(/\.html$/, '').replace(/\/+$/, '');
  const parts = clean.split('/').filter((part) => part.length > 0);
  for (const template of templates) {
    const pattern = template.split('/').filter((part) => part.length > 0);
    if (pattern.length !== parts.length) continue;
    const matches = pattern.every((segment, index) => {
      const isParam = segment.startsWith('[') && segment.endsWith(']');
      return isParam ? parts[index].length > 0 : segment === parts[index];
    });
    if (matches) return template;
  }
  return undefined;
}

/** True for a signed Supabase Storage URL of a spot photo. */
export function isPhotoUrl(url) {
  try {
    return new URL(url).pathname.includes('/storage/v1/object/sign/spot-photos/');
  } catch {
    return false;
  }
}

/** Cache key of a photo: the URL without its query, so the short-lived token is never stored as a key. */
export function photoCacheKey(url) {
  const parsed = new URL(url);
  return `${parsed.origin}${parsed.pathname}`;
}

/** Same-origin files with hashed or stable names that are served cache first. */
export function isStaticAssetPath(pathname) {
  return (
    pathname.startsWith('/_expo/static/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/icons/') ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico'
  );
}

/** True for a cache that an activating worker of `buildId` must delete. */
export function isObsoleteCache(name, buildId) {
  return name !== 'redline-photos' && !name.startsWith(`redline-${buildId}-`);
}

/** How many of the oldest entries to delete so a cache of `count` entries holds at most `max`. */
export function overflowCount(count, max) {
  return Math.max(0, count - max);
}
