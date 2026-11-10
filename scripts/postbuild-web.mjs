#!/usr/bin/env node
/**
 * Runs after `expo export -p web` (SPEC §13.1, §13.2).
 *
 * 1. Static hosts (Vercel, `serve`) show `404.html` for unknown URLs, so the app's own not-found
 *    screen is copied there.
 * 2. Expo writes assets that come from packages (the Ionicons and Barlow fonts, navigation icons) to
 *    `dist/assets/node_modules/...`. Vercel never uploads folders called `node_modules`, so those
 *    files would 404 in production. They are moved to `dist/assets/vendor/...` and every reference
 *    in the bundle and HTML is rewritten.
 * 3. The service worker template (public/sw.js → dist/sw.js) gets this build's id (the entry bundle
 *    hash), its precache list and the helpers of scripts/lib/swHelpers.mjs.
 * 4. Every inline <script> of every page is hashed into a Content-Security-Policy, written into
 *    `dist/vercel.json` (Vercel) and `dist/serve.json` (local `serve dist`). The build fails on an
 *    inline script the CSP cannot allow by hash (event handler attributes, javascript: URLs).
 */
import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { Script } from 'node:vm';
import * as swHelpers from './lib/swHelpers.mjs';
import {
  ANY_SUPABASE_HOST,
  buildCsp,
  buildIdOf,
  buildPrecache,
  finishHostConfig,
  scanInlineScripts,
  supabaseHostIn,
} from './lib/webBuild.mjs';

const root = process.cwd();
const dist = join(root, 'dist');
const notFound = join(dist, '+not-found.html');

function fail(message) {
  console.error(`postbuild-web: ${message}`);
  process.exit(1);
}

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

/** dist-relative paths with forward slashes (also on Windows). */
function distFiles() {
  return listFiles(dist).map((file) => relative(dist, file).split(sep).join('/'));
}

// 1. 404 page ---------------------------------------------------------------------------------
if (!existsSync(notFound)) fail('dist/+not-found.html is missing; run `expo export -p web` first.');
copyFileSync(notFound, join(dist, '404.html'));
console.log('postbuild-web: copied +not-found.html to 404.html');

// 2. Package assets out of node_modules -------------------------------------------------------
const packageAssets = join(dist, 'assets', 'node_modules');
const vendorAssets = join(dist, 'assets', 'vendor');
const TEXT_FILES = new Set(['.js', '.html', '.css', '.json']);
const NODE_MODULES_URL = /\/assets\/node_modules(?=[/"'])/g;

if (existsSync(packageAssets)) {
  cpSync(packageAssets, vendorAssets, { recursive: true });
  rmSync(packageAssets, { recursive: true, force: true });

  let rewritten = 0;
  for (const file of listFiles(dist)) {
    if (!TEXT_FILES.has(extname(file))) continue;
    const source = readFileSync(file, 'utf8');
    if (!NODE_MODULES_URL.test(source)) continue;
    NODE_MODULES_URL.lastIndex = 0;
    writeFileSync(file, source.replace(NODE_MODULES_URL, '/assets/vendor'));
    rewritten += 1;
  }

  const leftovers = listFiles(dist).filter(
    (file) => TEXT_FILES.has(extname(file)) && readFileSync(file, 'utf8').includes('/assets/node_modules'),
  );
  if (leftovers.length > 0) fail(`references to /assets/node_modules remain in ${leftovers.join(', ')}`);
  console.log(`postbuild-web: moved package assets to assets/vendor and rewrote ${rewritten} file(s)`);
}

// 3. Service worker ---------------------------------------------------------------------------
const files = distFiles();
const buildId = buildIdOf(files);
if (buildId === undefined) fail('no entry bundle (_expo/static/js/web/entry-*.js) in dist');
const { precache, missing } = buildPrecache(files);
if (missing.length > 0) fail(`the app shell is missing pre-rendered pages for ${missing.join(', ')}`);

const swPath = join(dist, 'sw.js');
if (!existsSync(swPath)) fail('dist/sw.js is missing (public/sw.js is the template)');
const helperSource = [
  swHelpers.templateKey,
  swHelpers.isPhotoUrl,
  swHelpers.photoCacheKey,
  swHelpers.isStaticAssetPath,
  swHelpers.isObsoleteCache,
  swHelpers.overflowCount,
]
  .map((helper) => helper.toString())
  .join('\n\n');
const PLACEHOLDERS = [
  ["'__BUILD_ID__'", JSON.stringify(buildId)],
  ['[/* __PRECACHE__ */]', JSON.stringify(precache)],
  ['[/* __ROUTE_TEMPLATES__ */]', JSON.stringify(swHelpers.ROUTE_TEMPLATES)],
  ['/* __SW_HELPERS__ */', helperSource],
];
let worker = readFileSync(swPath, 'utf8');
for (const [placeholder, value] of PLACEHOLDERS) {
  if (!worker.includes(placeholder)) fail(`public/sw.js has no ${placeholder} placeholder`);
  worker = worker.replace(placeholder, () => value);
}
if (PLACEHOLDERS.some(([placeholder]) => worker.includes(placeholder))) fail('dist/sw.js still has a placeholder');
try {
  new Script(worker, { filename: 'dist/sw.js' });
} catch (error) {
  fail(`dist/sw.js does not compile: ${error instanceof Error ? error.message : String(error)}`);
}
writeFileSync(swPath, worker);
console.log(`postbuild-web: dist/sw.js is redline-${buildId} with ${precache.length} precached URLs`);

// 4. Content-Security-Policy ------------------------------------------------------------------
const hashes = new Set();
for (const file of files.filter((name) => name.endsWith('.html'))) {
  const { scripts, problems } = scanInlineScripts(readFileSync(join(dist, file), 'utf8'));
  if (problems.length > 0) fail(`${file} has ${problems.join(' and ')}, which the CSP cannot allow by hash`);
  for (const script of scripts) {
    hashes.add(`'sha256-${createHash('sha256').update(script, 'utf8').digest('base64')}'`);
  }
}
const bundleTexts = files.filter((name) => name.endsWith('.js')).map((name) => readFileSync(join(dist, name), 'utf8'));
const supabaseHost = supabaseHostIn(bundleTexts);
if (supabaseHost === undefined) {
  console.warn(`postbuild-web: no single Supabase project URL in the bundle, the CSP allows ${ANY_SUPABASE_HOST}`);
}
const csp = buildCsp([...hashes], supabaseHost ?? ANY_SUPABASE_HOST);

const vercelPath = join(dist, 'vercel.json');
const vercelTemplate = existsSync(vercelPath) ? JSON.parse(readFileSync(vercelPath, 'utf8')) : {};
writeFileSync(vercelPath, `${JSON.stringify(finishHostConfig(vercelTemplate, 'vercel', csp, files), null, 2)}\n`);
const serveTemplate = JSON.parse(readFileSync(join(root, 'serve.json'), 'utf8'));
writeFileSync(
  join(dist, 'serve.json'),
  `${JSON.stringify(finishHostConfig(serveTemplate, 'serve', csp, files), null, 2)}\n`,
);
console.log(
  `postbuild-web: CSP with ${hashes.size} inline-script hash(es) written to dist/vercel.json and dist/serve.json`,
);
