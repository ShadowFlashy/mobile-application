import { TEST_USER } from '../support/commands';

const ownerCar = {
  id: '22222222-2222-4222-8222-222222222222',
  owner_id: TEST_USER.id,
  make: 'Ferrari',
  model: '296 GTB',
  nickname: 'Rosso',
  plate_hint: '87',
  show_plate: false,
  plate_display: null,
  created_at: '2026-11-01T10:00:00Z',
};

const ping = {
  id: '33333333-3333-4333-8333-333333333333',
  spot_id: '44444444-4444-4444-8444-444444444444',
  owner_car_id: ownerCar.id,
  created_at: new Date().toISOString(),
  read_at: null,
  owner_cars: { make: 'Ferrari', model: '296 GTB', nickname: 'Rosso' },
  spots: { location_label: 'Antwerpen', spotted_at: new Date().toISOString() },
};

describe('Owner portal', () => {
  it('registers a car with only a normalised plate sent to the server', () => {
    cy.stubSupabase();
    cy.intercept('POST', '**/rest/v1/owner_cars*', { statusCode: 201, body: ownerCar }).as('registerCar');
    cy.loginThroughUi();
    cy.get('[data-testid="tab-owners"]').click();
    cy.get('[data-testid="open-register-car"]').click();
    cy.get('[data-testid="owner-make-input"]').type('Ferrari');
    cy.get('[data-testid="owner-model-input"]').type('296 GTB');
    cy.get('[data-testid="owner-nickname-input"]').type('Rosso');
    cy.get('[data-testid="owner-plate-input"]').type('1-xyz-987');
    cy.get('[data-testid="register-car-button"]').click();
    cy.wait('@registerCar').its('request.body').should('include', { plate_input: '1XYZ987', show_plate: false });
    cy.get(`[data-testid="owner-car-${ownerCar.id}"]`).should('be.visible');
  });

  it('shows a ping when a registered car was spotted and marks it as read', () => {
    cy.stubSupabase({ ownerCars: [ownerCar], pings: [ping] });
    cy.intercept('PATCH', '**/rest/v1/spot_notifications*', { statusCode: 204 }).as('markRead');
    cy.loginThroughUi();
    cy.get('[data-testid="tab-owners"]').should('contain.text', '1');
    cy.get('[data-testid="tab-owners"]').click();
    cy.get(`[data-testid="ping-${ping.id}"]`).should('be.visible');
    cy.get('[data-testid="mark-read-button"]').click();
    cy.wait('@markRead');
    cy.get('[data-testid="mark-read-button"]').should('not.exist');
  });
});
