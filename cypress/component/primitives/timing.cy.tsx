import { Badge } from '../../../src/components/primitives/Badge';
import { Divider } from '../../../src/components/primitives/Divider';
import { Icon } from '../../../src/components/primitives/Icon';
import { A_ICON_NAMES } from '../../../src/components/primitives/icons';
import { ListRow } from '../../../src/components/primitives/ListRow';
import { ProgressBar } from '../../../src/components/primitives/ProgressBar';
import { Radio } from '../../../src/components/primitives/Radio';
import { RarityRoundel } from '../../../src/components/primitives/RarityRoundel';
import { Readout } from '../../../src/components/primitives/Readout';
import { Row } from '../../../src/components/primitives/Row';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { StickyFooter } from '../../../src/components/primitives/StickyFooter';
import { Text } from '../../../src/components/primitives/Text';
import { TimingRow } from '../../../src/components/primitives/TimingRow';
import { StyledButton } from '../../../src/components/StyledButton';
import i18n from '../../../src/i18n';
import { darkColors, lightColors, ThemeProvider } from '../../../src/theme';

// Direction A's new primitives (Readout, RarityRoundel, ListRow / Row list mode, TimingRow, the
// section heading row, the compact footer, the count badge and the stroke icon set).

/** '#RRGGBB' → 'rgb(r, g, b)', the way getComputedStyle reports colours. */
function rgb(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
}

/** The element that renders a text itself (cy.contains prefers the surrounding <button>). */
function leaf(text: string) {
  return cy.get('div, span').filter((_, element) => element.childElementCount === 0 && element.textContent === text);
}

describe('Readout', () => {
  it('shows the big numeral with its denominator on one line, the meta and a 2 px progress line', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <Readout
          value="10"
          of="118"
          meta="Stickers · 8% of Season 1"
          progress={10 / 118}
          progressLabel="Season 1"
          size="hero"
          testID="album-total"
        />
      </ThemeProvider>,
    );
    cy.get('[data-testid="album-total-value"]')
      .should('have.text', '10/118')
      .and('have.css', 'font-size', '80px')
      .and('have.attr', 'aria-label', '10 / 118');
    cy.contains('/118').should('have.css', 'color', rgb(darkColors.text2)).and('have.css', 'font-size', '32px');
    cy.contains('Stickers · 8% of Season 1').should('have.css', 'color', rgb(darkColors.text2));
    cy.get('[data-testid="album-total"] [role="progressbar"]')
      .should('have.attr', 'aria-valuenow', '8')
      .and('have.attr', 'aria-label', 'Season 1')
      .invoke('outerHeight')
      .should('equal', 2);
  });

  it('puts a unit before the figure (LVL 8)', () => {
    cy.mount(<Readout unit="LVL" value="8" meta="585 XP to level 9" testID="level" />);
    cy.get('[data-testid="level-value"]').should('have.text', 'LVL 8').and('have.css', 'font-size', '34px');
  });
});

describe('ProgressBar', () => {
  it('is a 2 px text-colour line on a line-colour track, without colour tones', () => {
    cy.mount(
      <ThemeProvider scheme="light">
        <ProgressBar progress={0.5} label="Icons" testID="bar" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="bar"]')
      .should('have.css', 'height', '2px')
      .and('have.css', 'background-color', rgb(lightColors.line));
    cy.get('[data-testid="bar"] div').first().should('have.css', 'background-color', rgb(lightColors.text));
  });
});

describe('RarityRoundel', () => {
  it('shows the tier letter in an 18 px roundel, labelled with the tier word', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <RarityRoundel rarity="epic" testID="roundel" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="roundel"]').should('have.attr', 'aria-label', 'Epic').and('contain.text', 'E');
    cy.get('[data-testid="roundel"] div')
      .filter((_, element) => getComputedStyle(element).backgroundColor === rgb(darkColors.text))
      .should('have.length', 1)
      .invoke('outerWidth')
      .should('equal', 18);
  });

  it('draws C as a text-2 ring, R as a text ring and L with an outer ring', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <Row gap="md">
          <RarityRoundel rarity="common" testID="common" />
          <RarityRoundel rarity="rare" testID="rare" />
          <RarityRoundel rarity="legendary" testID="legendary" />
        </Row>
      </ThemeProvider>,
    );
    cy.get('[data-testid="common"] div')
      .filter((_, element) => element.getBoundingClientRect().width === 18)
      .should('have.css', 'border-top-color', rgb(darkColors.text2));
    cy.get('[data-testid="rare"] div')
      .filter((_, element) => element.getBoundingClientRect().width === 18)
      .should('have.css', 'border-top-color', rgb(darkColors.text));
    cy.get('[data-testid="legendary"] div')
      .filter((_, element) => element.getBoundingClientRect().width === 24)
      .should('have.length', 1);
    cy.get('[data-testid="legendary"]').should('have.attr', 'aria-label', 'Legendary').and('contain.text', 'L');
  });

  it('spells the tier next to the roundel (showLabel) and keeps the C/R/E/L letter in Dutch', () => {
    cy.mount(<RarityRoundel rarity="common" showLabel testID="rarity-common" />);
    cy.get('[data-testid="rarity-common"]').should('contain.text', 'Common').and('contain.text', 'C');
    cy.then(() => i18n.changeLanguage('nl'));
    cy.get('[data-testid="rarity-common"]').should('contain.text', 'Gewoon').and('contain.text', 'C');
    cy.then(() => i18n.changeLanguage('en'));
  });
});

describe('ListRow and Row (list mode)', () => {
  it('renders a hairline row with title, subtitle, a trailing value and a chevron', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <ListRow title="Toyota Supra (A80)" subtitle="A80 generation · 1993–2002" value="94%" chevron testID="row" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="row"]')
      .should('contain.text', 'Toyota Supra (A80)')
      .and('contain.text', 'A80 generation · 1993–2002')
      .and('contain.text', '94%')
      .and('have.css', 'border-bottom-width', '1px')
      .and('have.css', 'border-bottom-color', rgb(darkColors.line))
      .invoke('outerHeight')
      .should('be.at.least', 56);
    cy.get('[data-testid="row"] svg').should('exist');
  });

  it('is a 44 px button with onPress, also at the compact pitch', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<Row title="Log 3 spots" pitch="compact" onPress={onPress} testID="row" />);
    cy.get('[data-testid="row"]').should('have.attr', 'role', 'button').and('have.attr', 'aria-label', 'Log 3 spots');
    cy.get('[data-testid="row"]').invoke('outerHeight').should('be.at.least', 44);
    cy.get('[data-testid="row"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('keeps the layout mode without a title', () => {
    cy.mount(
      <Row gap="sm" testID="layout">
        <Text>One</Text>
        <Text>Two</Text>
      </Row>,
    );
    cy.get('[data-testid="layout"]').should('have.css', 'flex-direction', 'row').and('have.css', 'column-gap', '8px');
  });

  it('shows label/value detail rows with the label in text-2', () => {
    cy.mount(
      <ThemeProvider scheme="light">
        <ListRow title="City" value="Leuven" kind="detail" testID="row" />
      </ThemeProvider>,
    );
    cy.contains('City').should('have.css', 'color', rgb(lightColors.text2));
    cy.contains('Leuven').should('have.css', 'color', rgb(lightColors.text));
  });
});

describe('TimingRow', () => {
  it('lays out number, name over set, date and roundel, and reads as one button', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <ThemeProvider scheme="dark">
        <TimingRow
          number="82"
          title="Ferrari 308 GTSi"
          subtitle="Italian Exotics"
          meta="Today"
          rarity="epic"
          onPress={onPress}
          testID="latest-82"
        />
      </ThemeProvider>,
    );
    cy.get('[data-testid="latest-82"]')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'aria-label', '#82, Ferrari 308 GTSi, Italian Exotics, Today, Epic')
      .and('contain.text', '#82')
      .and('contain.text', 'Today');
    cy.get('[data-testid="latest-82"]').invoke('outerHeight').should('be.at.least', 56);
    leaf('#').should('have.css', 'color', rgb(darkColors.text2));
    cy.get('[data-testid="latest-82"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('adds a condensed suffix after the title', () => {
    cy.mount(<TimingRow number="07" title="Porsche 911 GT3" titleSuffix="×3" subtitle="German Autobahn Heroes" />);
    cy.contains('×3').should('have.css', 'font-family').and('contain', 'BarlowCondensed_500Medium');
  });
});

describe('Section', () => {
  it('has a 36 px heading row with the title as a header, a meta on the right and a hairline', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <Section title="This week" meta="Ends in 5d 10h" testID="section">
          <ListRow title="Log 3 spots" pitch="compact" />
        </Section>
      </ThemeProvider>,
    );
    cy.get('[data-testid="section"] [role="heading"]').should('have.text', 'This week');
    cy.contains('Ends in 5d 10h').should('have.css', 'color', rgb(darkColors.text2));
    cy.contains('This week')
      .should('have.css', 'font-size', '17px')
      .and('have.css', 'text-transform', 'none')
      .and('have.css', 'font-family')
      .and('contain', 'Barlow_600SemiBold');
  });

  it('takes a text action instead of the meta', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <Section
        title="Latest"
        meta="ignored"
        action={<StyledButton label="See all" variant="text" onPress={onPress} testID="see-all" />}
      >
        <Text>Rows</Text>
      </Section>,
    );
    cy.contains('ignored').should('not.exist');
    cy.get('[data-testid="see-all"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });
});

describe('Screen header', () => {
  it("shows A's large condensed title with a meta on the right", () => {
    cy.mount(
      <Screen title="Album" meta="2-week streak" testID="screen">
        <Text>Content</Text>
      </Screen>,
    );
    cy.get('[data-testid="screen-title"]')
      .should('have.text', 'Album')
      .and('have.attr', 'role', 'heading')
      .and('have.css', 'font-size', '34px');
    cy.contains('2-week streak').should('be.visible');
  });
});

describe('StickyFooter', () => {
  it('shows the reason on the left and the action on the right, under a hairline', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <StickyFooter
          reason="Check the plates first"
          action={<StyledButton label="Add to album" onPress={() => undefined} disabled testID="save" />}
          testID="footer"
        />
      </ThemeProvider>,
    );
    cy.get('[data-testid="footer"]')
      .should('have.css', 'border-top-width', '1px')
      .and('have.css', 'border-top-color', rgb(darkColors.line));
    cy.contains('Check the plates first').should('have.css', 'color', rgb(darkColors.text2));
    cy.get('[data-testid="save"]').should('have.attr', 'aria-disabled', 'true');
  });
});

describe('Radio', () => {
  it('is a radio row with a description and a 44+ px target', () => {
    const onSelect = cy.stub().as('onSelect');
    cy.mount(
      <Radio
        label="Every plate is blurred"
        description="Tap the box on the photo, or drag to draw one"
        value="blurred"
        selected={false}
        onSelect={onSelect}
        testID="radio"
      />,
    );
    cy.get('[data-testid="radio"]').should('have.attr', 'role', 'radio').and('have.attr', 'aria-checked', 'false');
    cy.get('[data-testid="radio"]').invoke('outerHeight').should('be.at.least', 56);
    // The web drops accessibilityHint: the description is linked with aria-describedby instead.
    cy.get('[data-testid="radio"]')
      .invoke('attr', 'aria-describedby')
      .then((id) => {
        expect(id).to.be.a('string');
        cy.get(`[id="${String(id)}"]`).should('have.text', 'Tap the box on the photo, or drag to draw one');
      });
    cy.get('[data-testid="radio"]').click();
    cy.get('@onSelect').should('have.been.calledOnceWith', 'blurred');
  });
});

describe('Badge, Divider and the icon set', () => {
  it('shows a count badge as a text-colour disc with a bg-colour digit', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <Badge count={1} testID="badge" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="badge"]')
      .should('have.text', '1')
      .and('have.css', 'background-color', rgb(darkColors.text))
      .and('have.css', 'border-top-color', rgb(darkColors.bg));
    cy.contains('1').should('have.css', 'color', rgb(darkColors.bg));
  });

  it('draws a 1 px line-colour divider', () => {
    cy.mount(
      <ThemeProvider scheme="light">
        <Divider testID="divider" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="divider"]')
      .should('have.css', 'height', '1px')
      .and('have.css', 'background-color', rgb(lightColors.line));
  });

  it('renders every A icon as a 24-grid stroke icon with round caps, decorative by default', () => {
    cy.mount(
      <Row wrap>
        {A_ICON_NAMES.map((name) => (
          <Icon key={name} name={name} testID={`icon-${name}`} />
        ))}
        <Icon name="albums-outline" testID="icon-legacy" />
        <Icon name="alert" accessibilityLabel="Error" testID="icon-labelled" />
      </Row>,
    );
    A_ICON_NAMES.forEach((name) => {
      cy.get(`[data-testid="icon-${name}"]`)
        .should('have.attr', 'viewBox', '0 0 24 24')
        .and('have.attr', 'stroke-width', '1.75')
        .and('have.attr', 'stroke-linecap', 'round')
        .and('have.attr', 'stroke-linejoin', 'round');
    });
    cy.get('[data-testid="icon-legacy"] path').should('have.length.at.least', 1);
    cy.get('[data-testid="icon-album"]').should('have.attr', 'aria-hidden', 'true');
    cy.get('[data-testid="icon-labelled"]').should('have.attr', 'aria-label', 'Error');
  });
});
