import sure from '../../fixtures/identify/sure.json';
import { getIdentifyQuota, identifyCar } from '../../../src/services/aiService';
import type { AiImage, IdentifyOutcome } from '../../../src/types/Identification';

// aiService.identifyCar end to end against a stubbed identify-car function (SPEC §9, §14 W3).
// The component runner's Supabase URL is https://example.supabase.co (cypress/vite.config.js).
const FUNCTION_URL = 'https://example.supabase.co/functions/v1/identify-car';
const QUOTA_URL = 'https://example.supabase.co/rest/v1/rpc/identify_quota_status';

/** Exactly the CORS headers of the deployed function: a custom request header would fail the preflight. */
const FUNCTION_CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};
const REST_CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers':
    'authorization, x-client-info, apikey, content-type, content-profile, accept-profile, prefer, x-supabase-api-version',
  'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

function image(): AiImage {
  const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
  return { blob: new Blob([bytes], { type: 'image/jpeg' }), width: 768, height: 512, dHash: '0123456789abcdef' };
}

function identify(): Cypress.Chainable<IdentifyOutcome> {
  return cy.then(() => identifyCar(image()));
}

describe('aiService.identifyCar', () => {
  beforeEach(() => {
    cy.intercept('OPTIONS', FUNCTION_URL, { statusCode: 204, headers: FUNCTION_CORS });
    cy.intercept('OPTIONS', QUOTA_URL, { statusCode: 204, headers: REST_CORS });
  });

  it('posts the JPEG without custom headers and maps a 200 answer', () => {
    cy.intercept('POST', FUNCTION_URL, { statusCode: 200, headers: FUNCTION_CORS, body: sure }).as('identify');
    identify().then((outcome) => {
      expect(outcome.status).to.equal('identified');
      if (outcome.status === 'identified') {
        expect(outcome.car.catalogueId).to.equal('porsche-911-gt3');
        expect(outcome.remainingToday).to.equal(12);
      }
    });
    cy.get('@identify.all').should('have.length', 1);
    cy.wait('@identify').then(({ request }) => {
      expect(request.headers['content-type']).to.equal('image/jpeg');
      expect(request.url).to.equal(FUNCTION_URL);
    });
  });

  const errors: [number, string, IdentifyOutcome][] = [
    [401, 'unauthorized', { status: 'unavailable', reason: 'error' }],
    [405, 'method_not_allowed', { status: 'unavailable', reason: 'error' }],
    [413, 'image_too_large', { status: 'unavailable', reason: 'error' }],
    [415, 'bad_image', { status: 'unavailable', reason: 'error' }],
    [429, 'quota_exceeded', { status: 'unavailable', reason: 'quota' }],
    [429, 'provider_busy', { status: 'unavailable', reason: 'busy' }],
    [503, 'not_configured', { status: 'unavailable', reason: 'not_configured' }],
    [502, 'provider_error', { status: 'unavailable', reason: 'error' }],
    [504, 'provider_unreachable', { status: 'unavailable', reason: 'error' }],
  ];
  errors.forEach(([statusCode, error, expected]) => {
    it(`maps HTTP ${statusCode} ${error} to ${expected.status === 'unavailable' ? expected.reason : ''}`, () => {
      cy.intercept('POST', FUNCTION_URL, { statusCode, headers: FUNCTION_CORS, body: { error } });
      identify().should('deep.equal', expected);
    });
  });

  it('maps an error status without a JSON body to error', () => {
    cy.intercept('POST', FUNCTION_URL, { statusCode: 500, headers: FUNCTION_CORS, body: 'Internal Server Error' });
    identify().should('deep.equal', { status: 'unavailable', reason: 'error' });
  });

  it('maps an unparseable 200 body to error', () => {
    cy.intercept('POST', FUNCTION_URL, {
      statusCode: 200,
      headers: { ...FUNCTION_CORS, 'content-type': 'application/json' },
      body: '{"status":"identified","car":',
    });
    identify().should('deep.equal', { status: 'unavailable', reason: 'error' });
  });

  it('maps a 200 body that breaks the contract to error', () => {
    cy.intercept('POST', FUNCTION_URL, { statusCode: 200, headers: FUNCTION_CORS, body: { hello: 'world' } });
    identify().should('deep.equal', { status: 'unavailable', reason: 'error' });
  });

  it('maps a network failure to offline', () => {
    cy.intercept('POST', FUNCTION_URL, { forceNetworkError: true });
    identify().should('deep.equal', { status: 'unavailable', reason: 'offline' });
  });

  it('makes no call at all while the device is offline', () => {
    cy.intercept('POST', FUNCTION_URL, cy.spy().as('call'));
    cy.then(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    });
    identify().should('deep.equal', { status: 'unavailable', reason: 'offline' });
    cy.then(() => {
      Reflect.deleteProperty(navigator, 'onLine');
    });
    cy.get('@call').should('not.have.been.called');
  });

  it('aborts and reports timeout after 35 s', () => {
    cy.intercept('POST', FUNCTION_URL, { statusCode: 200, headers: FUNCTION_CORS, body: sure, delay: 60_000 });
    cy.clock();
    let pending: Promise<IdentifyOutcome> | undefined;
    cy.then(() => {
      pending = identifyCar(image());
    });
    cy.tick(34_999);
    let settled = false;
    cy.then(() => {
      void pending?.then(() => {
        settled = true;
      });
    });
    cy.then(() => expect(settled).to.equal(false));
    cy.tick(1);
    cy.then(() => pending).should('deep.equal', { status: 'unavailable', reason: 'timeout' });
  });
});

describe('aiService.getIdentifyQuota', () => {
  beforeEach(() => {
    cy.intercept('OPTIONS', QUOTA_URL, { statusCode: 204, headers: REST_CORS });
  });

  it('reads identify_quota_status', () => {
    cy.intercept('POST', QUOTA_URL, { statusCode: 200, headers: REST_CORS, body: [{ remaining: 9, daily_limit: 15 }] });
    cy.then(() => getIdentifyQuota()).should('deep.equal', { remaining: 9, dailyLimit: 15 });
  });

  it('falls back to the daily limit when the RPC returns no row', () => {
    cy.intercept('POST', QUOTA_URL, { statusCode: 200, headers: REST_CORS, body: [] });
    cy.then(() => getIdentifyQuota()).should('deep.equal', { remaining: 15, dailyLimit: 15 });
  });
});
