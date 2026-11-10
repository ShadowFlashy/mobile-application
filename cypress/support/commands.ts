/**
 * Test helpers (v2). Every Supabase request and every call to the identify-car Edge Function is
 * intercepted with fixture data, so the end-to-end tests are deterministic, need no real account and
 * never touch the hosted database or the AI provider (course ch. 12: mock external dependencies).
 */
import type { AppSettings } from '../../src/types/Settings';
import type { VerificationResult } from '../../src/types/OwnerCar';

export const TEST_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'tester@redline.test',
  username: 'tester',
};

/** A `spots` row as the database returns it (every v2 column; owner columns are always null in v2). */
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
  created_at: string;
  owner_car_id: string | null;
  vanity_plate: string | null;
  city: string | null;
  paint: string;
  body_style: string;
  plates_hidden: number;
  identified_by: string;
  ai_confidence: number | null;
  ai_model_id: string | null;
  generation: string | null;
  year_from: number | null;
  year_to: number | null;
  photo_hash: string | null;
  share_name_with_owner: boolean;
}

/** A `collections` row with its embedded members, as getCollections() selects it. */
export interface CollectionRowFixture {
  id: string;
  number: number;
  sort: number;
  collection_models: { car_model_id: string }[];
}

/** Which identify-car answer the stub returns (fixtures in cypress/fixtures/identify/). */
export type IdentifyStub =
  'sure' | 'unsure' | 'not_a_car' | 'not_configured' | 'quota' | 'busy' | 'network_error' | 'none';

export interface StubOptions {
  spots?: SpotRowFixture[];
  ownerCars?: object[];
  pings?: object[];
  /** Rows of get_spot_showcase (empty = no showcase). */
  showcase?: { visibility: string; shoutout: string | null; vanity_plate: string | null }[];
  /** Rows of get_owner_car_stats. */
  stats?: {
    owner_car_id: string;
    sightings: number;
    unread: number;
    last_city: string | null;
    last_seen: string | null;
  }[];
  /** Co-Driver scans left today (identify_quota_status). Default 12. */
  quota?: number;
  collections?: CollectionRowFixture[];
  /** Default 'sure'. 'none' installs no identify-car stub at all. */
  identify?: IdentifyStub;
  /** Result of the P1 verify-owner function. Default 'verified'. */
  verify?: VerificationResult;
}

export interface LoginOptions {
  /** Stubs navigator.geolocation: a position, or 'denied'. Default: no stub. */
  geolocation?: { latitude: number; longitude: number } | 'denied';
  reduceMotion?: boolean;
  /** Pre-seeds the device settings (localStorage['redline-settings']). */
  settings?: Partial<AppSettings>;
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

/** Builds a spot row with every v2 column; pass only what the test cares about. */
export function spotRow(overrides: Partial<SpotRowFixture> & { id: string }): SpotRowFixture {
  const now = new Date().toISOString();
  return {
    user_id: TEST_USER.id,
    car_model_id: null,
    make: 'Porsche',
    model: '911 GT3',
    photo_path: `${TEST_USER.id}/${overrides.id}.jpg`,
    location_label: null,
    notes: null,
    spotted_at: overrides.spotted_at ?? now,
    created_at: overrides.created_at ?? overrides.spotted_at ?? now,
    owner_car_id: null,
    vanity_plate: null,
    city: null,
    paint: 'other',
    body_style: 'other',
    plates_hidden: 0,
    identified_by: 'manual',
    ai_confidence: null,
    ai_model_id: null,
    generation: null,
    year_from: null,
    year_to: null,
    photo_hash: null,
    share_name_with_owner: false,
    ...overrides,
  };
}

/** Collections matching the 6 fixture models (the real seed has 8 sets of 8–12 cars). */
export const DEFAULT_COLLECTIONS: CollectionRowFixture[] = [
  {
    id: 'jdm-legends',
    number: 1,
    sort: 1,
    collection_models: [{ car_model_id: 'mazda-mx-5' }],
  },
  {
    id: 'autobahn-heroes',
    number: 3,
    sort: 3,
    collection_models: [{ car_model_id: 'porsche-911-gt3' }, { car_model_id: 'volkswagen-golf-gti' }],
  },
  {
    id: 'hypercar-hall-of-fame',
    number: 8,
    sort: 8,
    collection_models: [{ car_model_id: 'bugatti-chiron' }],
  },
];

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

/** HTTP error replies of the deployed function (SPEC §9.3). */
const IDENTIFY_ERRORS: Partial<Record<IdentifyStub, { statusCode: number; error: string }>> = {
  not_configured: { statusCode: 503, error: 'not_configured' },
  quota: { statusCode: 429, error: 'quota_exceeded' },
  busy: { statusCode: 429, error: 'provider_busy' },
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Intercepts every Supabase endpoint and the identify-car function. */
      stubSupabase(options?: StubOptions): Chainable<void>;
      /** Logs in through the real login screen (with a stubbed Supabase Auth response). */
      loginThroughUi(options?: LoginOptions): Chainable<void>;
      /** Emulates prefers-reduced-motion: reduce (Chrome DevTools protocol). */
      reduceMotion(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('stubSupabase', (options: StubOptions = {}) => {
  // Auth and profile
  cy.intercept('POST', '**/auth/v1/token?grant_type=password', { statusCode: 200, body: fakeSession() }).as('login');
  cy.intercept('POST', '**/auth/v1/token?grant_type=refresh_token', { statusCode: 200, body: fakeSession() });
  cy.intercept('GET', '**/auth/v1/user', { statusCode: 200, body: fakeSession().user });
  cy.intercept('POST', '**/auth/v1/logout*', { statusCode: 204 }).as('logout');
  cy.intercept('GET', '**/rest/v1/profiles*', { statusCode: 200, body: [{ username: TEST_USER.username }] });

  // Catalogue and collections (reference data)
  cy.intercept('GET', '**/rest/v1/car_models*', { fixture: 'car_models.json' }).as('carModels');
  cy.intercept('GET', '**/rest/v1/collections*', {
    statusCode: 200,
    body: options.collections ?? DEFAULT_COLLECTIONS,
  }).as('collections');

  // Spots
  cy.intercept('GET', '**/rest/v1/spots*', { statusCode: 200, body: options.spots ?? [] }).as('spots');
  cy.intercept('POST', '**/rest/v1/spots*', (request) => {
    const body: Partial<SpotRowFixture> & { id: string } = request.body;
    // The database clears plate_input and never returns it.
    const { plate_input: _plate, ...columns }: Partial<SpotRowFixture> & { id: string; plate_input?: string } = body;
    request.reply({ statusCode: 201, body: spotRow(columns) });
  }).as('createSpot');
  cy.intercept('PATCH', '**/rest/v1/spots*', (request) => {
    const existing = (options.spots ?? [])[0];
    request.reply({ statusCode: 200, body: { ...(existing ?? spotRow({ id: 'patched' })), ...request.body } });
  }).as('updateSpot');
  cy.intercept('DELETE', '**/rest/v1/spots*', { statusCode: 204 }).as('deleteSpot');

  // Owner portal
  cy.intercept('GET', '**/rest/v1/owner_cars*', { statusCode: 200, body: options.ownerCars ?? [] }).as('ownerCars');
  cy.intercept('PATCH', '**/rest/v1/owner_cars*', (request) => {
    const existing = (options.ownerCars ?? [])[0];
    request.reply({ statusCode: 200, body: { ...(existing ?? {}), ...request.body } });
  }).as('updateOwnerCar');
  cy.intercept('DELETE', '**/rest/v1/owner_cars*', { statusCode: 204 }).as('deleteOwnerCar');
  cy.intercept('GET', '**/rest/v1/spot_notifications*', { statusCode: 200, body: options.pings ?? [] }).as('pings');
  cy.intercept('PATCH', '**/rest/v1/spot_notifications*', { statusCode: 204 }).as('markRead');

  // RPCs
  cy.intercept('POST', '**/rest/v1/rpc/get_spot_showcase', { statusCode: 200, body: options.showcase ?? [] }).as(
    'showcase',
  );
  cy.intercept('POST', '**/rest/v1/rpc/get_owner_car_stats', { statusCode: 200, body: options.stats ?? [] }).as(
    'stats',
  );
  cy.intercept('POST', '**/rest/v1/rpc/start_owner_verification', {
    statusCode: 200,
    body: [{ code: 'RL-ACDEFG', expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() }],
  }).as('startVerification');
  cy.intercept('POST', '**/rest/v1/rpc/identify_quota_status', {
    statusCode: 200,
    body: [{ remaining: options.quota ?? 12, daily_limit: 15 }],
  }).as('quota');
  cy.intercept('POST', '**/rest/v1/rpc/export_my_data', {
    statusCode: 200,
    body: { exported_at: new Date().toISOString(), profile: null, spots: [], owner_cars: [], sightings: [] },
  }).as('exportData');
  cy.intercept('POST', '**/rest/v1/rpc/delete_my_account', { statusCode: 204 }).as('deleteAccount');

  // Storage
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
  cy.intercept('POST', '**/storage/v1/object/spot-photos/**', {
    statusCode: 200,
    body: { Key: 'spot-photos/test.jpg', Id: 'test' },
  }).as('upload');
  cy.intercept('DELETE', '**/storage/v1/object/spot-photos*', { statusCode: 200, body: [] }).as('removePhotos');

  // Edge Functions
  const identify = options.identify ?? 'sure';
  if (identify !== 'none') {
    cy.intercept('OPTIONS', '**/functions/v1/identify-car', { statusCode: 204, headers: CORS_HEADERS });
    const failure = IDENTIFY_ERRORS[identify];
    if (identify === 'network_error') {
      cy.intercept('POST', '**/functions/v1/identify-car', { forceNetworkError: true }).as('identify');
    } else if (failure !== undefined) {
      cy.intercept('POST', '**/functions/v1/identify-car', {
        statusCode: failure.statusCode,
        headers: CORS_HEADERS,
        body: { error: failure.error },
      }).as('identify');
    } else {
      cy.intercept('POST', '**/functions/v1/identify-car', {
        statusCode: 200,
        headers: CORS_HEADERS,
        fixture: `identify/${identify}.json`,
      }).as('identify');
    }
  }
  cy.intercept('OPTIONS', '**/functions/v1/verify-owner', { statusCode: 204, headers: CORS_HEADERS });
  cy.intercept('POST', '**/functions/v1/verify-owner', {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: { result: options.verify ?? 'verified', remainingToday: 4 },
  }).as('verify');
});

Cypress.Commands.add('reduceMotion', () => {
  cy.wrap(
    Cypress.automation('remote:debugger:protocol', {
      command: 'Emulation.setEmulatedMedia',
      params: { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
    }),
    { log: false },
  );
});

Cypress.Commands.add('loginThroughUi', (options: LoginOptions = {}) => {
  if (options.reduceMotion === true) cy.reduceMotion();
  cy.visit('/login', {
    onBeforeLoad(win) {
      if (options.settings !== undefined) {
        win.localStorage.setItem('redline-settings', JSON.stringify(options.settings));
      }
      const position = options.geolocation;
      if (position !== undefined) {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition')
          .as('geolocation')
          .callsFake((success: PositionCallback, failure?: PositionErrorCallback | null) => {
            if (position === 'denied') {
              failure?.({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
              return;
            }
            success({
              coords: {
                latitude: position.latitude,
                longitude: position.longitude,
                accuracy: 1000,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
                toJSON: () => position,
              },
              timestamp: Date.now(),
              toJSON: () => position,
            });
          });
      }
    },
  });
  cy.get('[data-testid="email-input"]').type(TEST_USER.email);
  cy.get('[data-testid="password-input"]').type('any-test-password');
  cy.get('[data-testid="login-button"]').click();
  cy.wait('@login');
  cy.get('[data-testid="sticker-book-screen"]').should('be.visible');
});
