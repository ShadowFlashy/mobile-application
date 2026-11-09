/**
 * Test helpers. Every Supabase request is intercepted with fixture data, so the end-to-end tests
 * are deterministic, need no real account and never touch the hosted database
 * (course ch. 12: mock external dependencies, test with known mock data).
 */
export const TEST_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'tester@redline.test',
  username: 'tester',
};

export interface SpotRowFixture {
  id: string;
  user_id: string;
  car_model_id: string | null;
  make: string;
  model: string;
  photo_path: string;
  location_label: string | null;
  notes: string | null;
  spotted_at: string;
  owner_car_id: string | null;
  vanity_plate: string | null;
}

export interface StubOptions {
  spots?: SpotRowFixture[];
  ownerCars?: object[];
  pings?: object[];
}

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** A structurally valid but fake session; the token is built at runtime and only lives in the test browser. */
export function fakeSession() {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = [
    base64Url({ alg: 'HS256', typ: 'JWT' }),
    base64Url({
      sub: TEST_USER.id,
      email: TEST_USER.email,
      role: 'authenticated',
      aud: 'authenticated',
      iat: now,
      exp: now + 3600,
    }),
    'test-signature',
  ].join('.');
  return {
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: 'test-refresh-token',
    user: {
      id: TEST_USER.id,
      aud: 'authenticated',
      role: 'authenticated',
      email: TEST_USER.email,
      email_confirmed_at: '2026-11-01T10:00:00Z',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { username: TEST_USER.username },
      identities: [],
      created_at: '2026-11-01T10:00:00Z',
      updated_at: '2026-11-01T10:00:00Z',
    },
  };
}

export function spotRow(overrides: Partial<SpotRowFixture> & { id: string }): SpotRowFixture {
  return {
    user_id: TEST_USER.id,
    car_model_id: null,
    make: 'Porsche',
    model: '911 GT3',
    photo_path: `${TEST_USER.id}/${overrides.id}.jpg`,
    location_label: null,
    notes: null,
    spotted_at: new Date().toISOString(),
    owner_car_id: null,
    vanity_plate: null,
    ...overrides,
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Intercepts every Supabase endpoint the app uses. */
      stubSupabase(options?: StubOptions): Chainable<void>;
      /** Logs in through the real login screen (with a stubbed Supabase Auth response). */
      loginThroughUi(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('stubSupabase', (options: StubOptions = {}) => {
  cy.intercept('POST', '**/auth/v1/token?grant_type=password', { statusCode: 200, body: fakeSession() }).as('login');
  cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token', { statusCode: 200, body: fakeSession() });
  cy.intercept('GET', '**/auth/v1/user', { statusCode: 200, body: fakeSession().user });
  cy.intercept('POST', '**/auth/v1/logout*', { statusCode: 204 }).as('logout');
  cy.intercept('GET', '**/rest/v1/profiles*', { statusCode: 200, body: [{ username: TEST_USER.username }] });
  cy.intercept('GET', '**/rest/v1/car_models*', { fixture: 'car_models.json' }).as('carModels');
  cy.intercept('GET', '**/rest/v1/spots*', { statusCode: 200, body: options.spots ?? [] }).as('spots');
  cy.intercept('GET', '**/rest/v1/owner_cars*', { statusCode: 200, body: options.ownerCars ?? [] }).as('ownerCars');
  cy.intercept('GET', '**/rest/v1/spot_notifications*', { statusCode: 200, body: options.pings ?? [] }).as('pings');
  cy.intercept('POST', '**/storage/v1/object/sign/spot-photos', (request) => {
    const paths: string[] = Array.isArray(request.body?.paths) ? request.body.paths : [];
    request.reply(
      paths.map((path) => ({ path, signedURL: `/object/sign/spot-photos/${path}?token=test`, error: null })),
    );
  }).as('signPhotos');
  cy.intercept('GET', '**/storage/v1/object/sign/**', {
    fixture: 'car.jpg',
    headers: { 'content-type': 'image/jpeg' },
  });
});

Cypress.Commands.add('loginThroughUi', () => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(TEST_USER.email);
  cy.get('[data-testid="password-input"]').type('any-test-password');
  cy.get('[data-testid="login-button"]').click();
  cy.wait('@login');
  cy.get('[data-testid="sticker-book-screen"]').should('be.visible');
});
