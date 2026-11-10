import { BrandHeader } from '../../../src/components/BrandHeader';
import { FormError } from '../../../src/components/brand/FormError';
import { IgnitionButton } from '../../../src/components/brand/IgnitionButton';
import { Row } from '../../../src/components/primitives/Row';

describe('BrandHeader', () => {
  it('shows the tachometer mark and the REDLINE wordmark', () => {
    cy.mount(<BrandHeader subtitle="Snap it. We blur it. You collect it." />);
    cy.get('[data-testid="brand-mark"]').should('exist');
    cy.get('svg path').should('exist');
    cy.get('[data-testid="brand-wordmark"]')
      .should('have.attr', 'aria-label', 'Redline')
      .and('contain.text', 'Redline');
    cy.contains('Snap it. We blur it. You collect it.').should('be.visible');
  });
});

describe('IgnitionButton', () => {
  it('is a labelled 64 dp tab that calls onPress', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <Row>
        <IgnitionButton label="SPOT" onPress={onPress} testID="tab-spot" />
      </Row>,
    );
    cy.get('[data-testid="tab-spot"]').should('have.attr', 'role', 'tab').and('contain.text', 'SPOT');
    cy.get('[data-testid="tab-spot"]').invoke('outerHeight').should('be.at.least', 64);
    cy.get('[data-testid="tab-spot"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('reports the selected state', () => {
    cy.mount(
      <Row>
        <IgnitionButton label="SPOT" onPress={() => undefined} active testID="tab-spot" />
      </Row>,
    );
    cy.get('[data-testid="tab-spot"]').should('have.attr', 'aria-selected', 'true');
  });
});

describe('FormError', () => {
  it('announces the message', () => {
    cy.mount(<FormError message="Wrong email or password." testID="form-error" />);
    cy.get('[data-testid="form-error"]')
      .should('have.attr', 'role', 'alert')
      .and('contain.text', 'Wrong email or password.');
  });

  it('renders nothing without a message', () => {
    cy.mount(<FormError testID="form-error" />);
    cy.get('[data-testid="form-error"]').should('not.exist');
  });
});
