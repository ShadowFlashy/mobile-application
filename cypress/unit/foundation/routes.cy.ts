import { routes } from '../../../src/constants/routes';

/** Every route file of SPEC §5 (plus the Appendix E collection page). */
const ROUTE_FILES = [
  'app/_layout.tsx',
  'app/_layout.web.tsx',
  'app/login.tsx',
  'app/register.tsx',
  'app/privacy.tsx',
  'app/onboarding.tsx',
  'app/+not-found.tsx',
  'app/(app)/_layout.tsx',
  'app/(app)/(tabs)/_layout.tsx',
  'app/(app)/(tabs)/index.tsx',
  'app/(app)/(tabs)/progress.tsx',
  'app/(app)/(tabs)/spot.tsx',
  'app/(app)/(tabs)/owners.tsx',
  'app/(app)/(tabs)/profile.tsx',
  'app/(app)/capture.tsx',
  'app/(app)/reveal/[spotId].tsx',
  'app/(app)/album/[page].tsx',
  'app/(app)/album/collection/[id].tsx',
  'app/(app)/sticker/[id].tsx',
  'app/(app)/details/[id].tsx',
  'app/(app)/garage/new.tsx',
  'app/(app)/garage/[carId]/index.tsx',
  'app/(app)/garage/[carId]/verify.tsx',
  'app/(app)/sighting/[id].tsx',
  'app/(app)/trust.tsx',
  'app/(app)/share/[spotId].tsx',
];

describe('routes', () => {
  it('builds the static paths', () => {
    expect(routes.home).to.equal('/');
    expect(routes.progress).to.equal('/progress');
    expect(routes.trust).to.equal('/trust');
    expect(routes.capture).to.equal('/capture');
    expect(routes.garageNew).to.equal('/garage/new');
    expect(routes.privacy).to.equal('/privacy');
  });

  it('builds the dynamic paths from an id', () => {
    expect(routes.albumPage('supercar')).to.equal('/album/supercar');
    expect(routes.albumCollection('jdm-legends')).to.equal('/album/collection/jdm-legends');
    expect(routes.spotDetail('s1')).to.equal('/details/s1');
    expect(routes.sticker('porsche-911-gt3')).to.equal('/sticker/porsche-911-gt3');
    expect(routes.reveal('s1')).to.equal('/reveal/s1');
    expect(routes.garageCar('c1')).to.equal('/garage/c1');
    expect(routes.garageVerify('c1')).to.equal('/garage/c1/verify');
    expect(routes.sighting('n1')).to.equal('/sighting/n1');
  });

  it('has a route file for every screen', () => {
    for (const file of ROUTE_FILES) {
      cy.readFile(file, { log: false }).should('be.a', 'string');
    }
  });
});
