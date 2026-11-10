/* global templateKey, isPhotoUrl, photoCacheKey, isStaticAssetPath, isObsoleteCache, overflowCount */
/*
 * Redline service worker (SPEC §13.1). This file is a TEMPLATE: scripts/postbuild-web.mjs writes the
 * finished worker to dist/sw.js. It fills in
 *   - __BUILD_ID__: the entry bundle hash, so every build gets its own caches (redline-<hash>-*);
 *   - __PRECACHE__: the app shell (routes, album and collection pages, dynamic-route templates), the
 *     entry bundle, the vendor fonts, the icons and the manifest;
 *   - __ROUTE_TEMPLATES__ and __SW_HELPERS__: the pure helpers of scripts/lib/swHelpers.mjs (unit
 *     tested in cypress/unit/trust/sw.cy.ts).
 *
 * Updates never take over by surprise: a new worker waits until the page posts SKIP_WAITING (the
 * user tapped "Reload" on the update toast). Spot photos are cached without their token and
 * cleared on logout (CLEAR_USER_CACHES). Supabase API responses are never cached.
 */
const BUILD_ID = '__BUILD_ID__';
const PRECACHE = [/* __PRECACHE__ */];
const ROUTE_TEMPLATES = [/* __ROUTE_TEMPLATES__ */];
const PHOTO_CACHE = 'redline-photos';
const PHOTO_CACHE_MAX = 200;

const CACHE_VERSION = `redline-${BUILD_ID}`;
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

/* __SW_HELPERS__ */

self.addEventListener('install', (event) => {
  // addAll fails loudly: a broken precache must not install a half-working offline app.
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => isObsoleteCache(name, BUILD_ID)).map((name) => caches.delete(name))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;
  if (type === 'SKIP_WAITING') {
    void self.skipWaiting();
  } else if (type === 'CLEAR_USER_CACHES') {
    // Logout or account deletion: the next person on this device must not see these photos.
    event.waitUntil(caches.delete(PHOTO_CACHE));
  }
});

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    // Offline on a dynamic route that was never opened: its pre-rendered template shell.
    const template = templateKey(new URL(request.url).pathname, ROUTE_TEMPLATES);
    if (template !== undefined) {
      const shell = await caches.match(template);
      if (shell) return shell;
    }
    const home = await caches.match('/');
    if (home) return home;
    throw error;
  }
}

async function cacheFirstStatic(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function trimPhotoCache(cache) {
  const keys = await cache.keys();
  const excess = overflowCount(keys.length, PHOTO_CACHE_MAX);
  // Keys come back in insertion order: delete the oldest first.
  await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
}

async function cacheFirstPhoto(request) {
  const key = photoCacheKey(request.url);
  const cache = await caches.open(PHOTO_CACHE);
  const cached = await cache.match(key);
  if (cached) return cached;
  const response = await fetch(new Request(request.url, { mode: 'cors', credentials: 'omit' }));
  if (response.ok) {
    await cache.put(key, response.clone());
    await trimPhotoCache(cache);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (isPhotoUrl(request.url)) {
    event.respondWith(cacheFirstPhoto(request));
    return;
  }
  // Every other cross-origin request (Supabase API, auth, functions) goes straight to the network.
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
  } else if (isStaticAssetPath(url.pathname)) {
    event.respondWith(cacheFirstStatic(request));
  }
});
