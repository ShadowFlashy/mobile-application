/*
 * Redline service worker (hand-written, like the course's PWA demo).
 *
 * - App shell (HTML pages, manifest, icons) is precached on install, so the PWA opens offline.
 * - Hashed bundles in /_expo/static are cached on first use (cache first: their names change on every build).
 * - Pages use network first, with the cached copy as offline fallback.
 * - Requests to other origins (Supabase API, signed photo URLs) are never cached: they contain
 *   personal data and must always be fresh.
 * Bump CACHE_VERSION when the caching strategy changes; old caches are removed on activate.
 */
const CACHE_VERSION = 'redline-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const APP_SHELL = [
  '/',
  '/login',
  '/register',
  '/spot',
  '/owners',
  '/profile',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // Cache what is available; one missing file must not break the installation.
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_expo/static/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/')
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    // Offline on a page that was never opened: fall back to the app shell, the router takes over.
    const shell = await caches.match('/');
    if (shell) return shell;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
