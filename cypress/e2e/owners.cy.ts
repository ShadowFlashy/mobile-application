import { TEST_USER } from '../support/commands';

/**
 * Garage and safe pings (SPEC §4 P0-16/P0-17, §14 W8). Every Supabase call is stubbed (cy.stubSupabase):
 * nothing reaches the hosted database.
 */

const NOW = new Date();
const hourStart = (hoursAgo: number) => {
  const date = new Date(NOW.getTime() - hoursAgo * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return date.toISOString();
};

/** An owner_cars row as the v2 database returns it (no plate hash, no plate text). */
function ownerCarRow(overrides: Record<string, unknown> = {}) {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    owner_id: TEST_USER.id,
    make: 'Ferrari',
    model: '308 GTSi',
    nickname: 'Magnum',
    plate_hint: '87',
    show_plate: false,
    plate_display: null,
    visibility: 'hidden',
    shoutout: null,
    pings_paused: false,
    verified_at: null,
    verify_expires_at: null,
    car_model_id: null,
    created_at: '2026-11-09T10:00:00Z',
    updated_at: '2026-11-09T10:00:00Z',
    ...overrides,
  };
}

/** The seeded demo car: verified, vanity plate DEMO-123 (supabase/seed_demo.sql). */
const verifiedCar = ownerCarRow({
  id: '55555555-5555-4555-8555-555555555555',
  make: 'Porsche',
  model: '911 GT3',
  nickname: 'Demo GT3',
  plate_hint: '23',
  show_plate: true,
  plate_display: 'DEMO-123',
  visibility: 'vanity',
  verified_at: '2026-11-01T10:00:00Z',
  car_model_id: 'porsche-911-gt3',
});

/** A spot_notifications snapshot row: no spot id join, no spotter key, no notes, no exact time. */
const sighting = {
  id: '33333333-3333-4333-8333-333333333333',
  owner_car_id: verifiedCar.id,
  car_label: 'Demo GT3',
  city: 'Antwerpen',
  spotted_hour: hourStart(2),
  photo_path: '99999999-9999-4999-8999-999999999999/44444444-4444-4444-8444-444444444444.jpg',
  spotter_name: null,
  created_at: hourStart(1),
  read_at: null,
};

const stats = [
  { owner_car_id: verifiedCar.id, sightings: 1, unread: 1, last_city: 'Antwerpen', last_seen: sighting.spotted_hour },
];

describe('Garage', () => {
  it('registers a car as Waiting for verification: plate sent once and normalised, no pings', () => {
    const pending = ownerCarRow();
    cy.stubSupabase();
    cy.intercept('POST', '**/rest/v1/owner_cars*', { statusCode: 201, body: pending }).as('registerCar');
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="tab-owners"]').click();
    cy.get('[data-testid="garage-empty"]').should('be.visible');
    cy.get('[data-testid="no-pings"]').should('be.visible');

    cy.get('[data-testid="add-car-button"]').click();
    cy.get('[data-testid="garage-new-screen"]').should('be.visible');
    // Free-text make and model only appear after "Not in the album" (P0-07).
    cy.get('[data-testid="owner-make-input"]').should('not.exist');
    cy.get('[data-testid="not-in-album-button"]').click();
    cy.get('[data-testid="owner-make-input"]').type('Ferrari');
    cy.get('[data-testid="owner-model-input"]').type('308 GTSi');
    cy.get('[data-testid="owner-nickname-input"]').type('Magnum');
    cy.get('[data-testid="owner-plate-input"]').type('1-xyz-987');
    cy.get('[data-testid="visibility-option-hidden"]').should('have.attr', 'aria-checked', 'true');
    // From now on the list contains the new car.
    cy.intercept('GET', '**/rest/v1/owner_cars*', { statusCode: 200, body: [pending] }).as('ownerCarsAfter');
    cy.get('[data-testid="register-car-button"]').click();

    cy.wait('@registerCar').then(({ request }) => {
      expect(request.body).to.include({
        make: 'Ferrari',
        model: '308 GTSi',
        plate_input: '1XYZ987',
        visibility: 'hidden',
      });
      // The client can never verify itself or pick an owner.
      expect(request.body).not.to.have.any.keys('verified_at', 'owner_id', 'plate_hash', 'show_plate');
    });
    cy.get('[data-testid="owners-screen"]').should('be.visible');
    cy.get(`[data-testid="garage-car-status-${pending.id}"]`).should('contain.text', 'Waiting for verification');
    cy.get(`[data-testid="garage-car-pending-${pending.id}"]`)
      .should(
        'contain.text',
        'Pings start once your ownership is verified. During the beta the Redline team checks every owner by hand.',
      )
      .and('not.contain.text', 'README');
    cy.get('[data-testid="no-pings"]').should('be.visible');
  });

  it('shows the seeded verified car as Verified with its sighting, and opening it marks it read', () => {
    cy.stubSupabase({ ownerCars: [verifiedCar], pings: [sighting], stats });
    cy.loginThroughUi({ reduceMotion: true });
    // Unread count from get_owner_car_stats on the Garage tab badge.
    cy.get('[data-testid="tab-owners"]').should('contain.text', '1');
    cy.get('[data-testid="tab-owners"]').click();

    cy.get(`[data-testid="garage-car-status-${verifiedCar.id}"]`).should('contain.text', 'Verified');
    cy.get(`[data-testid="garage-car-sightings-${verifiedCar.id}"]`).should('contain.text', 'Spotted once');
    // Snapshot columns only: no join into the spotter's spot row, no spotter pseudonym; paged by 20.
    cy.wait('@pings').then(({ request }) => {
      const url = decodeURIComponent(request.url);
      expect(url).to.include('car_label').and.include('spotted_hour').and.include('limit=20');
      expect(url).not.to.include('spots(');
      expect(url).not.to.include('spot_id');
      expect(url).not.to.include('spotter_key');
    });

    cy.get(`[data-testid="sighting-${sighting.id}"]`).should('contain.text', 'Antwerpen').and('contain.text', ':00–');
    // Unread: a text-colour dot, announced as "New".
    cy.get(`[data-testid="sighting-unread-${sighting.id}"]`).should('be.visible').and('have.attr', 'aria-label', 'New');
    cy.get(`[data-testid="sighting-${sighting.id}"]`).click();

    cy.get('[data-testid="sighting-screen"]').should('be.visible');
    cy.wait('@markRead').then(({ request }) => {
      expect(request.url).to.include(`id=eq.${sighting.id}`);
      expect(request.body).to.have.property('read_at');
    });
    cy.get('[data-testid="sighting-city"]').should('have.text', 'Antwerpen');
    cy.get('[data-testid="sighting-hour"]')
      .invoke('text')
      .should('match', /\d{2}:00–\d{2}:00$/);
    // An anonymous spotter: no "Seen by" row and no name anywhere.
    cy.get('[data-testid="sighting-spotter"]').should('not.exist');
    cy.get('[data-testid="sighting-detail"]').should('not.contain.text', '@');
  });

  it('marks all sightings read', () => {
    cy.stubSupabase({ ownerCars: [verifiedCar], pings: [sighting], stats });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="tab-owners"]').click();
    // After the update the server counts 0 unread.
    cy.intercept('POST', '**/rest/v1/rpc/get_owner_car_stats', {
      statusCode: 200,
      body: [{ ...stats[0], unread: 0 }],
    }).as('statsAfter');
    cy.get('[data-testid="mark-read-button"]').click();
    cy.wait('@markRead').its('request.url').should('include', 'read_at=is.null');
    cy.get('[data-testid="mark-read-button"]').should('not.exist');
    cy.get(`[data-testid="sighting-unread-${sighting.id}"]`).should('not.exist');
  });

  it('pauses pings from the car settings', () => {
    cy.stubSupabase({ ownerCars: [verifiedCar], stats });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="tab-owners"]').click();
    cy.get(`[data-testid="garage-car-${verifiedCar.id}"]`).click();

    cy.get('[data-testid="garage-car-screen"]').should('be.visible');
    cy.get('[data-testid="garage-car-header-status"]').should('contain.text', 'Verified');
    cy.get('[data-testid="pause-pings-switch"]').should('have.attr', 'aria-checked', 'false').click();
    cy.wait('@updateOwnerCar').then(({ request }) => {
      expect(request.url).to.include(`id=eq.${verifiedCar.id}`);
      expect(request.body).to.deep.equal({ pings_paused: true });
    });
    cy.get('[data-testid="pause-pings-switch"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="garage-car-header-status"]').should('contain.text', 'Pings paused');
  });

  it('asks for the plate again before showing it as a vanity plate', () => {
    const badgeCar = { ...verifiedCar, visibility: 'badge', show_plate: false, plate_display: null };
    cy.stubSupabase({ ownerCars: [badgeCar], stats });
    cy.loginThroughUi({ reduceMotion: true });
    cy.get('[data-testid="tab-owners"]').click();
    cy.get(`[data-testid="garage-car-${verifiedCar.id}"]`).click();

    cy.get('[data-testid="visibility-option-vanity"]').click();
    cy.get('[data-testid="save-car-settings"]').click();
    cy.contains('Enter your licence plate (2 to 12 letters or digits).').scrollIntoView().should('be.visible');
    cy.get('[data-testid="visibility-plate-input"]').type('demo-123');
    cy.get('[data-testid="save-car-settings"]').click();
    cy.wait('@updateOwnerCar')
      .its('request.body')
      .should('deep.equal', { visibility: 'vanity', plate_input: 'DEMO-123' });
  });
});
