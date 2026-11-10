import { useState } from 'react';
import { AiConsentSheet } from '../../../src/components/capture/AiConsentSheet';
import { AiStatusBanner } from '../../../src/components/capture/AiStatusBanner';
import { AiStatusChips } from '../../../src/components/capture/AiStatusChips';
import { AnalysingChip } from '../../../src/components/capture/AnalysingChip';
import { CityField } from '../../../src/components/capture/CityField';
import { CityPicker } from '../../../src/components/capture/CityPicker';
import { CollectBar } from '../../../src/components/capture/CollectBar';
import { DateField } from '../../../src/components/capture/DateField';
import { DuplicateBanner } from '../../../src/components/capture/DuplicateBanner';
import { NotACarCard } from '../../../src/components/capture/NotACarCard';
import { NotesField } from '../../../src/components/capture/NotesField';
import { OwnerPingRow } from '../../../src/components/capture/OwnerPingRow';
import { PaintPicker } from '../../../src/components/capture/PaintPicker';
import { PlateShield } from '../../../src/components/capture/PlateShield';
import { ShutterButton } from '../../../src/components/capture/ShutterButton';
import type { GateReason } from '../../../src/types/Capture';

function OwnerPing({ plate }: { plate: string }) {
  const [value, setValue] = useState({ plate, notifyOwner: plate.length > 0, shareNameWithOwner: false });
  return (
    <>
      <OwnerPingRow value={value} onChange={(patch) => setValue((current) => ({ ...current, ...patch }))} />
      <output data-testid="ping-state">
        {JSON.stringify({ notify: value.notifyOwner, share: value.shareNameWithOwner })}
      </output>
    </>
  );
}

describe('CollectBar', () => {
  const REASONS: [GateReason, string][] = [
    ['confirm_plates', 'Check the plates first'],
    ['confirm_ignored_suggestions', 'Confirm there is no plate'],
    ['missing_car', 'Pick the car first'],
    ['offline', 'Needs a connection to save'],
  ];
  REASONS.forEach(([reason, text]) => {
    it(`is disabled with the reason in words: ${reason}`, () => {
      const onCollect = cy.stub().as('collect');
      cy.mount(<CollectBar gate={{ ok: false, reason }} onCollect={onCollect} />);
      cy.get('[data-testid="collect-reason"]').should('have.text', text);
      cy.get('[data-testid="collect-button"]').should('have.attr', 'aria-disabled', 'true').click({ force: true });
      cy.get('@collect').should('not.have.been.called');
    });
  });

  it('collects when the gate is open, and shows a save error above the button', () => {
    const onCollect = cy.stub().as('collect');
    cy.mount(<CollectBar gate={{ ok: true }} onCollect={onCollect} saveError="Your spot could not be saved." />);
    cy.get('[data-testid="collect-reason"]').should('not.exist');
    cy.get('[data-testid="collect-error"]').should('contain.text', 'Your spot could not be saved.');
    cy.get('[data-testid="collect-button"]').should('contain.text', 'Collect').click();
    cy.get('@collect').should('have.been.calledOnce');
  });

  it('shows a busy button while saving', () => {
    cy.mount(<CollectBar gate={{ ok: false, reason: 'busy' }} onCollect={cy.stub()} isSaving />);
    cy.get('[data-testid="collect-button"]').should('have.attr', 'aria-busy', 'true');
    cy.get('[data-testid="collect-reason"]').should('not.exist');
  });
});

describe('OwnerPingRow', () => {
  it('shows an AI-read plate only masked, with the ping on by default', () => {
    cy.mount(<OwnerPing plate="1ABC234" />);
    cy.get('[data-testid="masked-plate"]').should('have.text', 'Plate ••34');
    cy.contains('1ABC234').should('not.exist');
    cy.get('[data-testid="ping-toggle"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="share-name-toggle"]').should('have.attr', 'aria-checked', 'false');
  });

  it('switches the ping off (and hides name sharing)', () => {
    cy.mount(<OwnerPing plate="1ABC234" />);
    cy.get('[data-testid="ping-toggle"]').click();
    cy.get('[data-testid="ping-state"]').should('have.text', JSON.stringify({ notify: false, share: false }));
    cy.get('[data-testid="share-name-toggle"]').should('not.exist');
  });

  it('typing a plate turns the ping on; without a plate the switch is disabled', () => {
    cy.mount(<OwnerPing plate="" />);
    cy.get('[data-testid="ping-toggle"]').should('have.attr', 'aria-disabled', 'true');
    cy.get('[data-testid="plate-input"]').type('DEMO-123');
    cy.get('[data-testid="plate-input"]').should('have.value', 'DEMO-123');
    cy.get('[data-testid="ping-state"]').should('have.text', JSON.stringify({ notify: true, share: false }));
    cy.get('[data-testid="share-name-toggle"]').click();
    cy.get('[data-testid="ping-state"]').should('have.text', JSON.stringify({ notify: true, share: true }));
  });
});

describe('PaintPicker', () => {
  it('offers all 14 paints by name and reports the choice', () => {
    const onChange = cy.stub().as('change');
    cy.mount(<PaintPicker value="blue" onChange={onChange} provenance="ai" />);
    cy.get('[data-testid^="paint-option-"]').should('have.length', 14);
    cy.get('[data-testid="paint-option-blue"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="paint-option-red"]').should('contain.text', 'Red').click();
    cy.get('@change').should('have.been.calledOnceWith', 'red');
    cy.get('[data-testid="provenance-ai"]').should('be.visible');
  });
});

describe('CityPicker', () => {
  it('searches the gazetteer with folded accents and picks a city', () => {
    const onSelect = cy.stub().as('select');
    cy.mount(<CityPicker visible value="" onClose={cy.stub()} onSelect={onSelect} />);
    cy.get('[data-testid="city-search"]').type('liege');
    cy.get('[data-testid="city-option-liege"]').should('contain.text', 'Liège').click();
    cy.get('@select').should('have.been.calledOnceWith', 'Liège');
  });

  it('accepts a typed place that is not in the list', () => {
    const onSelect = cy.stub().as('select');
    cy.mount(<CityPicker visible value="" onClose={cy.stub()} onSelect={onSelect} />);
    cy.get('[data-testid="city-search"]').type('Nürburgring');
    cy.get('[data-testid="city-use-typed"]').click();
    cy.get('@select').should('have.been.calledOnceWith', 'Nürburgring');
  });

  it('can clear the city', () => {
    const onSelect = cy.stub().as('select');
    cy.mount(<CityPicker visible value="Leuven" onClose={cy.stub()} onSelect={onSelect} />);
    cy.get('[data-testid="city-clear"]').click();
    cy.get('@select').should('have.been.calledOnceWith', '');
  });
});

describe('CityField', () => {
  it('shows the placeholder, opens the picker and reports the chosen city', () => {
    const onChange = cy.stub().as('change');
    cy.mount(<CityField value="" onChange={onChange} />);
    cy.get('[data-testid="city-field"]').should('have.attr', 'aria-label', 'City: Pick a city');
    cy.get('[data-testid="city-picker"]').should('not.exist');
    cy.get('[data-testid="city-field"]').click();
    cy.get('[data-testid="city-search"]').type('leuv');
    cy.get('[data-testid="city-option-leuven"]').click();
    cy.get('@change').should('have.been.calledOnceWith', 'Leuven');
    cy.get('[data-testid="city-search"]').should('not.exist');
  });

  it('shows the value with its AUTO provenance tag', () => {
    cy.mount(<CityField value="Antwerp" provenance="auto" onChange={cy.stub()} />);
    cy.get('[data-testid="city-field-value"]').should('have.text', 'Antwerp');
    cy.get('[data-testid="city-field"]').should('have.attr', 'aria-label', 'City: Antwerp');
    cy.get('[data-testid="city-field"] [data-testid="provenance-auto"]').should('exist');
  });
});

describe('DateField', () => {
  it('opens a sheet, validates and sets the date', () => {
    const onChange = cy.stub().as('change');
    cy.mount(<DateField value="2026-11-03T13:12:00.000Z" onChange={onChange} provenance="auto" />);
    cy.get('[data-testid="provenance-auto"]').should('contain.text', 'AUTO');
    cy.get('[data-testid="date-field"]').click();
    cy.get('[data-testid="date-input"]').clear().type('2026-02-31');
    cy.get('[data-testid="date-apply"]').click();
    cy.contains('Enter a valid date and time').should('be.visible');
    cy.get('[data-testid="date-input"]').clear().type('2026-11-01');
    cy.get('[data-testid="time-input"]').clear().type('09:30');
    cy.get('[data-testid="date-apply"]').click();
    cy.get('@change').should('have.been.calledOnceWith', new Date(2026, 10, 1, 9, 30).toISOString());
  });
});

describe('NotesField', () => {
  it('stays collapsed until "Add a note"', () => {
    const onChange = cy.stub().as('change');
    cy.mount(<NotesField value="" onChange={onChange} />);
    cy.get('[data-testid="notes-input"]').should('not.exist');
    cy.get('[data-testid="notes-field-open"]').click();
    cy.get('[data-testid="notes-input"]').type('L');
    cy.get('@change').should('have.been.calledWith', 'L');
  });
});

describe('Co-Driver states', () => {
  it('AnalysingChip always offers "Fill in myself"', () => {
    const onFill = cy.stub().as('fill');
    cy.mount(<AnalysingChip onFillManually={onFill} />);
    cy.get('[data-testid="analysing-chip"]').should('contain.text', 'Co-Driver is analysing');
    cy.get('[data-testid="fill-myself-button"]').click();
    cy.get('@fill').should('have.been.calledOnce');
  });

  it('AiStatusBanner explains every reason', () => {
    cy.mount(<AiStatusBanner reason="quota" />);
    cy.get('[data-testid="ai-status-banner-quota"]').should('have.text', 'No Co-Driver scans left today');
    cy.mount(<AiStatusBanner reason="not_configured" />);
    cy.get('[data-testid="ai-status-banner-not_configured"]').should('have.text', 'Co-Driver is not set up');
  });

  it('NotACarCard offers Retake and "It is a car"', () => {
    const onRetake = cy.stub().as('retake');
    const onFill = cy.stub().as('fill');
    cy.mount(<NotACarCard onRetake={onRetake} onFillManually={onFill} />);
    cy.contains("Co-Driver doesn't see a car here").should('be.visible');
    cy.get('[data-testid="retake-button"]').click();
    cy.get('[data-testid="it-is-a-car-button"]').click();
    cy.get('@retake').should('have.been.calledOnce');
    cy.get('@fill').should('have.been.calledOnce');
  });

  it('AiConsentSheet: use Co-Driver or fill in myself', () => {
    const onAccept = cy.stub().as('accept');
    const onDecline = cy.stub().as('decline');
    cy.mount(<AiConsentSheet visible onAccept={onAccept} onDecline={onDecline} />);
    cy.get('[data-testid="ai-consent-sheet"]').should('contain.text', 'Cloudflare Workers AI');
    cy.get('[data-testid="consent-accept"]').click();
    cy.get('[data-testid="consent-decline"]').click();
    cy.get('@accept').should('have.been.calledOnce');
    cy.get('@decline').should('have.been.calledOnce');
  });

  it('DuplicateBanner: View or Save anyway', () => {
    const onView = cy.stub().as('view');
    const onSave = cy.stub().as('save');
    cy.mount(<DuplicateBanner spottedAt="2026-11-03T13:12:00.000Z" onView={onView} onSaveAnyway={onSave} />);
    cy.get('[data-testid="duplicate-banner"]')
      .should('contain.text', 'You already added this photo on')
      .and('contain.text', 'Nov')
      .and('contain.text', '2026');
    cy.get('[data-testid="duplicate-view"]').click();
    cy.get('[data-testid="duplicate-save-anyway"]').click();
    cy.get('@view').should('have.been.calledOnce');
    cy.get('@save').should('have.been.calledOnce');
  });
});

describe('Launcher', () => {
  it('ShutterButton opens the camera and is busy while picking', () => {
    const onPress = cy.stub().as('press');
    cy.mount(<ShutterButton onPress={onPress} />);
    cy.get('[data-testid="shutter-button"]').should('have.attr', 'aria-label', 'Take a photo').click();
    cy.get('@press').should('have.been.calledOnce');
    cy.mount(<ShutterButton onPress={onPress} isLoading />);
    cy.get('[data-testid="shutter-button"]').should('have.attr', 'aria-disabled', 'true');
  });

  it('AiStatusChips show the Co-Driver, auto-city and quota state in words', () => {
    cy.mount(<AiStatusChips aiEnabled autoLocation remaining={12} isOnline />);
    cy.get('[data-testid="chip-ai-on"]').should('contain.text', 'Co-Driver on');
    cy.get('[data-testid="chip-scans"]').should('contain.text', '12 scans left today');
    cy.mount(<AiStatusChips aiEnabled={false} autoLocation={false} isOnline={false} />);
    cy.get('[data-testid="chip-ai-off"]').should('contain.text', 'Co-Driver off');
    cy.get('[data-testid="chip-city-off"]').should('be.visible');
    cy.get('[data-testid="chip-offline"]').should('be.visible');
    cy.get('[data-testid="chip-scans"]').should('not.exist');
  });

  it('PlateShield says what happens to the plates', () => {
    cy.mount(<PlateShield count={2} confirmation="blurred" />);
    cy.get('[data-testid="plate-shield"]').should('contain.text', '2 plates blurred on your phone');
    cy.mount(<PlateShield count={0} />);
    cy.get('[data-testid="plate-shield"]').should('contain.text', 'Plates not checked yet');
  });
});
