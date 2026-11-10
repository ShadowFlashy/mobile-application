import { fakePosition, fakePositionError } from '../../support/geoFakes';
import { getCoarsePosition } from '../../../src/services/locationService.web';

// Coarse device position (SPEC §10.3): rounded to 2 decimals before it is returned; never throws.
describe('locationService.getCoarsePosition (web)', () => {
  it('asks for a coarse, cached fix and rounds it to 2 decimals', () => {
    const stub = cy.stub(navigator.geolocation, 'getCurrentPosition').callsFake((success: PositionCallback) => {
      success(fakePosition(50.87949, 4.70051, 30));
    });
    cy.then(() => getCoarsePosition()).should('deep.equal', { latitude: 50.88, longitude: 4.7 });
    cy.then(() => {
      expect(stub.callCount).to.equal(1);
      expect(stub.firstCall.args[2]).to.deep.equal({ enableHighAccuracy: false, maximumAge: 600000, timeout: 5000 });
    });
  });

  it('resolves undefined when the permission is denied', () => {
    cy.stub(navigator.geolocation, 'getCurrentPosition').callsFake(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error(fakePositionError(1, 'denied'));
      },
    );
    cy.then(() => getCoarsePosition()).should('equal', undefined);
  });

  it('resolves undefined when geolocation throws', () => {
    cy.stub(navigator.geolocation, 'getCurrentPosition').throws(new Error('blocked by Permissions-Policy'));
    cy.then(() => getCoarsePosition()).should('equal', undefined);
  });

  it('gives up when the permission prompt is never answered', () => {
    cy.stub(navigator.geolocation, 'getCurrentPosition').callsFake(() => undefined);
    cy.clock();
    let pending: Promise<unknown> | undefined;
    cy.then(() => {
      pending = getCoarsePosition();
    });
    cy.tick(20_000);
    cy.then(() => pending).should('equal', undefined);
  });
});
