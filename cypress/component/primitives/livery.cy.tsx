import { useState } from 'react';
import { Grid } from '../../../src/components/primitives/Grid';
import { IconButton } from '../../../src/components/primitives/IconButton';
import { PressableScale } from '../../../src/components/primitives/PressableScale';
import { SegmentedControl } from '../../../src/components/primitives/SegmentedControl';
import { Sheet } from '../../../src/components/primitives/Sheet';
import { Surface } from '../../../src/components/primitives/Surface';
import { Switch } from '../../../src/components/primitives/Switch';
import { Tag } from '../../../src/components/primitives/Tag';
import { Text } from '../../../src/components/primitives/Text';
import { Toast } from '../../../src/components/primitives/Toast';
import { StyledButton, type ButtonVariant } from '../../../src/components/StyledButton';
import { darkColors, lightColors, ThemeProvider } from '../../../src/theme';

/** '#RRGGBB' → 'rgb(r, g, b)', the way getComputedStyle reports colours. */
function rgb(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
}

describe('Text variants and tones', () => {
  it('renders a variant with its family, size and case', () => {
    cy.mount(
      <ThemeProvider scheme="light">
        <Text variant="hero" testID="text">
          Redline
        </Text>
      </ThemeProvider>,
    );
    cy.get('[data-testid="text"]')
      .should('have.css', 'font-size', '44px')
      .and('have.css', 'text-transform', 'uppercase')
      .and('have.css', 'font-family')
      .and('contain', 'BarlowCondensed_800ExtraBold_Italic');
  });

  it('defaults to body in the default tone', () => {
    cy.mount(
      <ThemeProvider scheme="light">
        <Text testID="text">Body</Text>
      </ThemeProvider>,
    );
    cy.get('[data-testid="text"]')
      .should('have.css', 'font-size', '16px')
      .and('have.css', 'color', rgb(lightColors.text))
      .and('have.css', 'font-family')
      .and('contain', 'Barlow_400Regular');
  });

  it('resolves tones per scheme', () => {
    cy.mount(
      <>
        <ThemeProvider scheme="light">
          <Text tone="accent" testID="light-accent">
            Accent
          </Text>
        </ThemeProvider>
        <ThemeProvider scheme="dark">
          <Text tone="accent" testID="dark-accent">
            Accent
          </Text>
          <Text tone="muted" testID="dark-muted">
            Muted
          </Text>
        </ThemeProvider>
      </>,
    );
    cy.get('[data-testid="light-accent"]').should('have.css', 'color', rgb(lightColors.accent));
    cy.get('[data-testid="dark-accent"]').should('have.css', 'color', rgb(darkColors.accent));
    cy.get('[data-testid="dark-muted"]').should('have.css', 'color', rgb(darkColors.textMuted));
  });

  it('maps the deprecated size/weight props onto variants', () => {
    cy.mount(
      <Text size="xxl" weight="bold" testID="text">
        Legacy
      </Text>,
    );
    cy.get('[data-testid="text"]')
      .should('have.css', 'font-size', '24px')
      .and('have.css', 'text-transform', 'uppercase');
  });

  it('loads the LIVERY faces from fonts.css', () => {
    cy.mount(<Text variant="hero">Redline</Text>);
    cy.document().then((doc) =>
      doc.fonts.load('16px BarlowCondensed_800ExtraBold_Italic').then(() => {
        expect(doc.fonts.check('16px BarlowCondensed_800ExtraBold_Italic')).to.equal(true);
      }),
    );
  });
});

describe('StyledButton', () => {
  const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'danger', 'ghost', 'ignition'];

  VARIANTS.forEach((variant) => {
    it(`renders the ${variant} variant as a labelled button`, () => {
      const onPress = cy.stub().as('onPress');
      cy.mount(<StyledButton label="Collect" variant={variant} onPress={onPress} testID="button" />);
      cy.get('[data-testid="button"]').should('have.attr', 'role', 'button').and('have.attr', 'aria-label', 'Collect');
      cy.get('[data-testid="button"]').click();
      cy.get('@onPress').should('have.been.calledOnce');
    });
  });

  it('paints the ignition variant with the red gradient', () => {
    cy.mount(<StyledButton label="Collect" variant="ignition" onPress={() => undefined} testID="button" />);
    cy.get('[data-testid="button"] div')
      .filter((_, element) => getComputedStyle(element).backgroundImage.includes('linear-gradient'))
      .should('have.length.at.least', 1);
  });

  it('cannot be pressed when disabled', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<StyledButton label="Collect" onPress={onPress} disabled testID="button" />);
    cy.get('[data-testid="button"]').should('have.attr', 'aria-disabled', 'true').click({ force: true });
    cy.get('@onPress').should('not.have.been.called');
  });

  it('shows a spinner and reports busy while loading', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<StyledButton label="Collect" onPress={onPress} isLoading testID="button" />);
    cy.get('[data-testid="button"]').should('have.attr', 'aria-busy', 'true');
    cy.get('[data-testid="button"] [role="progressbar"]').should('exist');
    cy.get('[data-testid="button"]').click({ force: true });
    cy.get('@onPress').should('not.have.been.called');
  });
});

describe('Surface', () => {
  it('uses the token background of its variant', () => {
    cy.mount(
      <ThemeProvider scheme="light">
        <Surface testID="raised">
          <Text>Raised</Text>
        </Surface>
        <Surface variant="sunken" testID="sunken">
          <Text>Sunken</Text>
        </Surface>
        <Surface variant="stage" testID="stage">
          <Text tone="onStage">Stage</Text>
        </Surface>
      </ThemeProvider>,
    );
    cy.get('[data-testid="raised"]').should('have.css', 'background-color', rgb(lightColors.surface));
    cy.get('[data-testid="sunken"]').should('have.css', 'background-color', rgb(lightColors.surfaceSunken));
    cy.get('[data-testid="stage"]').should('have.css', 'background-color', rgb(lightColors.stage));
  });

  it('becomes a labelled button with onPress', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <Surface onPress={onPress} accessibilityLabel="Open sticker" testID="surface">
        <Text>Tap</Text>
      </Surface>,
    );
    cy.get('[data-testid="surface"]')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'aria-label', 'Open sticker');
    cy.get('[data-testid="surface"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });
});

describe('PressableScale', () => {
  it('calls onPress', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <PressableScale onPress={onPress} accessibilityLabel="Press" haptic="tap" testID="pressable">
        <Text>Press</Text>
      </PressableScale>,
    );
    cy.get('[data-testid="pressable"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('ignores presses when disabled', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <PressableScale onPress={onPress} accessibilityLabel="Press" disabled testID="pressable">
        <Text>Press</Text>
      </PressableScale>,
    );
    cy.get('[data-testid="pressable"]').click({ force: true });
    cy.get('@onPress').should('not.have.been.called');
  });
});

describe('Switch', () => {
  it('is an accessible switch that reports the new value', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(
      <Switch label="Co-Driver" description="Identify cars" value={false} onChange={onChange} testID="switch" />,
    );
    cy.get('[data-testid="switch"]').should('have.attr', 'role', 'switch').and('have.attr', 'aria-checked', 'false');
    cy.get('[data-testid="switch"]').click();
    cy.get('@onChange').should('have.been.calledOnceWith', true);
  });

  it('toggles when controlled', () => {
    function Controlled() {
      const [value, setValue] = useState(true);
      return <Switch label="Haptics" value={value} onChange={setValue} testID="switch" />;
    }
    cy.mount(<Controlled />);
    cy.get('[data-testid="switch"]').should('have.attr', 'aria-checked', 'true').click();
    cy.get('[data-testid="switch"]').should('have.attr', 'aria-checked', 'false');
  });

  it('is at least 48 dp tall', () => {
    cy.mount(<Switch label="Haptics" value onChange={() => undefined} testID="switch" />);
    cy.get('[data-testid="switch"]').invoke('outerHeight').should('be.at.least', 48);
  });
});

describe('Sheet', () => {
  it('shows its title and content and closes from the close button', () => {
    const onClose = cy.stub().as('onClose');
    cy.mount(
      <Sheet visible title="Co-Driver" onClose={onClose} testID="sheet">
        <Text>Sheet content</Text>
      </Sheet>,
    );
    cy.get('[data-testid="sheet"]').should('contain.text', 'Co-Driver').and('contain.text', 'Sheet content');
    cy.get('[data-testid="sheet-close"]').should('have.attr', 'aria-label', 'Close Co-Driver').click();
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('closes from the backdrop', () => {
    const onClose = cy.stub().as('onClose');
    cy.mount(
      <Sheet visible title="Co-Driver" onClose={onClose} testID="sheet">
        <Text>Sheet content</Text>
      </Sheet>,
    );
    cy.get('[data-testid="sheet-backdrop"]').click('top');
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('renders nothing when hidden', () => {
    cy.mount(
      <Sheet visible={false} title="Co-Driver" onClose={() => undefined} testID="sheet">
        <Text>Sheet content</Text>
      </Sheet>,
    );
    cy.get('[data-testid="sheet"]').should('not.exist');
  });
});

describe('SegmentedControl', () => {
  const OPTIONS = [
    { value: 'badge', label: 'Owner badge' },
    { value: 'vanity', label: 'Vanity plate' },
  ] as const;

  it('marks the selected option and reports a new choice', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<SegmentedControl options={OPTIONS} value="badge" onChange={onChange} testID="visibility" />);
    cy.get('[data-testid="visibility-badge"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="visibility-vanity"]').should('have.attr', 'aria-checked', 'false').click();
    cy.get('@onChange').should('have.been.calledOnceWith', 'vanity');
  });
});

describe('IconButton', () => {
  it('has an accessible label and no badge without a count', () => {
    cy.mount(<IconButton icon="notifications-outline" label="Sightings" onPress={() => undefined} testID="bell" />);
    cy.get('[data-testid="bell"]').should('have.attr', 'aria-label', 'Sightings');
    cy.get('[data-testid="bell-badge"]').should('not.exist');
  });

  it('shows the unread count in the badge and in its label', () => {
    cy.mount(
      <IconButton
        icon="notifications-outline"
        label="Sightings"
        badgeCount={3}
        onPress={() => undefined}
        testID="bell"
      />,
    );
    cy.get('[data-testid="bell-badge"]').should('have.text', '3');
    cy.get('[data-testid="bell"]').should('have.attr', 'aria-label', 'Sightings, 3 new notifications');
  });

  it('caps the badge at 9+', () => {
    cy.mount(
      <IconButton
        icon="notifications-outline"
        label="Sightings"
        badgeCount={12}
        onPress={() => undefined}
        testID="bell"
      />,
    );
    cy.get('[data-testid="bell-badge"]').should('have.text', '9+');
  });

  it('is a 48 dp target that calls onPress', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<IconButton icon="close" label="Close" onPress={onPress} testID="close" />);
    cy.get('[data-testid="close"]').invoke('outerHeight').should('be.at.least', 48);
    cy.get('[data-testid="close"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });
});

describe('Grid', () => {
  const CARS = ['porsche', 'mazda', 'ferrari', 'bmw', 'fiat'];

  it('renders every item in equal-width columns, also in the last row', () => {
    cy.viewport(400, 800);
    cy.mount(
      <Grid
        data={CARS}
        columns={2}
        keyExtractor={(car) => car}
        renderItem={({ item }) => <Text testID={`cell-${item}`}>{item}</Text>}
        testID="grid"
      />,
    );
    CARS.forEach((car) => cy.get(`[data-testid="cell-${car}"]`).should('exist'));
    cy.get('[data-testid="cell-porsche"]').then(($first) => {
      cy.get('[data-testid="cell-fiat"]').invoke('outerWidth').should('equal', $first.outerWidth());
    });
  });

  it('shows the empty state without data', () => {
    cy.mount(
      <Grid
        data={[]}
        columns={3}
        keyExtractor={(car: string) => car}
        renderItem={({ item }) => <Text>{item}</Text>}
        empty={<Text testID="empty">Nothing here</Text>}
      />,
    );
    cy.get('[data-testid="empty"]').should('be.visible');
  });
});

describe('Tag', () => {
  it('renders the AUTO tone as a signal-yellow tag', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <Tag label="Auto" tone="auto" testID="tag" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="tag"]').should('have.css', 'background-color', rgb(darkColors.signal));
    cy.get('[data-testid="tag"]').contains('Auto').should('have.css', 'text-transform', 'uppercase');
  });

  it('marks a selected chip for screen readers', () => {
    cy.mount(<Tag label="JDM" selected onPress={() => undefined} testID="tag" />);
    cy.get('[data-testid="tag"]').should('have.attr', 'aria-selected', 'true');
  });
});

describe('Toast', () => {
  it('runs its action', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<Toast message="Update available" visible action={{ label: 'Reload', onPress }} testID="toast" />);
    cy.get('[data-testid="toast"]').should('have.attr', 'role', 'alert').and('contain.text', 'Update available');
    cy.get('[data-testid="toast-action"]').should('have.attr', 'aria-label', 'Reload').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('has no action button without an action', () => {
    cy.mount(<Toast message="Saved" variant="success" visible testID="toast" />);
    cy.get('[data-testid="toast-action"]').should('not.exist');
  });

  it('renders nothing when hidden', () => {
    cy.mount(<Toast message="Saved" visible={false} testID="toast" />);
    cy.get('[data-testid="toast"]').should('not.exist');
  });
});
