import { Checkbox } from '../../src/components/primitives/Checkbox';
import { InputField } from '../../src/components/primitives/InputField';
import { ProgressBar } from '../../src/components/primitives/ProgressBar';
import { StyledButton } from '../../src/components/StyledButton';

describe('StyledButton', () => {
  it('calls onPress when pressed', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<StyledButton label="Save" onPress={onPress} testID="button" />);
    cy.get('[data-testid="button"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('cannot be pressed while loading', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<StyledButton label="Save" onPress={onPress} isLoading testID="button" />);
    cy.get('[data-testid="button"]').click({ force: true });
    cy.get('@onPress').should('not.have.been.called');
  });

  it('is announced as a button with its label', () => {
    cy.mount(<StyledButton label="Save" onPress={() => undefined} testID="button" />);
    cy.get('[data-testid="button"]').should('have.attr', 'role', 'button').and('have.attr', 'aria-label', 'Save');
  });
});

describe('InputField', () => {
  it('shows the error message under the field', () => {
    cy.mount(
      <InputField label="Email" value="" onChangeText={() => undefined} error="Enter a valid email" testID="email" />,
    );
    cy.get('[data-testid="email-error"]').should('contain.text', 'Enter a valid email');
  });

  it('reports typed text', () => {
    const onChangeText = cy.stub().as('onChangeText');
    cy.mount(<InputField label="Email" value="" onChangeText={onChangeText} testID="email" />);
    cy.get('[data-testid="email"]').type('a');
    cy.get('@onChangeText').should('have.been.calledWith', 'a');
  });
});

describe('ProgressBar', () => {
  it('exposes its value to screen readers', () => {
    cy.mount(<ProgressBar progress={0.25} label="Collection" testID="progress" />);
    cy.get('[data-testid="progress"]').should('have.attr', 'aria-valuenow', '25');
  });

  it('clamps values above 100 %', () => {
    cy.mount(<ProgressBar progress={3} label="Collection" testID="progress" />);
    cy.get('[data-testid="progress"]').should('have.attr', 'aria-valuenow', '100');
  });
});

describe('Checkbox', () => {
  it('toggles its value', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<Checkbox label="No plate visible" checked={false} onChange={onChange} testID="checkbox" />);
    cy.get('[data-testid="checkbox"]').click();
    cy.get('@onChange').should('have.been.calledWith', true);
  });
});
