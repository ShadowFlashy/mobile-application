import { BrandHeader } from '../../../src/components/BrandHeader';
import { FormError } from '../../../src/components/brand/FormError';
import { NavItem } from '../../../src/components/primitives/NavItem';
import { Row } from '../../../src/components/primitives/Row';
import { darkColors, ThemeProvider } from '../../../src/theme';

/** '#RRGGBB' → 'rgb(r, g, b)', the way getComputedStyle reports colours. */
function rgb(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
}

describe('BrandHeader', () => {
  it('shows the rev-counter mark and the upright "Redline" wordmark', () => {
    cy.mount(<BrandHeader subtitle="Photograph the cars you spot." />);
    cy.get('[data-testid="brand-mark"]').should('exist');
    cy.get('svg path').should('exist');
    cy.get('[data-testid="brand-wordmark"]')
      .should('have.attr', 'aria-label', 'Redline')
      .and('contain.text', 'Redline');
    cy.get('[data-testid="brand-wordmark"] div')
      .filter((_, element) => element.textContent === 'Redline')
      .last()
      .should('have.css', 'font-style', 'normal')
      .and('have.css', 'text-transform', 'none')
      .and('have.css', 'font-family')
      .and('contain', 'BarlowCondensed_600SemiBold');
    cy.contains('Photograph the cars you spot.').should('be.visible');
  });

  it('draws a monochrome mark with a single red zone', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <BrandHeader subtitle="Tagline" />
      </ThemeProvider>,
    );
    const red = rgb(darkColors.red);
    cy.get('[data-testid="brand-mark"] path, [data-testid="brand-mark"] line, [data-testid="brand-mark"] circle').then(
      ($shapes) => {
        const reds = $shapes.filter(
          (_, shape) => getComputedStyle(shape).stroke === red || shape.getAttribute('stroke') === darkColors.red,
        );
        expect(reds.length, 'red shapes').to.equal(1);
      },
    );
  });
});

describe('Spot key (NavItem variant="key")', () => {
  it('is a labelled tab with a red key and a text-2 label, and calls onPress', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <ThemeProvider scheme="dark">
        <Row>
          <NavItem label="Spot" icon="camera" variant="key" onPress={onPress} testID="tab-spot" />
        </Row>
      </ThemeProvider>,
    );
    cy.get('[data-testid="tab-spot"]').should('have.attr', 'role', 'tab').and('contain.text', 'Spot');
    cy.get('[data-testid="tab-spot"] div')
      .filter((_, element) => getComputedStyle(element).backgroundColor === rgb(darkColors.red))
      .should('have.length', 1)
      .and('have.css', 'border-top-left-radius', '10px');
    cy.contains('Spot').should('have.css', 'color', rgb(darkColors.text2));
    cy.get('[data-testid="tab-spot"]').invoke('outerHeight').should('be.at.least', 44);
    cy.get('[data-testid="tab-spot"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('reports the selected state; an active tab is the text colour, never red', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <Row>
          <NavItem label="Album" icon="album" active onPress={() => undefined} testID="tab-index" />
          <NavItem label="Spot" icon="camera" variant="key" active onPress={() => undefined} testID="tab-spot" />
        </Row>
      </ThemeProvider>,
    );
    cy.get('[data-testid="tab-spot"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="tab-index"]').should('have.attr', 'aria-selected', 'true');
    cy.contains('Album').should('have.css', 'color', rgb(darkColors.text));
  });
});

describe('FormError', () => {
  it('announces the message as an icon plus text, never red', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <FormError message="Wrong email or password." testID="form-error" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="form-error"]')
      .should('have.attr', 'role', 'alert')
      .and('contain.text', 'Wrong email or password.');
    cy.get('[data-testid="form-error"] svg').should('exist');
    cy.contains('Wrong email or password.').should('have.css', 'color', rgb(darkColors.text));
  });

  it('renders nothing without a message', () => {
    cy.mount(<FormError testID="form-error" />);
    cy.get('[data-testid="form-error"]').should('not.exist');
  });
});
