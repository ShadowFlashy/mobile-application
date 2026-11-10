import {
  isObsoleteCache,
  isPhotoUrl,
  isStaticAssetPath,
  overflowCount,
  PHOTO_CACHE,
  PHOTO_CACHE_MAX,
  photoCacheKey,
  ROUTE_TEMPLATES,
  templateKey,
} from '../../../scripts/lib/swHelpers.mjs';

// The pure helpers that scripts/postbuild-web.mjs inlines into dist/sw.js (SPEC §13.1).
describe('service worker: templateKey', () => {
  const cases: [string, string][] = [
    ['/details/abc-123', '/details/[id]'],
    ['/sticker/porsche-911-gt3', '/sticker/[id]'],
    ['/reveal/5f7c', '/reveal/[spotId]'],
    ['/sighting/42', '/sighting/[id]'],
    ['/garage/0b1c2d', '/garage/[carId]'],
    ['/garage/0b1c2d/verify', '/garage/[carId]/verify'],
    ['/share/abc', '/share/[spotId]'],
    ['/album/collection/jdm-legends', '/album/collection/[id]'],
    ['/album/sports', '/album/[page]'],
    ['/details/abc/', '/details/[id]'],
    ['/details/abc.html', '/details/[id]'],
  ];
  cases.forEach(([pathname, expected]) => {
    it(`maps ${pathname} to ${expected}`, () => {
      expect(templateKey(pathname, ROUTE_TEMPLATES)).to.equal(expected);
    });
  });

  it('keeps the static /garage/new page instead of the car template', () => {
    expect(templateKey('/garage/new', ROUTE_TEMPLATES)).to.equal('/garage/new');
    expect(ROUTE_TEMPLATES.indexOf('/garage/new')).to.be.lessThan(ROUTE_TEMPLATES.indexOf('/garage/[carId]'));
  });

  it('returns undefined for static routes and unknown depths', () => {
    expect(templateKey('/', ROUTE_TEMPLATES)).to.equal(undefined);
    expect(templateKey('/profile', ROUTE_TEMPLATES)).to.equal(undefined);
    expect(templateKey('/details', ROUTE_TEMPLATES)).to.equal(undefined);
    expect(templateKey('/details/a/b', ROUTE_TEMPLATES)).to.equal(undefined);
    expect(templateKey('/garage/a/b', ROUTE_TEMPLATES)).to.equal(undefined);
  });
});

describe('service worker: spot photos', () => {
  const signed = 'https://abc.supabase.co/storage/v1/object/sign/spot-photos/1111/2222.jpg?token=eyJhbGciOi.secret.sig';

  it('recognises signed spot-photo URLs only', () => {
    expect(isPhotoUrl(signed)).to.equal(true);
    expect(isPhotoUrl('https://abc.supabase.co/rest/v1/spots?select=*')).to.equal(false);
    expect(isPhotoUrl('https://abc.supabase.co/storage/v1/object/public/other/x.jpg')).to.equal(false);
    expect(isPhotoUrl('not a url')).to.equal(false);
  });

  it('caches photos under their URL without the token', () => {
    const key = photoCacheKey(signed);
    expect(key).to.equal('https://abc.supabase.co/storage/v1/object/sign/spot-photos/1111/2222.jpg');
    expect(key).not.to.contain('token');
    expect(photoCacheKey(signed.replace('secret', 'other'))).to.equal(key);
  });

  it('keeps at most 200 photos, oldest first out', () => {
    expect(PHOTO_CACHE).to.equal('redline-photos');
    expect(PHOTO_CACHE_MAX).to.equal(200);
    expect(overflowCount(150, PHOTO_CACHE_MAX)).to.equal(0);
    expect(overflowCount(200, PHOTO_CACHE_MAX)).to.equal(0);
    expect(overflowCount(203, PHOTO_CACHE_MAX)).to.equal(3);
  });
});

describe('service worker: caches and assets', () => {
  it('deletes the caches of other builds but keeps this build and the photos', () => {
    expect(isObsoleteCache('redline-abc-shell', 'abc')).to.equal(false);
    expect(isObsoleteCache('redline-abc-static', 'abc')).to.equal(false);
    expect(isObsoleteCache('redline-photos', 'abc')).to.equal(false);
    expect(isObsoleteCache('redline-old-shell', 'abc')).to.equal(true);
    expect(isObsoleteCache('redline-v1-shell', 'abc')).to.equal(true);
    expect(isObsoleteCache('redline-abcdef-shell', 'abc')).to.equal(true);
  });

  it('serves hashed bundles, assets, icons and the manifest cache first', () => {
    expect(isStaticAssetPath('/_expo/static/js/web/entry-abc.js')).to.equal(true);
    expect(isStaticAssetPath('/assets/vendor/@expo-google-fonts/barlow/Barlow_400Regular.ttf')).to.equal(true);
    expect(isStaticAssetPath('/icons/icon-192.png')).to.equal(true);
    expect(isStaticAssetPath('/manifest.json')).to.equal(true);
    expect(isStaticAssetPath('/profile')).to.equal(false);
    expect(isStaticAssetPath('/sw.js')).to.equal(false);
  });
});

describe('service worker template (public/sw.js)', () => {
  it('has every placeholder that postbuild fills in and no unconditional skipWaiting', () => {
    cy.readFile('public/sw.js').then((source: string) => {
      expect(source).to.contain("const BUILD_ID = '__BUILD_ID__';");
      expect(source).to.contain('const PRECACHE = [/* __PRECACHE__ */];');
      expect(source).to.contain('const ROUTE_TEMPLATES = [/* __ROUTE_TEMPLATES__ */];');
      expect(source).to.contain('/* __SW_HELPERS__ */');
      expect(source).to.contain('cache.addAll(PRECACHE)');
      // skipWaiting only inside the SKIP_WAITING message handler
      expect(source.match(/skipWaiting\(\)/g) ?? []).to.have.length(1);
      expect(source).to.match(/type === 'SKIP_WAITING'\) \{\s*void self\.skipWaiting\(\);/);
      expect(source).to.contain("type === 'CLEAR_USER_CACHES'");
      expect(source).to.contain("mode: 'cors', credentials: 'omit'");
    });
  });
});
