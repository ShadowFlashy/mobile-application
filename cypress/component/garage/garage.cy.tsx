import { useState } from 'react';
import { GarageCarHeader } from '../../../src/components/garage/GarageCarHeader';
import { GarageCarRow } from '../../../src/components/garage/GarageCarRow';
import {
  anonymousSighting,
  pausedCar,
  pendingCar,
  readSighting,
  unreadSighting,
  verifiedCar,
  verifiedStats,
} from '../../../src/components/garage/garageFixtures';
import { GarageStatus } from '../../../src/components/garage/GarageStatus';
import { NoteRow } from '../../../src/components/garage/NoteRow';
import { SightingDayHeading } from '../../../src/components/garage/SightingDayHeading';
import { SightingDetail } from '../../../src/components/garage/SightingDetail';
import { SightingRow } from '../../../src/components/garage/SightingRow';
import { UnreadDot } from '../../../src/components/garage/UnreadDot';
import { VanityPlate } from '../../../src/components/garage/VanityPlate';
import { VerificationCodeCard } from '../../../src/components/garage/VerificationCodeCard';
import { VerificationSteps } from '../../../src/components/garage/VerificationSteps';
import { VisibilityPicker } from '../../../src/components/garage/VisibilityPicker';
import { darkColors, lightColors, ThemeProvider } from '../../../src/theme';
import type { OwnerVisibility } from '../../../src/types/OwnerCar';

/** '#RRGGBB' → 'rgb(r, g, b)', the way getComputedStyle reports colours. */
function rgb(hex: string): string {
  const value = parseInt(hex.slice(1), 16);
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
}

/** The red primary-action colour must never appear in the Garage's rows (red = primary action only). */
function expectNoRed(selector: string) {
  cy.get(`${selector}, ${selector} *`).each((element) => {
    const style = getComputedStyle(element[0]);
    expect(style.color).not.to.equal(rgb(darkColors.red));
    expect(style.backgroundColor).not.to.equal(rgb(darkColors.red));
  });
}

describe('GarageCarRow', () => {
  it('shows a pending car as waiting for verification, with the beta explanation and no counters', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<GarageCarRow car={pendingCar} onPress={onPress} />);
    cy.get(`[data-testid="garage-car-status-${pendingCar.id}"]`)
      .should('contain.text', 'Waiting for verification')
      .and('have.attr', 'aria-label', 'Waiting for verification');
    cy.get(`[data-testid="garage-car-pending-${pendingCar.id}"]`).should(
      'contain.text',
      'Pings start once your ownership is verified',
    );
    cy.get(`[data-testid="garage-car-sightings-${pendingCar.id}"]`).should('not.exist');
    // Only the masked hint of a hidden plate is shown.
    cy.contains('Plate ••••08').should('be.visible');
    cy.get(`[data-testid="garage-car-${pendingCar.id}"]`)
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'aria-label')
      .and('include', 'Ferrari 308 GTSi “Magnum”. Waiting for verification');
    cy.get(`[data-testid="garage-car-${pendingCar.id}"]`).click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('shows a verified car with server-side counters, the unread count and its flat vanity plate', () => {
    cy.mount(<GarageCarRow car={verifiedCar} stats={verifiedStats} onPress={() => undefined} />);
    cy.get(`[data-testid="garage-car-status-${verifiedCar.id}"]`).should('contain.text', 'Verified');
    cy.get(`[data-testid="garage-car-sightings-${verifiedCar.id}"]`).should('contain.text', 'Spotted 7 times');
    cy.get(`[data-testid="garage-car-unread-${verifiedCar.id}"]`).should('contain.text', '2 new');
    cy.get(`[data-testid="garage-car-${verifiedCar.id}"]`)
      .should('have.attr', 'aria-label')
      .and('include', '2 new sightings');
    cy.contains('Last seen in Antwerpen').should('be.visible');
    cy.get(`[data-testid="garage-car-plate-${verifiedCar.id}"]`).should(
      'have.attr',
      'aria-label',
      'Vanity plate DEMO-123',
    );
    cy.get(`[data-testid="garage-car-pending-${verifiedCar.id}"]`).should('not.exist');
  });

  it('never shows the plate of a car that does not show it, only the last two characters', () => {
    cy.mount(
      <GarageCarRow
        car={{ ...verifiedCar, visibility: 'badge', plateDisplay: undefined }}
        stats={verifiedStats}
        onPress={() => undefined}
      />,
    );
    cy.get(`[data-testid="garage-car-plate-${verifiedCar.id}"]`).should('not.exist');
    cy.contains('DEMO-123').should('not.exist');
    cy.contains('Plate ••••23').should('be.visible');
  });

  it('shows a paused car as paused, in words and not by colour alone', () => {
    cy.mount(<GarageCarRow car={pausedCar} onPress={() => undefined} />);
    cy.get(`[data-testid="garage-car-status-${pausedCar.id}"]`)
      .should('contain.text', 'Pings paused')
      .and('have.attr', 'aria-label', 'Pings paused');
    cy.contains('Pings are paused').should('be.visible');
    cy.contains('Not spotted yet').should('be.visible');
  });

  it('is a hairline row of at least 44 px without red, cards or shadows', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <GarageCarRow car={verifiedCar} stats={verifiedStats} onPress={() => undefined} />
      </ThemeProvider>,
    );
    const row = `[data-testid="garage-car-${verifiedCar.id}"]`;
    cy.get(row)
      .should('have.css', 'border-bottom-width', '1px')
      .and('have.css', 'border-bottom-color', rgb(darkColors.line));
    cy.get(row).should('have.css', 'box-shadow', 'none').and('have.css', 'border-top-width', '0px');
    cy.get(row).invoke('outerHeight').should('be.gte', 44);
    expectNoRed(row);
  });
});

describe('GarageStatus', () => {
  it('names every status in words', () => {
    cy.mount(
      <>
        <GarageStatus status="pending" testID="pending" />
        <GarageStatus status="verified" testID="verified" />
        <GarageStatus status="paused" testID="paused" />
      </>,
    );
    cy.get('[data-testid="pending"]').should('have.text', 'Waiting for verification');
    cy.get('[data-testid="verified"]').should('have.text', 'Verified');
    cy.get('[data-testid="paused"]').should('have.text', 'Pings paused');
  });
});

describe('GarageCarHeader', () => {
  it('shows the car as the title and the counters as readouts for a verified car', () => {
    cy.mount(<GarageCarHeader car={verifiedCar} stats={verifiedStats} />);
    cy.get('[data-testid="garage-car-title"]').should('have.text', 'Porsche 911 GT3');
    cy.get('[data-testid="garage-car-header-status"]').should('contain.text', 'Verified');
    cy.get('[data-testid="garage-stat-sightings-value"]').should('have.text', '7');
    cy.get('[data-testid="garage-stat-unread-value"]').should('have.text', '2');
  });

  it('has no counters for a pending car', () => {
    cy.mount(<GarageCarHeader car={pendingCar} />);
    cy.get('[data-testid="garage-car-header-status"]').should('contain.text', 'Waiting for verification');
    cy.get('[data-testid="garage-stat-sightings"]').should('not.exist');
  });
});

describe('SightingRow', () => {
  it('marks an unread sighting with a text-colour dot and an announced "New"', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <ThemeProvider scheme="light">
        <SightingRow sighting={unreadSighting} onPress={onPress} />
      </ThemeProvider>,
    );
    cy.get(`[data-testid="sighting-unread-${unreadSighting.id}"]`)
      .should('have.attr', 'aria-label', 'New')
      .and('have.css', 'background-color', rgb(lightColors.text));
    cy.get(`[data-testid="sighting-${unreadSighting.id}"]`)
      .should('have.attr', 'aria-label')
      .and('match', /^New\. Demo GT3\. Spotted in Antwerpen\. \d{2}:00–\d{2}:00$/);
    cy.get(`[data-testid="sighting-${unreadSighting.id}"]`).click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('shows a read sighting without the dot: when, car, city and the opted-in name', () => {
    cy.mount(<SightingRow sighting={readSighting} onPress={() => undefined} />);
    cy.get(`[data-testid="sighting-unread-${readSighting.id}"]`).should('not.exist');
    cy.contains(/^\d{2}:00–\d{2}:00$/).should('be.visible');
    cy.contains('Demo GT3').should('be.visible');
    cy.contains('Leuven · by @spotter_jas').should('be.visible');
  });

  it('says so when no city was shared, and never shows a name that was not shared', () => {
    cy.mount(<SightingRow sighting={anonymousSighting} onPress={() => undefined} />);
    cy.contains('City not shared').should('be.visible');
    cy.contains('@').should('not.exist');
  });

  it('is a 56 px timing-tower row on a hairline', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <SightingRow sighting={unreadSighting} onPress={() => undefined} />
      </ThemeProvider>,
    );
    const row = `[data-testid="sighting-${unreadSighting.id}"]`;
    cy.get(row).invoke('outerHeight').should('be.gte', 56);
    cy.get(row).should('have.css', 'border-bottom-color', rgb(darkColors.line));
    expectNoRed(row);
  });
});

describe('SightingDayHeading, NoteRow and UnreadDot', () => {
  it('renders a quiet day label announced as a heading', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <SightingDayHeading label="Today" testID="day" />
      </ThemeProvider>,
    );
    cy.get('[role="heading"]').should('have.text', 'Today').and('have.css', 'color', rgb(darkColors.text2));
    cy.get('[role="heading"]').should('have.css', 'text-transform', 'none');
  });

  it('renders a paragraph row with a hairline, or without one', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <NoteRow text="Explanation" testID="note" />
        <NoteRow text="Fact" tone="text" divider={false} testID="fact" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="note"]').should('have.css', 'color', rgb(darkColors.text2));
    cy.get('[data-testid="note"]').parent().should('have.css', 'border-bottom-width', '1px');
    cy.get('[data-testid="fact"]').should('have.css', 'color', rgb(darkColors.text));
    cy.get('[data-testid="fact"]').parent().should('have.css', 'border-bottom-width', '0px');
  });

  it('draws the unread dot in the text colour, never red', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <UnreadDot testID="dot" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="dot"]')
      .should('have.css', 'background-color', rgb(darkColors.text))
      .and('have.attr', 'aria-label', 'New');
  });
});

describe('SightingDetail', () => {
  it('shows the snapshot only: car, city and hour window, and no spotter row for an anonymous spotter', () => {
    cy.mount(<SightingDetail sighting={unreadSighting} />);
    cy.get('[data-testid="sighting-title"]').should('have.text', 'Sighting');
    cy.get('[data-testid="sighting-car"]').should('have.text', 'Demo GT3');
    cy.get('[data-testid="sighting-city"]').should('have.text', 'Antwerpen');
    cy.get('[data-testid="sighting-hour"]')
      .invoke('text')
      .should('match', /\d{2}:00–\d{2}:00$/);
    cy.get('[data-testid="sighting-spotter"]').should('not.exist');
    cy.contains('Seen by').should('not.exist');
    cy.contains('@').should('not.exist');
  });

  it('adds "Seen by" only when the spotter shared their name', () => {
    cy.mount(<SightingDetail sighting={readSighting} />);
    cy.contains('Seen by').should('be.visible');
    cy.get('[data-testid="sighting-spotter"]').should('have.text', '@spotter_jas');
  });

  it('shows the blurred photo with a radius of 8', () => {
    cy.mount(<SightingDetail sighting={unreadSighting} />);
    cy.get('[data-testid="sighting-photo"]').should('have.css', 'border-top-left-radius', '8px');
  });
});

function PickerHarness({ needsPlate, isPending = false }: { needsPlate: boolean; isPending?: boolean }) {
  const [value, setValue] = useState<OwnerVisibility>('hidden');
  const [plate, setPlate] = useState('');
  return (
    <VisibilityPicker
      value={value}
      onChange={setValue}
      needsPlate={needsPlate}
      plate={plate}
      onPlateChange={setPlate}
      isPending={isPending}
    />
  );
}

describe('VisibilityPicker', () => {
  it('starts at Hidden and marks the selected radio row as checked', () => {
    cy.mount(<PickerHarness needsPlate />);
    cy.get('[role="radiogroup"]').should('have.attr', 'aria-label', 'What spotters see');
    cy.get('[data-testid="visibility-option-hidden"]')
      .should('have.attr', 'role', 'radio')
      .and('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="visibility-option-badge"]').should('have.attr', 'aria-checked', 'false');
    cy.get('[data-testid="visibility-plate-input"]').should('not.exist');
  });

  it('asks for the plate again when switching to Vanity plate', () => {
    cy.mount(<PickerHarness needsPlate />);
    cy.get('[data-testid="visibility-option-badge"]').click();
    cy.get('[data-testid="visibility-plate-input"]').should('not.exist');
    cy.get('[data-testid="visibility-option-vanity"]').click();
    cy.get('[data-testid="visibility-option-vanity"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="visibility-plate-input"]').should('be.visible').type('demo-123');
    cy.get('[data-testid="visibility-plate-input"]').should('have.value', 'demo-123');
  });

  it('does not ask for the plate when it is already shown (or was just typed)', () => {
    cy.mount(<PickerHarness needsPlate={false} />);
    cy.get('[data-testid="visibility-option-vanity"]').click();
    cy.get('[data-testid="visibility-plate-input"]').should('not.exist');
  });

  it('explains that a pending car shows nothing yet', () => {
    cy.mount(<PickerHarness needsPlate={false} isPending />);
    cy.get('[data-testid="visibility-pending-note"]').should('not.exist');
    cy.get('[data-testid="visibility-option-badge"]').click();
    cy.get('[data-testid="visibility-pending-note"]').should('contain.text', 'once your car is verified');
  });

  it('shows the plate error under the plate field', () => {
    cy.mount(
      <VisibilityPicker
        value="vanity"
        onChange={() => undefined}
        needsPlate
        plate="X"
        onPlateChange={() => undefined}
        plateError="Enter your licence plate (2 to 12 letters or digits)."
      />,
    );
    cy.contains('Enter your licence plate (2 to 12 letters or digits).').should('be.visible');
  });

  it('uses rows of at least 44 px and no red for the selected option', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <PickerHarness needsPlate={false} />
      </ThemeProvider>,
    );
    cy.get('[data-testid="visibility-option-badge"]').click();
    cy.get('[role="radio"]').each((radio) => {
      expect(radio.outerHeight()).to.be.gte(44);
    });
    expectNoRed('[data-testid="visibility-picker"]');
  });
});

describe('VanityPlate', () => {
  it('renders the plate flat, in the text colour, with its accessible label', () => {
    cy.mount(
      <ThemeProvider scheme="light">
        <VanityPlate plate="SPEEDY" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="vanity-plate"]')
      .should('have.attr', 'aria-label', 'Vanity plate SPEEDY')
      .and('have.css', 'border-top-color', rgb(lightColors.text))
      .and('have.css', 'border-top-left-radius', '2px')
      .and('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
    cy.contains('SPEEDY').should('be.visible');
  });
});

describe('VerificationSteps', () => {
  it('numbers the steps, checks the finished ones and announces each with its state', () => {
    cy.mount(
      <VerificationSteps
        title="How it works"
        steps={[
          { key: 'add', title: 'Add your car', state: 'done' },
          { key: 'check', title: 'The Redline team checks your ownership', state: 'current' },
          { key: 'pings', title: 'Pings start', state: 'todo' },
        ]}
      />,
    );
    cy.get('[role="heading"]').should('have.text', 'How it works');
    cy.get('[data-testid="verification-steps-add"]').should(
      'have.attr',
      'aria-label',
      'Step 1 of 3: Add your car. Done',
    );
    cy.get('[data-testid="verification-steps-add"]').should('not.contain.text', '01');
    cy.get('[data-testid="verification-steps-check"]').should('contain.text', '02');
    cy.get('[data-testid="verification-steps-check-state"]').should('have.text', 'In progress');
    cy.get('[data-testid="verification-steps-pings"]').should('contain.text', '03').and('contain.text', 'Not started');
  });
});

describe('VerificationCodeCard (P1)', () => {
  it('shows the code in large condensed numerals and counts down to expiry', () => {
    cy.clock(new Date('2026-11-10T20:00:00Z').getTime());
    cy.mount(<VerificationCodeCard code="RL-7K3QX9" expiresAt="2026-11-10T20:30:00Z" />);
    cy.contains('RL-7K3QX9')
      .should('be.visible')
      .and('have.css', 'font-family')
      .and('include', 'BarlowCondensed_600SemiBold');
    cy.get('[data-testid="verification-code-card-countdown"]').should('have.text', 'Expires in 30:00');
    cy.get('[data-testid="verification-code-card-steps"]').should('contain.text', 'Put it behind the windscreen.');
    cy.tick(61_000);
    cy.get('[data-testid="verification-code-card-countdown"]').should('have.text', 'Expires in 28:59');
    cy.tick(29 * 60 * 1000);
    cy.get('[data-testid="verification-code-card-countdown"]').should(
      'have.text',
      'This code has expired. Request a new one.',
    );
  });
});
