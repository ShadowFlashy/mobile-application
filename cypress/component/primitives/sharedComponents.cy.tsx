import { ConfirmDialog } from '../../../src/components/ConfirmDialog';
import { HeaderBackButton } from '../../../src/components/HeaderBackButton';
import { OfflineBanner } from '../../../src/components/OfflineBanner';
import { StepIndicator } from '../../../src/components/StepIndicator';

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

describe('StepIndicator', () => {
  it('shows the current step', () => {
    cy.mount(<StepIndicator steps={['Photo', 'Hide plates', 'Details']} currentIndex={1} />);
    cy.get('[data-testid="step-indicator-label"]').should('contain.text', 'Hide plates');
  });
});

describe('HeaderBackButton', () => {
  it('has a translated name and a 44 px target', () => {
    const onPress = cy.stub().as('onBack');
    cy.mount(<HeaderBackButton onPress={onPress} />);
    cy.get('[data-testid="header-back"]')
      .should('have.attr', 'aria-label', 'Back')
      .then(($el) => {
        expect($el[0].getBoundingClientRect().width).to.be.at.least(44);
        expect($el[0].getBoundingClientRect().height).to.be.at.least(44);
      })
      .click();
    cy.get('@onBack').should('have.been.calledOnce');
  });
});
