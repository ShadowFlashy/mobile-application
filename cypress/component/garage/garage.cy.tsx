import { useState } from 'react';
import { GarageCarCard } from '../../../src/components/garage/GarageCarCard';
import {
  pausedCar,
  pendingCar,
  readSighting,
  unreadSighting,
  verifiedCar,
  verifiedStats,
} from '../../../src/components/garage/garageFixtures';
import { OwnerShowcase } from '../../../src/components/garage/OwnerShowcase';
import { SightingCard } from '../../../src/components/garage/SightingCard';
import { SightingDetail } from '../../../src/components/garage/SightingDetail';
import { VanityPlate } from '../../../src/components/garage/VanityPlate';
import { VerificationCodeCard } from '../../../src/components/garage/VerificationCodeCard';
import { VisibilityPicker } from '../../../src/components/garage/VisibilityPicker';
import type { OwnerVisibility } from '../../../src/types/OwnerCar';

describe('GarageCarCard', () => {
  it('shows a pending car with the beta explanation and no counters', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<GarageCarCard car={pendingCar} onPress={onPress} />);
    cy.get(`[data-testid="garage-car-status-${pendingCar.id}"]`).should('contain.text', 'Pending verification');
    cy.get(`[data-testid="garage-car-pending-${pendingCar.id}"]`).should(
      'contain.text',
      'Pings start once your ownership is verified',
    );
    cy.get(`[data-testid="garage-car-sightings-${pendingCar.id}"]`).should('not.exist');
    cy.contains('Plate ••••08').should('be.visible');
    cy.get(`[data-testid="garage-car-${pendingCar.id}"]`).click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('shows a verified car with server-side counters and its vanity plate', () => {
    cy.mount(<GarageCarCard car={verifiedCar} stats={verifiedStats} onPress={() => undefined} />);
    cy.get(`[data-testid="garage-car-status-${verifiedCar.id}"]`).should('contain.text', 'Verified owner');
    cy.get(`[data-testid="garage-car-sightings-${verifiedCar.id}"]`).should('contain.text', 'Spotted 7×');
    cy.get(`[data-testid="garage-car-unread-${verifiedCar.id}"]`).should('contain.text', '2 new');
    cy.contains('Last seen in Antwerpen').should('be.visible');
    cy.get(`[data-testid="garage-car-plate-${verifiedCar.id}"]`).should(
      'have.attr',
      'aria-label',
      'Vanity plate DEMO-123',
    );
    cy.get(`[data-testid="garage-car-pending-${verifiedCar.id}"]`).should('not.exist');
  });

  it('shows a paused car as paused, in words and not by colour alone', () => {
    cy.mount(<GarageCarCard car={pausedCar} onPress={() => undefined} />);
    cy.get(`[data-testid="garage-car-status-${pausedCar.id}"]`)
      .should('contain.text', 'Pings paused')
      .and('have.attr', 'aria-label', 'Pings paused');
    cy.contains('Pings are paused').should('be.visible');
    cy.contains('Not spotted yet').should('be.visible');
  });
});

describe('SightingCard', () => {
  it('marks an unread sighting with a "New" label and an announced state', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<SightingCard sighting={unreadSighting} onPress={onPress} />);
    cy.get(`[data-testid="sighting-unread-${unreadSighting.id}"]`).should('contain.text', 'New');
    cy.get(`[data-testid="sighting-${unreadSighting.id}"]`)
      .should('have.attr', 'aria-label')
      .and('match', /^New\. Demo GT3\. Spotted in Antwerpen\. \d{2}:00–\d{2}:00$/);
    cy.get(`[data-testid="sighting-${unreadSighting.id}"]`).click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('shows a read sighting without the label, with the hour window and the opted-in name', () => {
    cy.mount(<SightingCard sighting={readSighting} onPress={() => undefined} />);
    cy.get(`[data-testid="sighting-unread-${readSighting.id}"]`).should('not.exist');
    cy.contains(/\d{2}:00–\d{2}:00/).should('be.visible');
    cy.contains('by @spotter_jas').should('be.visible');
  });
});

describe('SightingDetail', () => {
  it('shows the snapshot only: city, hour window and an anonymous spotter', () => {
    cy.mount(<SightingDetail sighting={unreadSighting} />);
    cy.get('[data-testid="sighting-title"]').should('contain.text', 'Your Demo GT3 was spotted');
    cy.get('[data-testid="sighting-city"]').should('have.text', 'Antwerpen');
    cy.get('[data-testid="sighting-hour"]')
      .invoke('text')
      .should('match', /\d{2}:00–\d{2}:00$/);
    cy.get('[data-testid="sighting-spotter"]').should('have.text', 'Anonymous spotter');
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
  it('starts at Hidden and marks the selected option as checked', () => {
    cy.mount(<PickerHarness needsPlate />);
    cy.get('[data-testid="visibility-option-hidden"]').should('have.attr', 'aria-checked', 'true');
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
});

describe('OwnerShowcase and VanityPlate', () => {
  it('shows the badge and the shout-out for a Badge owner, without a plate', () => {
    cy.mount(<OwnerShowcase showcase={{ visibility: 'badge', shoutout: 'Say hi at Spa' }} />);
    cy.get('[data-testid="owner-showcase"]').should('contain.text', 'Verified owner');
    cy.get('[data-testid="owner-showcase-shoutout"]').should('contain.text', 'Say hi at Spa');
    cy.get('[data-testid="owner-showcase-plate"]').should('not.exist');
  });

  it('adds the vanity plate for a Vanity owner', () => {
    cy.mount(<OwnerShowcase showcase={{ visibility: 'vanity', vanityPlate: 'DEMO-123' }} />);
    cy.get('[data-testid="owner-showcase-plate"]').should('contain.text', 'DEMO-123');
  });

  it('renders the plate with its accessible label', () => {
    cy.mount(<VanityPlate plate="SPEEDY" />);
    cy.get('[data-testid="vanity-plate"]').should('have.attr', 'aria-label', 'Vanity plate SPEEDY');
    cy.contains('SPEEDY').should('be.visible');
  });
});

describe('VerificationCodeCard (P1)', () => {
  it('counts down to expiry', () => {
    cy.clock(new Date('2026-11-10T20:00:00Z').getTime());
    cy.mount(<VerificationCodeCard code="RL-7K3QX9" expiresAt="2026-11-10T20:30:00Z" />);
    cy.contains('RL-7K3QX9').should('be.visible');
    cy.get('[data-testid="verification-code-card-countdown"]').should('have.text', 'Expires in 30:00');
    cy.tick(61_000);
    cy.get('[data-testid="verification-code-card-countdown"]').should('have.text', 'Expires in 28:59');
    cy.tick(29 * 60 * 1000);
    cy.get('[data-testid="verification-code-card-countdown"]').should(
      'have.text',
      'This code has expired. Request a new one.',
    );
  });
});
