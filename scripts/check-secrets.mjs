#!/usr/bin/env node
/**
 * Pre-commit secret scan (course ch. 18: block commits that contain key-like strings).
 * Usage: node scripts/check-secrets.mjs <files...>   (lint-staged passes the staged files)
 *
 * Fails when a staged file:
 *  - is a real .env file (only .env.example may be committed), or
 *  - contains something that looks like an API key, JWT, private key or Supabase key.
 * Keys belong in the gitignored .env file and are read through process.env.EXPO_PUBLIC_*.
 */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const PATTERNS = [
  { name: 'Supabase secret key', regex: /sb_secret_[A-Za-z0-9_-]{10,}/ },
  { name: 'Supabase publishable key (use .env)', regex: /sb_publishable_(?!your-)[A-Za-z0-9_-]{10,}/ },
  {
    name: 'JSON Web Token (e.g. anon or service_role key)',
    regex: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  },
  { name: 'Private key', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  {
    name: 'Generic API key assignment',
    regex: /(?:api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/i,
  },
];

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
  for (const { name: patternName, regex } of PATTERNS) {
    if (regex.test(content)) problems.push(`${file}: looks like it contains a ${patternName}`);
  }
}

if (problems.length > 0) {
  console.error('\n✖ Secret scan blocked this commit:\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('\nMove keys to .env (gitignored) and read them with process.env.EXPO_PUBLIC_*.\n');
  process.exit(1);
}
