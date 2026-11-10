/**
 * Pure build-time helpers of scripts/postbuild-web.mjs (SPEC §13.1, §13.2): the precache list, the
 * inline-script scan and the security headers. No Node APIs here, so the unit test
 * (cypress/unit/trust/webBuild.cy.ts) can import it in the browser.
 */
import { ROUTE_TEMPLATES } from './swHelpers.mjs';

/** App-shell routes that every build must contain (they are precached; install fails loudly). */
export const REQUIRED_ROUTES = [
  '/',
  '/login',
  '/register',
  '/privacy',
  '/spot',
  '/progress',
  '/owners',
  '/profile',
  '/trust',
  '/capture',
  '/garage/new',
];

const ENTRY_BUNDLE = /^_expo\/static\/js\/web\/entry-([0-9a-zA-Z]+)\.js$/;

/** dist-relative path of a route's pre-rendered page: `/` → `index.html`, `/a/b` → `a/b.html`. */
export function htmlFileOf(route) {
  return route === '/' ? 'index.html' : `${route.slice(1)}.html`;
}

/** The entry bundle hash (the build id), or undefined when the export has no entry bundle. */
export function buildIdOf(files) {
  for (const file of files) {
    const match = ENTRY_BUNDLE.exec(file);
    if (match !== null) return match[1];
  }
  return undefined;
}

/**
 * Everything the service worker precaches, as URLs, from the list of dist-relative files (posix
 * separators). Returns the missing required routes separately so the build can fail on them.
 */
export function buildPrecache(files) {
  const present = new Set(files);
  const urls = new Set();
  const missing = [];

  for (const route of REQUIRED_ROUTES) {
    if (present.has(htmlFileOf(route))) urls.add(route);
    else missing.push(route);
  }
  for (const file of files) {
    // Album pages and collection pages (pre-rendered by generateStaticParams), not their templates.
    const page = /^album\/(?:collection\/)?([^/[\]]+)\.html$/.exec(file);
    if (page !== null) urls.add(`/${file.slice(0, -'.html'.length)}`);
    if (/^_expo\/static\/(js\/web\/[^/]+\.js|css\/[^/]+\.css)$/.test(file)) urls.add(`/${file}`);
    if (/^assets\/.+\.ttf$/.test(file)) urls.add(`/${file}`);
    if (/^icons\/[^/]+\.png$/.test(file)) urls.add(`/${file}`);
  }
  // Template shells of the dynamic routes, so an unseen /details/<id> still opens offline.
  for (const template of ROUTE_TEMPLATES) {
    if (template.includes('[') && present.has(htmlFileOf(template))) urls.add(template);
  }
  for (const file of ['manifest.json', 'favicon.ico']) {
    if (present.has(file)) urls.add(`/${file}`);
  }
  return { precache: [...urls].sort(), missing };
}

/**
 * The inline scripts of an HTML page (their exact text, for hashing), plus problems the CSP cannot
 * allow by hash: inline event handlers and `javascript:` URLs.
 */
export function scanInlineScripts(html) {
  const scripts = [];
  const problems = [];
  const scriptTag = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let match = scriptTag.exec(html);
  while (match !== null) {
    const attributes = match[1];
    const body = match[2];
    const hasSrc = /\ssrc\s*=/.test(` ${attributes}`);
    if (hasSrc && body.trim().length > 0) problems.push('a <script src> with an inline body');
    if (!hasSrc && body.length > 0) scripts.push(body);
    match = scriptTag.exec(html);
  }
  const opened = (html.match(/<script\b/gi) ?? []).length;
  const closed = (html.match(/<\/script\s*>/gi) ?? []).length;
  if (opened !== closed) problems.push('an unclosed <script> tag');
  if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(html)) problems.push('an inline event handler attribute (on…=)');
  if (/(href|src|action)\s*=\s*["']?\s*javascript:/i.test(html)) problems.push('a javascript: URL');
  return { scripts, problems };
}

/** Fallback Supabase host when the build cannot tell which project it talks to. */
export const ANY_SUPABASE_HOST = '*.supabase.co';

/**
 * The one Supabase project host (`<ref>.supabase.co`) the bundle talks to, found in the bundle text.
 * Undefined when there is none or more than one, so the caller falls back to ANY_SUPABASE_HOST.
 */
export function supabaseHostIn(texts) {
  const hosts = new Set();
  for (const text of texts) {
    for (const match of text.matchAll(/https:\/\/([a-z0-9-]{8,40})\.supabase\.co(?![a-z0-9.-])/g))
      hosts.add(`${match[1]}.supabase.co`);
  }
  return hosts.size === 1 ? [...hosts][0] : undefined;
}

/**
 * The Content-Security-Policy of SPEC §13.2 for the given `'sha256-…'` sources. `supabaseHost` pins
 * connect-src and img-src to Redline's own project, so injected script cannot send data to another
 * Supabase project.
 */
export function buildCsp(hashSources, supabaseHost = ANY_SUPABASE_HOST) {
  const scriptSrc = ["'self'", ...[...new Set(hashSources)].sort()].join(' ');
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://${supabaseHost}`,
    "font-src 'self' data:",
    // data: and blob: stay on the device (they cannot send anything anywhere).
    `connect-src 'self' data: blob: https://${supabaseHost} wss://${supabaseHost}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

/** Security headers for every response (SPEC §13.2); the CSP is added by the build. */
export const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self), microphone=()' },
];

/** Source pattern of "every response" per host: Vercel uses path-to-regexp, `serve` uses globs. */
export const ALL_SOURCES = { vercel: '/(.*)', serve: '**' };

/**
 * A copy of a vercel.json / serve.json config with the CSP added to the catch-all header rule, and
 * without rewrites whose destination page does not exist in this export.
 */
export function finishHostConfig(config, flavor, csp, files) {
  const present = new Set(files);
  const allSource = ALL_SOURCES[flavor];
  const headers = (config.headers ?? []).map((rule) => {
    if (rule.source !== allSource) return rule;
    const others = rule.headers.filter((header) => header.key.toLowerCase() !== 'content-security-policy');
    return { ...rule, headers: [{ key: 'Content-Security-Policy', value: csp }, ...others] };
  });
  if (!headers.some((rule) => rule.source === allSource)) {
    headers.push({ source: allSource, headers: [{ key: 'Content-Security-Policy', value: csp }, ...SECURITY_HEADERS] });
  }
  const rewrites = (config.rewrites ?? []).filter((rewrite) => {
    const page = rewrite.destination.endsWith('.html') ? rewrite.destination : `${rewrite.destination}.html`;
    return present.has(page.replace(/^\//, ''));
  });
  return { ...config, headers, rewrites };
}
