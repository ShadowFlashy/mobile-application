#!/usr/bin/env node
/**
 * Live smoke test of a deployed (or locally served) PWA build (SPEC §13.3, P0-19, P0-23).
 *
 *   node scripts/smoke-live.mjs [baseUrl]        default: https://redline-spotter.vercel.app
 *
 * It fetches `/`, collects every `/_expo/…` and `/assets/…` URL referenced by the HTML and by the
 * entry bundle, the manifest and its icons, `/sw.js` and everything the service worker precaches,
 * and checks each for HTTP 200 with the expected content type (`font/ttf` for fonts, `image/png` for
 * icons). It also checks the security headers of the page. Exit code 1 on any failure.
 * It only sends anonymous GET requests: no login, no API calls.
 */
const DEFAULT_BASE_URL = 'https://redline-spotter.vercel.app';
const TIMEOUT_MS = 20000;
const CONCURRENCY = 8;

const baseUrl = (process.argv[2] ?? DEFAULT_BASE_URL).replace(/\/+$/, '');

/** Expected content type (prefix, lower case) per file extension. */
const CONTENT_TYPES = {
  '.js': ['application/javascript', 'text/javascript'],
  '.mjs': ['application/javascript', 'text/javascript'],
  '.css': ['text/css'],
  '.ttf': ['font/ttf'],
  '.otf': ['font/otf'],
  '.woff': ['font/woff'],
  '.woff2': ['font/woff2'],
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.svg': ['image/svg+xml'],
  '.ico': ['image/x-icon', 'image/vnd.microsoft.icon'],
  '.json': ['application/json', 'application/manifest+json'],
  '.html': ['text/html'],
};

const failures = [];
let checked = 0;

function extensionOf(path) {
  const clean = path.split(/[?#]/)[0];
  const match = /\.[a-z0-9]+$/i.exec(clean);
  return match === null ? '.html' : match[0].toLowerCase();
}

async function get(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${baseUrl}${path}`, { redirect: 'follow', signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Fetches a path, checks status and content type, and returns its body text when asked. */
async function check(path, { expectType, readBody = false } = {}) {
  checked += 1;
  try {
    const response = await get(path);
    const type = (response.headers.get('content-type') ?? '').toLowerCase();
    const expected = expectType ?? CONTENT_TYPES[extensionOf(path)] ?? [];
    if (response.status !== 200) {
      failures.push(`${path}: HTTP ${response.status}`);
    } else if (expected.length > 0 && !expected.some((prefix) => type.startsWith(prefix))) {
      failures.push(`${path}: content type "${type}", expected ${expected.join(' or ')}`);
    }
    if (readBody) return { text: await response.text(), headers: response.headers };
    await response.arrayBuffer();
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
  return undefined;
}

async function checkAll(paths) {
  const queue = [...paths];
  async function worker() {
    for (let path = queue.shift(); path !== undefined; path = queue.shift()) await check(path);
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

/** Same-origin URLs under /_expo/ and /assets/ in a text (HTML attributes or bundle string literals). */
function referencedAssets(text) {
  const found = new Set();
  for (const match of text.matchAll(/["'`(=](\/(?:_expo|assets)\/[^"'`\s)<>]+)/g)) {
    found.add(match[1].replace(/&amp;/g, '&'));
  }
  return found;
}

function checkSecurityHeaders(headers) {
  const csp = headers.get('content-security-policy') ?? '';
  if (!csp.includes("frame-ancestors 'none'")) failures.push("/: no CSP with frame-ancestors 'none'");
  if (!/script-src 'self'/.test(csp)) failures.push("/: the CSP has no script-src 'self'");
  if ((headers.get('x-frame-options') ?? '').toUpperCase() !== 'DENY') failures.push('/: X-Frame-Options is not DENY');
  if (!(headers.get('permissions-policy') ?? '').includes('geolocation=(self)'))
    failures.push('/: Permissions-Policy does not allow geolocation=(self)');
  if ((headers.get('x-content-type-options') ?? '') !== 'nosniff')
    failures.push('/: X-Content-Type-Options is not nosniff');
}

async function main() {
  console.log(`smoke-live: checking ${baseUrl}`);
  const home = await check('/', { expectType: ['text/html'], readBody: true });
  if (home === undefined) return;
  checkSecurityHeaders(home.headers);

  const assets = referencedAssets(home.text);
  const entry = [...assets].find((path) => /^\/_expo\/static\/js\/web\/entry-[^/]+\.js$/.test(path));
  if (entry === undefined) {
    failures.push('/: no entry bundle (/_expo/static/js/web/entry-*.js) referenced');
  } else {
    assets.delete(entry);
    const bundle = await check(entry, { readBody: true });
    if (bundle !== undefined) for (const path of referencedAssets(bundle.text)) assets.add(path);
  }

  const manifest = await check('/manifest.json', { readBody: true });
  const icons = new Set();
  if (manifest !== undefined) {
    try {
      const parsed = JSON.parse(manifest.text);
      for (const icon of parsed.icons ?? []) icons.add(icon.src);
      for (const shortcut of parsed.shortcuts ?? []) for (const icon of shortcut.icons ?? []) icons.add(icon.src);
      if (icons.size === 0) failures.push('/manifest.json: no icons');
    } catch {
      failures.push('/manifest.json: not valid JSON');
    }
  }

  const worker = await check('/sw.js', { readBody: true });
  const precache = new Set();
  if (worker !== undefined) {
    if (worker.text.includes("'__BUILD_ID__'") || worker.text.includes('[/* __PRECACHE__ */]'))
      failures.push('/sw.js: the template was never finished');
    const listed = /const PRECACHE = (\[[^\n]*\]);/.exec(worker.text);
    if (listed === null) {
      failures.push('/sw.js: no precache list');
    } else {
      // install fails when one precached URL fails, so every one of them must load
      for (const path of JSON.parse(listed[1])) precache.add(path);
    }
  }

  for (const icon of icons) {
    await check(icon, { expectType: ['image/png'] });
  }
  await checkAll([...assets]);
  await checkAll([...precache].filter((path) => !assets.has(path) && !icons.has(path) && path !== entry));
}

await main();
if (failures.length > 0) {
  console.error(`smoke-live: ${failures.length} of ${checked} checks FAILED`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`smoke-live: all ${checked} checks passed`);
