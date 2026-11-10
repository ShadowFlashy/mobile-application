// PWA platform (SPEC P0-19, P0-23, §13): manifest, theme colours, fonts, the generated service worker
// and the security headers of the production build.
interface Manifest {
  background_color: string;
  theme_color: string;
  icons: { src: string; sizes: string; type: string; purpose: string }[];
  shortcuts: { url: string; icons: { src: string }[] }[];
}

describe('PWA', () => {
  beforeEach(() => {
    cy.stubSupabase();
  });

  it('enforces the CSP connect-src in the browser: photos decode locally, foreign hosts are blocked', () => {
    // Stubbed, so nothing leaves the machine even if the CSP were missing (the test would then fail).
    cy.intercept('GET', 'https://exfil.example/**', { statusCode: 200, body: 'leaked' }).as('foreign');
    cy.intercept('GET', 'https://another-project-ref.supabase.co/**', { statusCode: 200, body: 'leaked' }).as(
      'otherProject',
    );
    cy.visit('/login');
    cy.get('[data-testid="login-screen"]').should('be.visible');
    cy.window().then((win) => {
      const outcome = (url: string) =>
        win.fetch(url).then(
          () => 'reached',
          () => 'blocked',
        );
      return Promise.all([
        outcome('https://exfil.example/steal'),
        outcome('https://another-project-ref.supabase.co/rest/v1/x'),
        outcome('data:text/plain;base64,aGk='),
      ]).then((results) => {
        expect(results).to.deep.equal(['blocked', 'blocked', 'reached']);
      });
    });
    cy.get('@foreign.all').should('have.length', 0);
    cy.get('@otherProject.all').should('have.length', 0);
  });

  it('links the manifest and sets one theme colour per colour scheme', () => {
    cy.visit('/login');
    cy.get('head link[rel="manifest"]').should('have.attr', 'href', '/manifest.json');
    cy.get('head meta[name="theme-color"][media="(prefers-color-scheme: light)"]').should(
      'have.attr',
      'content',
      '#F4F1EA',
    );
    cy.get('head meta[name="theme-color"][media="(prefers-color-scheme: dark)"]').should(
      'have.attr',
      'content',
      '#0D0E11',
    );
    cy.get('head link[rel="apple-touch-icon"]').should('have.attr', 'href', '/icons/apple-touch-icon.png');
  });

  it('serves a Night Session manifest whose icons and shortcut icons are real PNGs', () => {
    cy.request('/manifest.json').then(({ body }: { body: Manifest }) => {
      expect(body.background_color).to.equal('#0D0E11');
      expect(body.theme_color).to.equal('#0D0E11');
      expect(body.icons.map((icon) => icon.purpose)).to.include.members(['any', 'maskable']);
      expect(body.shortcuts.map((shortcut) => shortcut.url)).to.deep.equal(['/spot', '/', '/owners']);
      const icons = new Set([
        ...body.icons.map((icon) => icon.src),
        ...body.shortcuts.flatMap((shortcut) => shortcut.icons.map((icon) => icon.src)),
        '/icons/apple-touch-icon.png',
      ]);
      icons.forEach((src) => {
        cy.request(src).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.contain('image/png');
        });
      });
    });
  });

  it('loads the Barlow faces and the Ionicons font', () => {
    cy.visit('/login');
    cy.get('[data-testid="login-screen"]').should('be.visible');
    // Ionicons registers its face at runtime, when the first icon renders: retry until it is loaded.
    ['16px Barlow_400Regular', '16px BarlowCondensed_700Bold', '16px ionicons'].forEach((face) => {
      cy.document().should((doc) => {
        void doc.fonts.load(face);
        expect(doc.fonts.check(face), face).to.equal(true);
      });
    });
  });

  it('serves a service worker generated for this build', () => {
    cy.request('/sw.js').then(({ body, headers }: { body: string; headers: Record<string, string | string[]> }) => {
      expect(headers['content-type']).to.contain('javascript');
      expect(String(headers['cache-control'])).to.contain('no-cache');
      expect(body).not.to.contain("'__BUILD_ID__'");
      expect(body).not.to.contain('[/* __PRECACHE__ */]');
      expect(body).to.match(/const BUILD_ID = "[0-9a-zA-Z]+";/);
      const listed = /const PRECACHE = (\[[^\n]*\]);/.exec(body);
      expect(listed, 'precache list').not.to.equal(null);
      const precache: string[] = JSON.parse(listed?.[1] ?? '[]');
      expect(precache).to.include.members([
        '/',
        '/login',
        '/privacy',
        '/trust',
        '/capture',
        '/garage/new',
        '/details/[id]',
        '/sticker/[id]',
        '/reveal/[spotId]',
        '/album/sports',
        '/album/collection/italian-exotics',
        '/manifest.json',
        '/icons/icon-maskable-512.png',
      ]);
      expect(precache.some((url) => /^\/_expo\/static\/js\/web\/entry-.+\.js$/.test(url))).to.equal(true);
      expect(precache.some((url) => url.endsWith('.ttf'))).to.equal(true);
      // Every precached URL loads, or the install would fail.
      precache.forEach((url) => {
        cy.request({ url, failOnStatusCode: false }).its('status').should('equal', 200);
      });
    });
  });

  it('registers the service worker in the production build', () => {
    cy.visit('/login');
    cy.window()
      .then((win) => win.navigator.serviceWorker.ready)
      .its('active.scriptURL')
      .should('match', /\/sw\.js$/);
  });

  it('sends the security headers, with a CSP that allows only hashed inline scripts', () => {
    cy.request('/login').then(({ headers }) => {
      const csp = String(headers['content-security-policy']);
      expect(csp).to.contain("frame-ancestors 'none'");
      expect(csp).to.match(/script-src 'self'( 'sha256-[A-Za-z0-9+/=]+')+;/);
      expect(csp).not.to.contain('unsafe-eval');
      expect(headers['x-frame-options']).to.equal('DENY');
      expect(headers['cross-origin-opener-policy']).to.equal('same-origin');
      expect(String(headers['permissions-policy'])).to.contain('geolocation=(self)');
    });
  });
});
