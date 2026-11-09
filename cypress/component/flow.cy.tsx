import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { PingItem } from '../../src/components/PingItem';
import { PlateRedactor } from '../../src/components/PlateRedactor';
import type { SpotPing } from '../../src/types/OwnerCar';

const ping: SpotPing = {
  id: 'ping-1',
  spotId: 'spot-1',
  ownerCarId: 'car-1',
  carMake: 'Ferrari',
  carModel: '296 GTB',
  carNickname: 'Rosso',
  locationLabel: 'Antwerpen',
  spottedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  isRead: false,
};

describe('ConfirmDialog', () => {
  it('confirms a destructive action', () => {
    const onConfirm = cy.stub().as('onConfirm');
    cy.mount(
      <ConfirmDialog
        visible
        title="Delete?"
        message="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={onConfirm}
        onCancel={() => undefined}
      />,
    );
    cy.get('[data-testid="confirm-dialog-confirm"]').click();
    cy.get('@onConfirm').should('have.been.calledOnce');
  });

  it('can be cancelled', () => {
    const onCancel = cy.stub().as('onCancel');
    cy.mount(
      <ConfirmDialog
        visible
        title="Delete?"
        message="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => undefined}
        onCancel={onCancel}
      />,
    );
    cy.get('[data-testid="confirm-dialog-cancel"]').click();
    cy.get('@onCancel').should('have.been.calledOnce');
  });
});

describe('OfflineBanner', () => {
  it('is shown when offline', () => {
    cy.mount(<OfflineBanner visible />);
    cy.get('[data-testid="offline-banner"]').should('be.visible');
  });

  it('is hidden when online', () => {
    cy.mount(<OfflineBanner visible={false} />);
    cy.get('[data-testid="offline-banner"]').should('not.exist');
  });
});

describe('PingItem', () => {
  it('tells the owner where their car was spotted', () => {
    cy.mount(<PingItem ping={ping} onPress={() => undefined} />);
    cy.get('[data-testid="ping-ping-1"]').should('contain.text', 'Ferrari 296 GTB').and('contain.text', 'Antwerpen');
  });
});

describe('PlateRedactor', () => {
  it('turns a drag over the photo into a region to blur', () => {
    const onAddRegion = cy.stub().as('onAddRegion');
    cy.fixture('car.jpg', 'base64').then((base64: string) => {
      cy.mount(
        <div style={{ width: 400 }}>
          <PlateRedactor
            photo={{ uri: `data:image/jpeg;base64,${base64}`, width: 800, height: 600 }}
            regions={[]}
            onAddRegion={onAddRegion}
            testID="redactor"
          />
        </div>,
      );
    });
    // onLayout on the web comes from a ResizeObserver one frame after mounting: wait for it.
    cy.wait(1000);
    cy.get('[data-testid="redactor"]')
      .trigger('mousedown', 160, 160, { eventConstructor: 'MouseEvent', button: 0, buttons: 1 })
      .trigger('mousemove', 240, 190, { eventConstructor: 'MouseEvent', button: 0, buttons: 1 })
      .trigger('mouseup', 240, 190, { eventConstructor: 'MouseEvent', button: 0 });
    cy.get('@onAddRegion').should('have.been.calledOnce');
  });

  it('draws the regions that will be blurred', () => {
    cy.fixture('car.jpg', 'base64').then((base64: string) => {
      cy.mount(
        <div style={{ width: 400 }}>
          <PlateRedactor
            photo={{ uri: `data:image/jpeg;base64,${base64}`, width: 800, height: 600 }}
            regions={[{ x: 0.42, y: 0.55, width: 0.16, height: 0.06 }]}
            onAddRegion={() => undefined}
          />
        </div>,
      );
    });
    cy.get('[data-testid="redaction-box"]').should('have.length', 1);
  });
});
