import { TEST_USER, type StubOptions } from '../support/commands';
import { withExif } from '../unit/ai/exifFixture';

/**
 * The Pit Stop capture flow (SPEC §14 W4, P0-02…P0-07) on the production build. Every Supabase and
 * identify-car call is stubbed; nothing touches the hosted database or the AI provider.
 */

const LEUVEN = { latitude: 50.8798, longitude: 4.7005 };
const SPA = { latitude: 50.4921, longitude: 5.8643 };
/** No coordinate of either stub may ever appear in a request. */
const COORDINATES = /50\.8[78]|4\.700|50\.49|5\.86/;

interface RecordedRequest {
  method: string;
  url: string;
  body: string;
}

/** Records the URL and (text) body of every request the app makes, without changing them. */
function recordRequests(): RecordedRequest[] {
  const recorded: RecordedRequest[] = [];
  cy.intercept({ url: '**' }, (request) => {
    const body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body ?? '');
    recorded.push({ method: request.method, url: request.url, body });
  });
  return recorded;
}

function start(options: StubOptions, settings: { aiEnabled?: boolean } = {}, geolocation = LEUVEN) {
  cy.stubSupabase(options);
  const recorded = recordRequests();
  cy.loginThroughUi({ geolocation, reduceMotion: true, settings: { aiConsentVersion: 1, ...settings } });
  cy.get('[data-testid="tab-spot"]').click();
  cy.get('[data-testid="spot-screen"]').should('be.visible');
  return recorded;
}

function takePhoto() {
  cy.get('[data-testid="take-photo-button"]').click();
  cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/car.jpg', { force: true });
  waitForReview();
}

function waitForReview() {
  cy.get('[data-testid="capture-screen"]').should('be.visible');
  cy.location('pathname').should('eq', '/capture');
  cy.get('[data-testid="plate-editor"]').should('have.attr', 'data-measured', 'true');
}

function insertBody(): Cypress.Chainable<Record<string, unknown>> {
  return cy.wait('@createSpot').its('request.body');
}

describe('Pit Stop capture', () => {
  it('sure: accept the plate suggestion, confirm, COLLECT (3 taps, no typing) → reveal', () => {
    const recorded = start({ identify: 'sure' });
    takePhoto();
    cy.wait('@identify');
    cy.get('[data-testid="identity-car-name"]').should('have.text', 'Porsche 911 GT3');
    cy.get('[data-testid="city-field-value"]').should('have.text', 'Leuven');
    cy.get('[data-testid="city-field"]').find('[data-testid="provenance-auto"]').should('exist');
    cy.get('[data-testid="masked-plate"]').should('have.text', 'Plate ••34');
    cy.get('[data-testid="collect-button"]').should('have.attr', 'aria-disabled', 'true');

    // The three taps of the minimal path.
    cy.get('[data-testid="plate-suggestion-0"]').click();
    cy.get('[data-testid="plate-confirm-blurred"]').click();
    cy.get('[data-testid="collect-button"]').should('not.have.attr', 'aria-disabled', 'true').click();

    cy.wait('@upload').its('request.url').should('include', `/spot-photos/${TEST_USER.id}/`);
    insertBody().then((body) => {
      expect(body).to.include({
        car_model_id: 'porsche-911-gt3',
        make: 'Porsche',
        model: '911 GT3',
        identified_by: 'ai',
        ai_confidence: 0.94,
        ai_model_id: 'porsche-911-gt3',
        paint: 'blue',
        body_style: 'coupe',
        plate_input: '1ABC234',
        city: 'Leuven',
        plates_hidden: 1,
        generation: '992',
        year_from: 2021,
        share_name_with_owner: false,
      });
      expect(String(body.photo_hash)).to.match(/^[0-9a-f]{16}$/);
    });
    cy.location('pathname').should('match', /^\/reveal\//);
    cy.then(() => {
      recorded.forEach((request) => {
        expect(`${request.url} ${request.body}`, `${request.method} ${request.url}`).not.to.match(COORDINATES);
      });
    });
  });

  it('gallery + EXIF: the photo time and the city from its GPS; the device position is never asked', () => {
    start({ identify: 'sure' });
    cy.readFile('cypress/fixtures/car.jpg', null).then((jpeg: Uint8Array) => {
      const contents = Cypress.Buffer.from(
        withExif(new Uint8Array(jpeg), { dateTimeOriginal: '2026:11:03 14:12:00', gps: SPA }),
      );
      cy.get('[data-testid="choose-photo-button"]').click();
      cy.get('[data-testid="file-input"]').selectFile(
        { contents, fileName: 'spa.jpg', mimeType: 'image/jpeg' },
        { force: true },
      );
    });
    waitForReview();
    cy.get('[data-testid="city-field-value"]').should('have.text', 'Spa');
    cy.get('[data-testid="date-field"]').find('[data-testid="provenance-auto"]').should('exist');
    cy.wait('@identify');
    cy.get('[data-testid="plate-suggestion-0"]').click();
    cy.get('[data-testid="plate-confirm-blurred"]').click();
    cy.get('[data-testid="collect-button"]').click();
    insertBody().then((body) => {
      expect(body.city).to.equal('Spa');
      const spottedAt = new Date(String(body.spotted_at));
      expect(spottedAt.getTime()).to.equal(new Date(2026, 10, 3, 14, 12, 0).getTime());
    });
    cy.get('@geolocation').should('not.have.been.called');
  });

  it('unsure: picking a candidate saves ai_edited', () => {
    start({ identify: 'unsure' });
    takePhoto();
    cy.wait('@identify');
    cy.get('[data-testid="guess-candidates"]').should('contain.text', 'Is it one of these?');
    cy.get('[data-testid="identity-card-confidence-tier-guess"]').should('be.visible');
    cy.get('[data-testid="collect-button"]').should('have.attr', 'aria-disabled', 'true');
    cy.get('[data-testid="candidate-porsche-911-gt3"]').click();
    cy.get('[data-testid="identity-car-name"]').should('have.text', 'Porsche 911 GT3');
    cy.get('[data-testid="plate-suggestion-0"]').click();
    cy.get('[data-testid="plate-confirm-blurred"]').click();
    cy.get('[data-testid="collect-button"]').click();
    insertBody().then((body) => {
      expect(body).to.include({ car_model_id: 'porsche-911-gt3', identified_by: 'ai_edited', paint: 'silver' });
      expect(body).not.to.have.property('plate_input');
    });
    cy.location('pathname').should('match', /^\/reveal\//);
  });

  it('not a car: nothing is uploaded; "It is a car" continues by hand', () => {
    start({ identify: 'not_a_car' });
    takePhoto();
    cy.wait('@identify');
    cy.get('[data-testid="not-a-car-card"]').should('contain.text', "Co-Driver doesn't see a car here");
    cy.get('[data-testid="collect-button"]').should('not.exist');
    cy.get('[data-testid="it-is-a-car-button"]').click();
    cy.get('[data-testid="identity-card"]').should('be.visible');
    cy.get('[data-testid="car-model-search"]').should('be.visible');
    cy.get('@upload.all').should('have.length', 0);
    cy.get('@createSpot.all').should('have.length', 0);
  });

  it('not_configured: a banner, then the same COLLECT path by hand (manual)', () => {
    start({ identify: 'not_configured' });
    takePhoto();
    cy.wait('@identify');
    cy.get('[data-testid="ai-status-banner-not_configured"]').should('be.visible');
    cy.get('[data-testid="car-model-search"]').type('chiron');
    cy.get('[data-testid="car-model-option-bugatti-chiron"]').click();
    cy.get('[data-testid="plate-confirm-none"]').click();
    cy.get('[data-testid="plate-input"]').type('1-abc-234');
    cy.get('[data-testid="collect-button"]').click();
    insertBody().then((body) => {
      expect(body).to.include({
        car_model_id: 'bugatti-chiron',
        identified_by: 'manual',
        plates_hidden: 0,
        plate_input: '1ABC234',
      });
    });
  });

  it('network error: manual mode with a banner, never a dead end', () => {
    start({ identify: 'network_error' });
    takePhoto();
    cy.get('[data-testid="ai-status-banner"]').should('be.visible');
    cy.get('[data-testid="analysing-chip"]').should('not.exist');
    cy.get('[data-testid="not-in-album-button"]').click();
    cy.get('[data-testid="make-input"]').type('DeLorean');
    cy.get('[data-testid="model-input"]').type('DMC-12');
    cy.get('[data-testid="sticker-match-wildcard"]').should('be.visible');
    cy.get('[data-testid="plate-confirm-none"]').click();
    cy.get('[data-testid="collect-button"]').click();
    insertBody().then((body) => {
      expect(body).to.include({ car_model_id: null, make: 'DeLorean', model: 'DMC-12', identified_by: 'manual' });
    });
  });

  it('Co-Driver off: zero identify-car calls, manual review', () => {
    start({ identify: 'sure' }, { aiEnabled: false });
    cy.get('[data-testid="chip-ai-off"]').should('be.visible');
    takePhoto();
    cy.get('[data-testid="ai-status-banner-disabled"]').should('be.visible');
    cy.get('[data-testid="plate-suggestion-0"]').should('not.exist');
    cy.get('[data-testid="car-model-search"]').type('gt3');
    cy.get('[data-testid="car-model-option-porsche-911-gt3"]').click();
    cy.get('[data-testid="plate-confirm-none"]').click();
    cy.get('[data-testid="collect-button"]').click();
    insertBody().its('identified_by').should('eq', 'manual');
    cy.get('@identify.all').should('have.length', 0);
  });

  it('no plate found: COLLECT stays blocked until "No licence plate is visible" is ticked', () => {
    cy.stubSupabase({ identify: 'sure' });
    cy.fixture('identify/sure.json').then((sure: { car: Record<string, unknown> }) => {
      cy.intercept('POST', '**/functions/v1/identify-car', {
        statusCode: 200,
        headers: { 'access-control-allow-origin': '*' },
        body: { ...sure, car: { ...sure.car, plates: [], plateText: '' } },
      }).as('identify');
    });
    cy.loginThroughUi({ geolocation: LEUVEN, reduceMotion: true, settings: { aiConsentVersion: 1 } });
    cy.get('[data-testid="tab-spot"]').click();
    takePhoto();
    cy.wait('@identify');
    cy.get('[data-testid="identity-car-name"]').should('have.text', 'Porsche 911 GT3');
    cy.get('[data-testid="plate-suggestion-0"]').should('not.exist');
    cy.get('[data-testid="collect-reason"]').should('have.text', 'Check the plates first');
    cy.get('[data-testid="collect-button"]').should('have.attr', 'aria-disabled', 'true').click({ force: true });
    cy.get('@createSpot.all').should('have.length', 0);
    cy.get('[data-testid="plate-confirm-blurred"]').should('have.attr', 'aria-disabled', 'true');
    cy.get('[data-testid="plate-confirm-none"]').click();
    cy.get('[data-testid="collect-button"]').should('not.have.attr', 'aria-disabled', 'true').click();
    insertBody().then((body) => {
      expect(body).to.include({ plates_hidden: 0, identified_by: 'ai' });
      expect(body).not.to.have.property('plate_input');
    });
  });

  it('a save failure shows the error above COLLECT and keeps the draft', () => {
    start({ identify: 'sure' });
    cy.intercept('POST', '**/rest/v1/spots*', { statusCode: 500, body: { message: 'boom' } }).as('failedInsert');
    takePhoto();
    cy.wait('@identify');
    cy.get('[data-testid="plate-suggestion-0"]').click();
    cy.get('[data-testid="plate-confirm-blurred"]').click();
    cy.get('[data-testid="collect-button"]').click();
    cy.wait('@failedInsert');
    cy.get('[data-testid="collect-error"]').should('be.visible');
    cy.location('pathname').should('eq', '/capture');
    cy.get('[data-testid="identity-car-name"]').should('have.text', 'Porsche 911 GT3');
    cy.get('[data-testid="plate-confirm-blurred"]').should('have.attr', 'aria-checked', 'true');
  });

  it('Fill in myself while analysing ignores the late answer', () => {
    cy.stubSupabase({ identify: 'sure' });
    const started: string[] = [];
    cy.fixture('identify/sure.json').then((sure: object) => {
      cy.intercept('POST', '**/functions/v1/identify-car', (request) => {
        started.push(request.url);
        request.reply({ statusCode: 200, headers: { 'access-control-allow-origin': '*' }, body: sure, delay: 1500 });
      }).as('identify');
    });
    cy.loginThroughUi({ geolocation: LEUVEN, reduceMotion: true, settings: { aiConsentVersion: 1 } });
    cy.get('[data-testid="tab-spot"]').click();
    takePhoto();
    // Wait until Co-Driver is really asked, then give up on it while the answer is still on its way.
    cy.wrap(started).should('have.length', 1);
    cy.get('[data-testid="fill-myself-button"]').click();
    cy.get('[data-testid="analysing-chip"]').should('not.exist');
    cy.wait('@identify');
    cy.get('[data-testid="car-model-search"]').should('be.visible');
    cy.get('[data-testid="identity-car-name"]').should('not.exist');
    cy.get('[data-testid="plate-suggestion-0"]').should('not.exist');
  });

  it('first use asks for Co-Driver consent; "Use Co-Driver" then identifies', () => {
    cy.stubSupabase({ identify: 'sure' });
    cy.loginThroughUi({ geolocation: LEUVEN, reduceMotion: true });
    cy.get('[data-testid="tab-spot"]').click();
    takePhoto();
    cy.get('[data-testid="ai-consent-sheet"]').should('contain.text', 'Use Co-Driver?');
    cy.get('[data-testid="analysing-chip"]').should('not.exist');
    cy.get('@identify.all').should('have.length', 0);
    cy.get('[data-testid="consent-accept"]').click();
    cy.wait('@identify');
    cy.get('[data-testid="identity-car-name"]').should('have.text', 'Porsche 911 GT3');
    cy.window().its('localStorage').invoke('getItem', 'redline-settings').should('contain', '"aiConsentVersion":1');
  });

  it('declining the consent switches Co-Driver off and fills in by hand', () => {
    cy.stubSupabase({ identify: 'sure' });
    cy.loginThroughUi({ geolocation: LEUVEN, reduceMotion: true });
    cy.get('[data-testid="tab-spot"]').click();
    takePhoto();
    cy.get('[data-testid="consent-decline"]').click();
    cy.get('[data-testid="ai-status-banner-disabled"]').should('be.visible');
    cy.get('@identify.all').should('have.length', 0);
    cy.window().its('localStorage').invoke('getItem', 'redline-settings').should('contain', '"aiEnabled":false');
  });

  it('a refresh without a draft goes back to the Spot tab', () => {
    start({ identify: 'none' });
    cy.visit('/capture');
    cy.get('[data-testid="spot-screen"]', { timeout: 15000 }).should('be.visible');
  });
});
