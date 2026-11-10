import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { lightColors } from '../../../src/theme';

// Smoke test of the two new UI dependencies (D-10) in the Cypress/Vite toolchain.
describe('UI dependencies', () => {
  it('renders an SVG path through react-native-svg', () => {
    cy.mount(
      <Svg width={48} height={48} viewBox="0 0 48 48" testID="deps-svg">
        <Path d="M4 40 L24 8 L44 40 Z" fill="currentColor" />
      </Svg>,
    );
    cy.get('svg').should('exist');
    cy.get('svg path').should('have.attr', 'd', 'M4 40 L24 8 L44 40 Z');
  });

  it('renders a linear gradient through expo-linear-gradient', () => {
    cy.mount(
      <LinearGradient
        colors={[lightColors.red, lightColors.redPressed]}
        style={{ width: 48, height: 48 }}
        testID="deps-gradient"
      />,
    );
    cy.get('[data-testid="deps-gradient"]')
      .should('exist')
      .and(($element) => {
        const element = $element.get(0);
        expect(element).to.be.instanceOf(HTMLElement);
        if (element instanceof HTMLElement) {
          expect(getComputedStyle(element).backgroundImage).to.contain('linear-gradient');
        }
      });
  });
});
