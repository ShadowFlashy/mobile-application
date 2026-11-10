#!/usr/bin/env node
/**
 * Renders every app icon, the splash, the favicon and the PWA icons from ONE master
 * (assets/brand/icon-master.svg) with @resvg/resvg-js (SPEC P0-23, D-16).
 *
 * The master has three marked parts: the shared <defs>, the asphalt backdrop and the BrandMark
 * sticker on its 64 grid. Each target picks a backdrop (full bleed, rounded tile or transparent) and
 * a sticker placement; the placements are checked against the platform safe zones before anything
 * is written, so a maskable or adaptive icon can never be cropped.
 *
 * Idempotent: the output only depends on the master, and files whose bytes did not change are not
 * rewritten. Run with `node scripts/generate-icons.mjs` (`--check` only verifies that every PNG is
 * up to date and exits 1 otherwise).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { CANVAS, fitsCanvas, fitsSafeZone, paintedReach, stickerTransform } from './lib/iconLayout.mjs';

const root = process.cwd();
const masterPath = join(root, 'assets', 'brand', 'icon-master.svg');
const checkOnly = process.argv.includes('--check');

/** Maskable PWA icons keep their content inside a circle of 40 % of the size (W3C manifest spec). */
const MASKABLE_SAFE = 0.4;
/** Android adaptive icons: a 66 dp safe circle on a 108 dp canvas. */
const ADAPTIVE_SAFE = 33 / 108;
/** Corner radius of the "any" PWA tile (squircle-like, like a launcher icon). */
const TILE_RADIUS = 224;

const TILT = -6;
const HERO = { cx: 512, cy: 506, scale: 10, tilt: TILT };
const SAFE = { cx: 512, cy: 512, scale: 9.4, tilt: TILT };

/**
 * Every generated file. `backdrop`: 'full' (asphalt to the edges, no transparency: iOS and maskable
 * icons), 'tile' (asphalt in a rounded square, transparent corners) or 'none' (transparent).
 */
const TARGETS = [
  { file: 'assets/icon.png', size: 1024, backdrop: 'full', placement: HERO },
  {
    file: 'assets/adaptive-icon.png',
    size: 1024,
    backdrop: 'none',
    placement: { cx: 512, cy: 512, scale: 7.4, tilt: TILT },
    safeZone: ADAPTIVE_SAFE,
  },
  { file: 'assets/adaptive-icon-background.png', size: 1024, backdrop: 'full', placement: undefined },
  {
    file: 'assets/splash-icon.png',
    size: 1024,
    backdrop: 'none',
    placement: { cx: 512, cy: 512, scale: 12.4, tilt: TILT },
  },
  { file: 'assets/favicon.png', size: 48, backdrop: 'none', placement: { cx: 512, cy: 512, scale: 14.6, tilt: 0 } },
  { file: 'public/icons/icon-192.png', size: 192, backdrop: 'tile', placement: SAFE },
  { file: 'public/icons/icon-512.png', size: 512, backdrop: 'tile', placement: SAFE },
  { file: 'public/icons/icon-maskable-192.png', size: 192, backdrop: 'full', placement: SAFE, safeZone: MASKABLE_SAFE },
  { file: 'public/icons/icon-maskable-512.png', size: 512, backdrop: 'full', placement: SAFE, safeZone: MASKABLE_SAFE },
  { file: 'public/icons/apple-touch-icon.png', size: 180, backdrop: 'full', placement: HERO },
];

/** Below this output size the hairline minor ticks only add noise. */
const MINOR_TICK_MIN_SIZE = 64;

function part(source, name) {
  const match = new RegExp(`<!-- ${name}:start[^>]*-->([\\s\\S]*?)<!-- ${name}:end -->`).exec(source);
  if (match === null) throw new Error(`generate-icons: the master has no "${name}" part`);
  return match[1].trim();
}

function stickerBody(source) {
  const match = /^<g id="sticker"[^>]*>([\s\S]*)<\/g>$/.exec(part(source, 'sticker'));
  if (match === null) throw new Error('generate-icons: the sticker part must be one <g id="sticker"> element');
  return match[1];
}

function asphaltBody(source) {
  const match = /^<g id="asphalt"[^>]*>([\s\S]*)<\/g>$/.exec(part(source, 'asphalt'));
  if (match === null) throw new Error('generate-icons: the asphalt part must be one <g id="asphalt"> element');
  return match[1];
}

function compose(source, target) {
  const defs = part(source, 'defs');
  let backdrop = '';
  if (target.backdrop === 'full') backdrop = `<g>${asphaltBody(source)}</g>`;
  if (target.backdrop === 'tile') {
    backdrop =
      `<clipPath id="rl-tile"><rect width="${CANVAS}" height="${CANVAS}" rx="${TILE_RADIUS}"/></clipPath>` +
      `<g clip-path="url(#rl-tile)">${asphaltBody(source)}</g>`;
  }
  let sticker = '';
  if (target.placement !== undefined) {
    let body = stickerBody(source);
    if (target.size < MINOR_TICK_MIN_SIZE) body = body.replace(/<g id="minor-ticks"[\s\S]*?<\/g>/, '');
    sticker = `<g transform="${stickerTransform(target.placement)}">${body}</g>`;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">` +
    `${defs}${backdrop}${sticker}</svg>`
  );
}

function validate(target) {
  const { placement } = target;
  if (placement === undefined) return;
  if (!fitsCanvas(placement)) throw new Error(`generate-icons: the sticker does not fit ${target.file}`);
  if (target.safeZone !== undefined && !fitsSafeZone(placement, target.safeZone)) {
    const reach = Math.round(paintedReach(placement));
    throw new Error(`generate-icons: ${target.file} reaches ${reach}px, outside its ${target.safeZone} safe zone`);
  }
}

const master = readFileSync(masterPath, 'utf8');
let written = 0;
let stale = 0;
for (const target of TARGETS) {
  validate(target);
  const svg = compose(master, target);
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: target.size },
    background: 'rgba(0,0,0,0)',
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  const path = join(root, target.file);
  const same = existsSync(path) && Buffer.compare(readFileSync(path), png) === 0;
  if (same) continue;
  if (checkOnly) {
    console.error(`generate-icons: ${target.file} is out of date`);
    stale += 1;
    continue;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, png);
  written += 1;
  console.log(`generate-icons: wrote ${target.file} (${target.size}px)`);
}

if (checkOnly && stale > 0) process.exit(1);
console.log(
  checkOnly
    ? `generate-icons: all ${TARGETS.length} icons are up to date`
    : `generate-icons: ${written} of ${TARGETS.length} icons changed`,
);
