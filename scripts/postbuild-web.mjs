#!/usr/bin/env node
/**
 * Runs after `expo export -p web`: static hosts (Vercel, `serve`) show `404.html` for unknown URLs,
 * so the app's own not-found screen is copied there.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const notFound = join(dist, '+not-found.html');

if (!existsSync(notFound)) {
  console.error('postbuild-web: dist/+not-found.html is missing; run `expo export -p web` first.');
  process.exit(1);
}
copyFileSync(notFound, join(dist, '404.html'));
console.log('postbuild-web: copied +not-found.html to 404.html');
