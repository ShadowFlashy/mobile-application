#!/usr/bin/env node
/**
 * Pre-commit secret scan (course ch. 18: block commits that contain key-like strings).
 * Usage: node scripts/check-secrets.mjs <files...>   (lint-staged passes the staged files)
 *
 * Fails when a staged file:
 *  - is a real .env file (only .env.example may be committed), or
 *  - contains something that looks like an API key, JWT, private key, Supabase key or Cloudflare
 *    token / account id (the Co-Driver secrets, golden rule 1).
 * Keys belong in the gitignored .env file and are read through process.env.EXPO_PUBLIC_*.
 */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { findSecrets } from './lib/secretPatterns.mjs';

const files = process.argv.slice(2);
const problems = [];

for (const file of files) {
  const name = basename(file);
  if (/^\.env(\..+)?$/.test(name) && name !== '.env.example') {
    problems.push(`${file}: environment files with real values must never be committed`);
    continue;
  }
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue; // deleted or binary file
  }
  for (const patternName of findSecrets(content)) {
    problems.push(`${file}: looks like it contains a ${patternName}`);
  }
}

if (problems.length > 0) {
  console.error('\n✖ Secret scan blocked this commit:\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('\nMove keys to .env (gitignored) and read them with process.env.EXPO_PUBLIC_*.\n');
  process.exit(1);
}
