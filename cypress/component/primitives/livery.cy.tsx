import { useState } from 'react';
import { Grid } from '../../../src/components/primitives/Grid';
import { IconButton } from '../../../src/components/primitives/IconButton';
import { PressableScale } from '../../../src/components/primitives/PressableScale';
import { SegmentedControl } from '../../../src/components/primitives/SegmentedControl';
import { Sheet } from '../../../src/components/primitives/Sheet';
import { Surface } from '../../../src/components/primitives/Surface';
import { Switch } from '../../../src/components/primitives/Switch';
import { Text } from '../../../src/components/primitives/Text';
import { Toast } from '../../../src/components/primitives/Toast';
import { StyledButton, type ButtonVariant } from '../../../src/components/StyledButton';
import { darkColors, lightColors, ThemeProvider } from '../../../src/theme';

// Direction A ("Timing screen") restyle of the shared primitives. The file keeps its LIVERY name so
// the history of these checks stays in one place.

/** '#RRGGBB' → 'rgb(r, g, b)', the way getComputedStyle reports colours. */
function rgb(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
}

/** The element that renders a text itself (cy.contains prefers the surrounding <button>). */
function leaf(text: string) {
  return cy.get('div, span').filter((_, element) => element.childElementCount === 0 && element.textContent === text);
}

describe('Text variants and tones', () => {
  it('renders the hero numeral upright in Barlow Condensed 600, with tabular figures and no uppercase', () => {
    cy.mount(
      <ThemeProvider scheme="light">
        <Text variant="hero" testID="text">
          10
        </Text>
      </ThemeProvider>,
    );
    cy.get('[data-testid="text"]')
      .should('have.css', 'font-size', '80px')
      .and('have.css', 'text-transform', 'none')
      .and('have.css', 'font-style', 'normal')
      .and('have.css', 'font-variant-numeric', 'tabular-nums')
      .and('have.css', 'font-family')
      .and('contain', 'BarlowCondensed_600SemiBold');
  });

  it('defaults to body (Barlow 500, 15 px) in the text tone', () => {
    cy.mount(
      <ThemeProvider scheme="light">
        <Text testID="text">Body</Text>
      </ThemeProvider>,
    );
    cy.get('[data-testid="text"]')
      .should('have.css', 'font-size', '15px')
      .and('have.css', 'color', rgb(lightColors.text))
      .and('have.css', 'font-family')
      .and('contain', 'Barlow_500Medium');
  });

  it('resolves tones per scheme, and maps the old accent and muted tones onto text and text-2', () => {
    cy.mount(
      <>
        <ThemeProvider scheme="light">
          <Text tone="text2" testID="light-text2">
            Secondary
          </Text>
          <Text tone="accent" testID="light-accent">
            Accent
          </Text>
        </ThemeProvider>
        <ThemeProvider scheme="dark">
          <Text tone="text2" testID="dark-text2">
            Secondary
          </Text>
          <Text tone="muted" testID="dark-muted">
            Muted
          </Text>
          <Text tone="onRed" testID="dark-on-red">
            On red
          </Text>
        </ThemeProvider>
      </>,
    );
    cy.get('[data-testid="light-text2"]').should('have.css', 'color', rgb(lightColors.text2));
    cy.get('[data-testid="light-accent"]').should('have.css', 'color', rgb(lightColors.text));
    cy.get('[data-testid="dark-text2"]').should('have.css', 'color', rgb(darkColors.text2));
    cy.get('[data-testid="dark-muted"]').should('have.css', 'color', rgb(darkColors.text2));
    cy.get('[data-testid="dark-on-red"]').should('have.css', 'color', rgb(darkColors.onRed));
  });

  it('maps the deprecated size/weight props and variant names onto A variants', () => {
    cy.mount(
      <>
        <Text size="xxl" weight="bold" testID="legacy-size">
          Legacy
        </Text>
        <Text variant="label" testID="legacy-label">
          Label
        </Text>
      </>,
    );
    cy.get('[data-testid="legacy-size"]').should('have.css', 'font-size', '34px');
    cy.get('[data-testid="legacy-label"]')
      .should('have.css', 'font-size', '13px')
      .and('have.css', 'text-transform', 'none');
  });

  it('loads the A faces from fonts.css', () => {
    cy.mount(<Text variant="title">Album</Text>);
    cy.document().then((doc) =>
      Promise.all([doc.fonts.load('16px BarlowCondensed_600SemiBold'), doc.fonts.load('16px Barlow_600SemiBold')]).then(
        () => {
          expect(doc.fonts.check('16px BarlowCondensed_600SemiBold')).to.equal(true);
          expect(doc.fonts.check('16px Barlow_600SemiBold')).to.equal(true);
        },
      ),
    );
  });
});

describe('StyledButton', () => {
  const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'text', 'destructive', 'ghost', 'danger', 'ignition'];

  VARIANTS.forEach((variant) => {
    it(`renders the ${variant} variant as a labelled button`, () => {
      const onPress = cy.stub().as('onPress');
      cy.mount(<StyledButton label="Add to album" variant={variant} onPress={onPress} testID="button" />);
      cy.get('[data-testid="button"]')
        .should('have.attr', 'role', 'button')
        .and('have.attr', 'aria-label', 'Add to album');
      cy.get('[data-testid="button"]').click();
      cy.get('@onPress').should('have.been.calledOnce');
    });
  });

  it('paints the primary button red with a white sentence-case label, 52 px high, radius 8, no gradient', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <StyledButton label="Add to album" onPress={() => undefined} testID="button" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="button"] div')
      .filter((_, element) => getComputedStyle(element).backgroundColor === rgb(darkColors.red))
      .should('have.length', 1)
      .and('have.css', 'border-top-left-radius', '8px')
      .invoke('outerHeight')
      .should('be.at.least', 52);
    leaf('Add to album').should('have.css', 'color', rgb(darkColors.onRed)).and('have.css', 'text-transform', 'none');
    cy.get('[data-testid="button"] div')
      .filter((_, element) => getComputedStyle(element).backgroundImage.includes('gradient'))
      .should('have.length', 0);
  });

  it('turns a disabled primary button into a raise fill with a text-2 label', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <ThemeProvider scheme="dark">
        <StyledButton label="Add to album" onPress={onPress} disabled testID="button" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="button"]').should('have.attr', 'aria-disabled', 'true').click({ force: true });
    cy.get('@onPress').should('not.have.been.called');
    cy.get('[data-testid="button"] div')
      .filter((_, element) => getComputedStyle(element).backgroundColor === rgb(darkColors.raise))
      .should('have.length', 1);
    leaf('Add to album').should('have.css', 'color', rgb(darkColors.text2));
  });

  it('shows a spinner and reports busy while loading', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<StyledButton label="Add to album" onPress={onPress} isLoading testID="button" />);
    cy.get('[data-testid="button"]').should('have.attr', 'aria-busy', 'true');
    cy.get('[data-testid="button"] [role="progressbar"]').should('exist');
    cy.get('[data-testid="button"]').click({ force: true });
    cy.get('@onPress').should('not.have.been.called');
  });

  it('keeps a text action at least 44 px tall', () => {
    cy.mount(<StyledButton label="See all" variant="text" onPress={() => undefined} testID="button" />);
    cy.get('[data-testid="button"]').invoke('outerHeight').should('be.at.least', 44);
  });
});

describe('Surface', () => {
  it('is flat by default; raise is the one filled block; the stage stays dark', () => {
    cy.mount(
      <ThemeProvider scheme="light">
        <Surface testID="flat">
          <Text>Flat</Text>
        </Surface>
        <Surface variant="raise" testID="raise">
          <Text>Raise</Text>
        </Surface>
        <Surface variant="sunken" testID="sunken">
          <Text>Sunken</Text>
        </Surface>
        <Surface variant="stage" testID="stage">
          <Text tone="onStage">Stage</Text>
        </Surface>
      </ThemeProvider>,
    );
    cy.get('[data-testid="flat"]')
      .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
      .and('have.css', 'box-shadow', 'none')
      .and('have.css', 'border-top-width', '0px');
    cy.get('[data-testid="raise"]')
      .should('have.css', 'background-color', rgb(lightColors.raise))
      .and('have.css', 'border-top-left-radius', '8px');
    cy.get('[data-testid="sunken"]').should('have.css', 'background-color', rgb(lightColors.raise));
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
      <Switch label="Auto-fill" description="Identify cars" value={false} onChange={onChange} testID="switch" />,
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

  it('toggles with Space and names its description for screen readers on the web', () => {
    function Controlled() {
      const [value, setValue] = useState(false);
      return <Switch label="Auto-fill" description="Identify cars" value={value} onChange={setValue} testID="switch" />;
    }
    cy.mount(<Controlled />);
    cy.get('[data-testid="switch"]').trigger('keydown', { key: ' ' });
    cy.get('[data-testid="switch"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="switch"]')
      .invoke('attr', 'aria-describedby')
      .then((id) => {
        cy.get(`[id="${String(id)}"]`).should('have.text', 'Identify cars');
      });
  });

  it('is at least 44 px tall, with an iOS-like 51 × 31 track: line when off, text colour when on', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <Switch label="Haptics" value={false} onChange={() => undefined} testID="off" />
        <Switch label="Haptics" value onChange={() => undefined} testID="on" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="off"]').invoke('outerHeight').should('be.at.least', 44);
    const track = (id: string) =>
      cy
        .get(`[data-testid="${id}"] div`)
        .filter(
          (_, element) => element.getBoundingClientRect().width === 51 && element.getBoundingClientRect().height === 31,
        );
    track('off').should('have.length', 1).and('have.css', 'background-color', rgb(darkColors.line));
    track('on').should('have.length', 1).and('have.css', 'background-color', rgb(darkColors.text));
  });
});

describe('Sheet', () => {
  it('shows its title and content and closes from the close button', () => {
    const onClose = cy.stub().as('onClose');
    cy.mount(
      <Sheet visible title="Auto-fill" onClose={onClose} testID="sheet">
        <Text>Sheet content</Text>
      </Sheet>,
    );
    cy.get('[data-testid="sheet"]').should('contain.text', 'Auto-fill').and('contain.text', 'Sheet content');
    cy.get('[data-testid="sheet-close"]').should('have.attr', 'aria-label', 'Close Auto-fill').click();
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('closes from the backdrop', () => {
    const onClose = cy.stub().as('onClose');
    cy.mount(
      <Sheet visible title="Auto-fill" onClose={onClose} testID="sheet">
        <Text>Sheet content</Text>
      </Sheet>,
    );
    cy.get('[data-testid="sheet-backdrop"]').click('top');
    cy.get('@onClose').should('have.been.calledOnce');
  });

  it('renders nothing when hidden', () => {
    cy.mount(
      <Sheet visible={false} title="Auto-fill" onClose={() => undefined} testID="sheet">
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

  it('works as text tabs with a 2 px text-colour underline under the active tab', () => {
    const TABS = [
      { value: 'pages', label: 'Pages' },
      { value: 'collections', label: 'Collections' },
    ] as const;
    cy.mount(
      <ThemeProvider scheme="dark">
        <SegmentedControl options={TABS} value="pages" onChange={() => undefined} role="tab" testID="contents" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="contents"]').should('have.attr', 'role', 'tablist');
    cy.get('[data-testid="contents-pages"]')
      .should('have.attr', 'role', 'tab')
      .and('have.attr', 'aria-selected', 'true')
      .and('have.css', 'border-bottom-width', '2px')
      .and('have.css', 'border-bottom-color', rgb(darkColors.text));
    cy.get('[data-testid="contents-collections"]').should('have.attr', 'aria-selected', 'false');
    cy.get('[data-testid="contents-pages"]').invoke('outerHeight').should('be.at.least', 44);
  });
});

describe('IconButton', () => {
  it('has an accessible label and no badge without a count', () => {
    cy.mount(<IconButton icon="bell" label="Sightings" onPress={() => undefined} testID="bell" />);
    cy.get('[data-testid="bell"]').should('have.attr', 'aria-label', 'Sightings');
    cy.get('[data-testid="bell-badge"]').should('not.exist');
  });

  it('shows the unread count in the badge and in its label', () => {
    cy.mount(<IconButton icon="bell" label="Sightings" badgeCount={3} onPress={() => undefined} testID="bell" />);
    cy.get('[data-testid="bell-badge"]').should('have.text', '3');
    cy.get('[data-testid="bell"]').should('have.attr', 'aria-label', 'Sightings, 3 new notifications');
  });

  it('caps the badge at 9+', () => {
    cy.mount(<IconButton icon="bell" label="Sightings" badgeCount={12} onPress={() => undefined} testID="bell" />);
    cy.get('[data-testid="bell-badge"]').should('have.text', '9+');
  });

  it('is a 44 px target that calls onPress', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<IconButton icon="close" label="Close" onPress={onPress} testID="close" />);
    cy.get('[data-testid="close"]').invoke('outerHeight').should('be.at.least', 44);
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

describe('Toast', () => {
  it('runs its action', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<Toast message="Update available" visible action={{ label: 'Reload', onPress }} testID="toast" />);
    cy.get('[data-testid="toast"]').should('have.attr', 'role', 'alert').and('contain.text', 'Update available');
    cy.get('[data-testid="toast-action"]').should('have.attr', 'aria-label', 'Reload').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('is a flat raise surface with a hairline and an icon per state', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <Toast message="Saved" variant="success" visible testID="toast" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="toast-action"]').should('not.exist');
    cy.get('[data-testid="toast"]')
      .should('have.css', 'background-color', rgb(darkColors.raise))
      .and('have.css', 'border-top-width', '1px')
      .and('have.css', 'box-shadow', 'none');
    cy.get('[data-testid="toast"] svg').should('exist');
  });

  it('renders nothing when hidden', () => {
    cy.mount(<Toast message="Saved" visible={false} testID="toast" />);
    cy.get('[data-testid="toast"]').should('not.exist');
  });
});
