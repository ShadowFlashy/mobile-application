import { TEST_USER } from '../support/commands';

/** Draws a box over the photo with the mouse, like a user dragging over the licence plate. */
function dragBox(from: [number, number], to: [number, number]) {
  cy.get('[data-testid="plate-redactor"]')
    .trigger('mousedown', from[0], from[1], { eventConstructor: 'MouseEvent', button: 0, buttons: 1 })
    .trigger('mousemove', to[0], to[1], { eventConstructor: 'MouseEvent', button: 0, buttons: 1 })
    .trigger('mouseup', to[0], to[1], { eventConstructor: 'MouseEvent', button: 0 });
}

function choosePhoto() {
  cy.get('[data-testid="tab-spot"]').click();
  cy.get('[data-testid="choose-photo-button"]').click();
  cy.get('input[type="file"]').selectFile('cypress/fixtures/car.jpg', { force: true });
  cy.get('[data-testid="plate-redactor"]').should('be.visible');
  // The photo frame is measured one frame after it appears (onLayout on the web): wait for it.
  cy.wait(1000);
}

// The main use case: photograph a car, hide its plate and collect the sticker.
describe('Spotting a car', () => {
  beforeEach(() => {
    cy.stubSupabase();
    cy.intercept('POST', '**/storage/v1/object/spot-photos/**', (request) => {
      request.reply({ statusCode: 200, body: { Key: 'spot-photos/test.jpg', Id: 'test' } });
    }).as('upload');
    cy.intercept('POST', '**/rest/v1/spots*', (request) => {
      request.reply({
        statusCode: 201,
        body: {
          id: request.body.id,
          user_id: TEST_USER.id,
          car_model_id: request.body.car_model_id,
          make: request.body.make,
          model: request.body.model,
          photo_path: request.body.photo_path,
          location_label: request.body.location_label,
          notes: request.body.notes,
          spotted_at: new Date().toISOString(),
          owner_car_id: null,
          vanity_plate: null,
        },
      });
    }).as('createSpot');
    cy.loginThroughUi();
  });

  it('only continues once the plate is hidden or confirmed absent', () => {
    choosePhoto();
    cy.get('[data-testid="confirm-privacy-button"]').should('have.attr', 'aria-disabled', 'true');
    cy.get('[data-testid="no-plate-checkbox"]').click();
    cy.get('[data-testid="confirm-privacy-button"]').should('not.have.attr', 'aria-disabled', 'true');
  });

  it('marks an area to blur by dragging over the photo', () => {
    choosePhoto();
    dragBox([150, 170], [260, 210]);
    cy.get('[data-testid="redaction-box"]').should('have.length', 1);
    cy.get('[data-testid="undo-region-button"]').click();
    cy.get('[data-testid="redaction-box"]').should('not.exist');
  });

  it('blurs the plate, saves the spot and collects the sticker', () => {
    choosePhoto();
    dragBox([150, 170], [260, 210]);
    cy.get('[data-testid="confirm-privacy-button"]').click();
    cy.get('[data-testid="redacted-preview"]').should('be.visible');

    cy.get('[data-testid="car-model-search"]').type('porsche');
    cy.get('[data-testid="car-model-option-porsche-911-gt3"]').click();
    cy.get('[data-testid="selected-car-model"]').should('be.visible');
    cy.get('[data-testid="location-input"]').type('Leuven');
    cy.get('[data-testid="save-spot-button"]').click();

    // The photo is uploaded as an edited JPEG into the user's own folder.
    cy.wait('@upload').its('request.url').should('include', `/spot-photos/${TEST_USER.id}/`);
    cy.wait('@createSpot').its('request.body').should('include', {
      car_model_id: 'porsche-911-gt3',
      make: 'Porsche',
      model: '911 GT3',
      location_label: 'Leuven',
      plate_input: null,
    });

    cy.get('[data-testid="spot-detail-screen"]').should('be.visible');
    cy.get('[data-testid="spot-title"]').should('contain.text', 'Porsche 911 GT3');
  });

  it('sends a typed plate only in normalised form so a registered owner can be pinged', () => {
    choosePhoto();
    cy.get('[data-testid="no-plate-checkbox"]').click();
    cy.get('[data-testid="confirm-privacy-button"]').click();
    cy.get('[data-testid="car-model-search"]').type('chiron');
    cy.get('[data-testid="car-model-option-bugatti-chiron"]').click();
    cy.get('[data-testid="plate-input"]').type('1-abc-234');
    cy.get('[data-testid="save-spot-button"]').click();
    cy.wait('@createSpot').its('request.body.plate_input').should('eq', '1ABC234');
  });

  it('saves a car that is not in the sticker book as another find', () => {
    choosePhoto();
    cy.get('[data-testid="no-plate-checkbox"]').click();
    cy.get('[data-testid="confirm-privacy-button"]').click();
    cy.get('[data-testid="make-input"]').type('DeLorean');
    cy.get('[data-testid="model-input"]').type('DMC-12');
    cy.get('[data-testid="save-spot-button"]').click();
    cy.wait('@createSpot').its('request.body.car_model_id').should('eq', null);
    cy.get('[data-testid="spot-title"]').should('contain.text', 'DeLorean DMC-12');
  });
});
