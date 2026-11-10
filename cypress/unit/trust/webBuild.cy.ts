import {
  buildCsp,
  supabaseHostIn,
  buildIdOf,
  buildPrecache,
  finishHostConfig,
  htmlFileOf,
  REQUIRED_ROUTES,
  scanInlineScripts,
  SECURITY_HEADERS,
  type HostConfig,
} from '../../../scripts/lib/webBuild.mjs';

/** A trimmed-down static export, as dist-relative paths. */
const DIST_FILES = [
  ...REQUIRED_ROUTES.map((route) => htmlFileOf(route)),
  '_expo/static/js/web/entry-2c50d2bc6f59.js',
  'album/sports.html',
  'album/[page].html',
  'album/collection/jdm-legends.html',
  'album/collection/[id].html',
  'details/[id].html',
  'garage/[carId].html',
  'garage/[carId]/verify.html',
  'assets/vendor/@expo-google-fonts/barlow/400Regular/Barlow_400Regular.ttf',
  'assets/vendor/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.abc.ttf',
  'assets/images/photo.png',
  'icons/icon-192.png',
  'icons/icon-maskable-512.png',
  'manifest.json',
  'favicon.ico',
  '(app)/index.html',
  '+not-found.html',
  'vercel.json',
];

describe('postbuild: precache list (SPEC §13.1)', () => {
  it('takes the build id from the entry bundle hash', () => {
    expect(buildIdOf(DIST_FILES)).to.equal('2c50d2bc6f59');
    expect(buildIdOf(['index.html'])).to.equal(undefined);
  });

  it('maps routes to their pre-rendered pages', () => {
    expect(htmlFileOf('/')).to.equal('index.html');
    expect(htmlFileOf('/garage/new')).to.equal('garage/new.html');
  });

  it('precaches the app shell, album and collection pages, templates, bundle, fonts, icons and manifest', () => {
    const { precache, missing } = buildPrecache(DIST_FILES);
    expect(missing).to.deep.equal([]);
    expect(precache).to.include.members([
      '/',
      '/login',
      '/privacy',
      '/trust',
      '/capture',
      '/garage/new',
      '/album/sports',
      '/album/collection/jdm-legends',
      '/details/[id]',
      '/garage/[carId]',
      '/garage/[carId]/verify',
      '/album/[page]',
      '/_expo/static/js/web/entry-2c50d2bc6f59.js',
      '/assets/vendor/@expo-google-fonts/barlow/400Regular/Barlow_400Regular.ttf',
      '/icons/icon-192.png',
      '/manifest.json',
      '/favicon.ico',
    ]);
    // never route groups, the 404 page, host config or arbitrary images
    expect(precache.some((url) => url.includes('(app)') || url.includes('not-found'))).to.equal(false);
    expect(precache).not.to.include('/vercel.json');
    expect(precache).not.to.include('/assets/images/photo.png');
    expect(new Set(precache).size).to.equal(precache.length);
  });

  it('reports missing app-shell pages so the build can fail', () => {
    const { missing } = buildPrecache(DIST_FILES.filter((file) => file !== 'trust.html'));
    expect(missing).to.deep.equal(['/trust']);
  });
});

describe('postbuild: inline scripts and CSP (SPEC §13.2)', () => {
  it('collects the exact text of inline scripts and skips external ones', () => {
    const html =
      '<head><script src="/_expo/static/js/web/entry-1.js" defer></script>' +
      '<script type="module">globalThis.__EXPO_ROUTER_HYDRATE__=true;</script></head>';
    expect(scanInlineScripts(html)).to.deep.equal({
      scripts: ['globalThis.__EXPO_ROUTER_HYDRATE__=true;'],
      problems: [],
    });
  });

  it('flags what a hash cannot allow', () => {
    expect(scanInlineScripts('<img src="x.png" onerror="alert(1)">').problems).to.have.length(1);
    expect(scanInlineScripts('<a href="javascript:void(0)">x</a>').problems).to.have.length(1);
    expect(scanInlineScripts('<script>let a = 1;').problems).to.have.length(1);
    expect(scanInlineScripts('<div class="onboarding">only text</div>').problems).to.deep.equal([]);
  });

  it('builds the policy with every hash and the strict directives', () => {
    const csp = buildCsp(["'sha256-b'", "'sha256-a'", "'sha256-a'"]);
    expect(csp).to.contain("script-src 'self' 'sha256-a' 'sha256-b';");
    expect(csp).to.contain("frame-ancestors 'none'");
    expect(csp).to.contain("default-src 'self'");
    expect(csp).to.contain("connect-src 'self' data: blob: https://*.supabase.co wss://*.supabase.co");
    expect(csp).to.contain("img-src 'self' data: blob: https://*.supabase.co");
    expect(csp).not.to.contain('unsafe-eval');
    expect(csp).not.to.match(/script-src[^;]*unsafe-inline/);
  });

  it('pins connect-src and img-src to the one Supabase project of the bundle', () => {
    const host = supabaseHostIn([
      'const a="https://abcdefghijklmnop.supabase.co";',
      'fetch("https://abcdefghijklmnop.supabase.co/rest")',
    ]);
    expect(host).to.equal('abcdefghijklmnop.supabase.co');
    const csp = buildCsp(["'sha256-a'"], host);
    expect(csp).to.contain(
      "connect-src 'self' data: blob: https://abcdefghijklmnop.supabase.co wss://abcdefghijklmnop.supabase.co",
    );
    expect(csp).to.contain("img-src 'self' data: blob: https://abcdefghijklmnop.supabase.co");
    expect(csp).not.to.contain('*.supabase.co');
  });

  it('falls back to every Supabase host when the bundle names none or several projects', () => {
    expect(supabaseHostIn(['no url here'])).to.equal(undefined);
    expect(supabaseHostIn(['https://aaaaaaaaaaaa.supabase.co https://bbbbbbbbbbbb.supabase.co'])).to.equal(undefined);
  });
});

describe('postbuild: host config', () => {
  const csp = buildCsp(["'sha256-a'"]);
  const template: HostConfig = {
    cleanUrls: true,
    rewrites: [
      { source: '/details/:id', destination: '/details/[id]' },
      { source: '/sighting/:id', destination: '/sighting/[id]' },
      { source: '/album/:page', destination: '/album/[page].html' },
    ],
    headers: [
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
      { source: '/(.*)', headers: [...SECURITY_HEADERS] },
    ],
  };

  it('adds the CSP to the catch-all rule and drops rewrites to pages the export does not have', () => {
    const finished = finishHostConfig(template, 'vercel', csp, DIST_FILES);
    const all = finished.headers.find((rule) => rule.source === '/(.*)');
    expect(all?.headers[0]).to.deep.equal({ key: 'Content-Security-Policy', value: csp });
    expect(all?.headers.length).to.equal(SECURITY_HEADERS.length + 1);
    expect(finished.rewrites.map((rewrite) => rewrite.source)).to.deep.equal(['/details/:id', '/album/:page']);
    expect(finished.cleanUrls).to.equal(true);
  });

  it('replaces an old CSP instead of adding a second one', () => {
    const once = finishHostConfig(template, 'vercel', csp, DIST_FILES);
    const twice = finishHostConfig(once, 'vercel', buildCsp(["'sha256-z'"]), DIST_FILES);
    const all = twice.headers.find((rule) => rule.source === '/(.*)');
    const csps = all?.headers.filter((header) => header.key === 'Content-Security-Policy') ?? [];
    expect(csps).to.have.length(1);
    expect(csps[0]?.value).to.contain('sha256-z');
  });

  it('creates the catch-all rule for serve (glob syntax) when the template has none', () => {
    const finished = finishHostConfig({ rewrites: [] }, 'serve', csp, DIST_FILES);
    expect(finished.headers[0]?.source).to.equal('**');
    expect(finished.headers[0]?.headers.map((header) => header.key)).to.include.members([
      'Content-Security-Policy',
      'X-Frame-Options',
      'Permissions-Policy',
    ]);
  });
});

describe('committed host configs (public/vercel.json, serve.json)', () => {
  const ORDER = [
    '/garage/new',
    '/garage/:carId/verify',
    '/garage/:carId',
    '/reveal/:spotId',
    '/sighting/:id',
    '/details/:id',
    '/sticker/:id',
  ];

  it('vercel.json has the security headers, immutable assets and the dynamic rewrites, specific first', () => {
    cy.readFile('public/vercel.json').then((config: Required<HostConfig>) => {
      expect(config.rewrites.slice(0, ORDER.length).map((rewrite) => rewrite.source)).to.deep.equal(ORDER);
      expect(config.rewrites.map((rewrite) => rewrite.source)).to.include.members([
        '/album/collection/:id',
        '/album/:page',
      ]);
      const all = config.headers.find((rule) => rule.source === '/(.*)');
      const value = (key: string) => all?.headers.find((header) => header.key === key)?.value;
      expect(value('Permissions-Policy')).to.equal('camera=(self), geolocation=(self), microphone=()');
      expect(value('X-Frame-Options')).to.equal('DENY');
      expect(value('Cross-Origin-Opener-Policy')).to.equal('same-origin');
      const assets = config.headers.find((rule) => rule.source === '/assets/(.*)');
      expect(assets?.headers[0]?.value).to.equal('public, max-age=31536000, immutable');
    });
  });

  it('serve.json has the same rewrites, pointing at the .html files', () => {
    cy.readFile('serve.json').then((config: Required<HostConfig>) => {
      const sources = config.rewrites.map((rewrite) => rewrite.source.replace('([^/.]+)', ''));
      expect(sources.slice(0, ORDER.length)).to.deep.equal(ORDER);
      config.rewrites.forEach((rewrite) => expect(rewrite.destination).to.match(/\.html$/));
    });
  });
});
