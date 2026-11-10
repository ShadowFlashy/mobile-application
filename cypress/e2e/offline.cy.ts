import { spotRow } from '../support/commands';

// Mobile-specific E2E requirement (course ch. 12): network simulation. SPEC P0-19 / §6.12: the
// installed PWA opens offline, with an expired access token, on the album from the persisted cache.
describe('Offline behaviour', () => {
  it('shows a banner when the connection drops and hides it when it is back', () => {
    cy.stubSupabase();
    cy.loginThroughUi();
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
      win.dispatchEvent(new win.Event('offline'));
    });
    cy.get('[data-testid="offline-banner"]').should('be.visible');

    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(true);
      win.dispatchEvent(new win.Event('online'));
    });
    cy.get('[data-testid="offline-banner"]').should('not.exist');
  });

  it('opens the album read-only with an expired session and no network', () => {
    const spots = [
      spotRow({ id: 'offline-spot-1', car_model_id: 'porsche-911-gt3', city: 'Leuven', paint: 'blue' }),
      spotRow({ id: 'offline-spot-2', car_model_id: 'mazda-mx-5', make: 'Mazda', model: 'MX-5', city: 'Gent' }),
    ];
    cy.stubSupabase({ spots });
    cy.loginThroughUi();

    // The query cache is persisted to the device (throttled): wait until the spots are in it.
    cy.window().its('localStorage').invoke('getItem', 'redline-query-cache').should('contain', 'offline-spot-2');

    // The access token expires while the phone is in a pocket…
    cy.window().then((win) => {
      const key = Object.keys(win.localStorage).find((name) => /^sb-.+-auth-token$/.test(name));
      expect(key, 'stored Supabase session').to.be.a('string');
      const stored = win.localStorage.getItem(key ?? '');
      const session: { expires_at: number } = JSON.parse(stored ?? '{}');
      session.expires_at = Math.floor(Date.now() / 1000) - 3600;
      win.localStorage.setItem(key ?? '', JSON.stringify(session));
    });

    // …and the app is opened without a connection to Supabase.
    cy.intercept('POST', '**/auth/v1/token*', { forceNetworkError: true }).as('refresh');
    cy.intercept('**/rest/v1/**', { forceNetworkError: true });
    cy.intercept('**/storage/v1/**', { forceNetworkError: true });
    cy.intercept('**/auth/v1/user*', { forceNetworkError: true });
    // A fresh page load (cy.reload on a tab screen never fires `load` under Cypress; cy.visit does).
    cy.visit('/');

    cy.wait('@refresh');
    cy.location('pathname').should('eq', '/');
    cy.get('[data-testid="sticker-book-screen"]').should('be.visible');

    // Me shows the cached season and says the app is read-only.
    cy.get('[data-testid="tab-profile"]').click();
    cy.get('[data-testid="profile-screen"]').should('be.visible');
    cy.get('[data-testid="offline-session-tag"]').should('contain.text', 'Offline · read-only');
    cy.get('[data-testid="offline-session-notice"]').should('be.visible');
    cy.get('[data-testid="driver-name"]').should('have.text', 'tester');
    cy.get('[data-testid="stat-spots"]').should('contain.text', '2');
    cy.get('[data-testid="stat-cities"]').should('contain.text', '2');
  });
});
