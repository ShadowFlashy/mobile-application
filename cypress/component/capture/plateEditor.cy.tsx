import { useReducer } from 'react';
import { PlateConfirm } from '../../../src/components/capture/PlateConfirm';
import { PlateEditor } from '../../../src/components/capture/PlateEditor';
import type { CaptureDraft } from '../../../src/types/Capture';
import type { IdentifyOutcome } from '../../../src/types/Identification';
import { captureReducer, createDraft } from '../../../src/utils/captureMachine';
import { canCollect, ignoredSuggestions, needsSecondTap } from '../../../src/utils/plateGate';

const CHIRON = {
  id: 'bugatti-chiron',
  stickerNumber: 19,
  make: 'Bugatti',
  model: 'Chiron',
  category: 'hypercar',
  rarity: 'legendary',
  bodyStyle: 'supercar',
  country: 'FR',
  season: 1,
} as const;

const WITH_PLATE: IdentifyOutcome = {
  status: 'identified',
  remainingToday: 12,
  car: {
    make: 'Bugatti',
    model: 'Chiron',
    bodyStyle: 'supercar',
    paint: 'blue',
    confidence: 0.94,
    catalogueId: 'bugatti-chiron',
    alternatives: [],
    plates: [{ x: 0.42, y: 0.62, width: 0.16, height: 0.07 }],
    plateText: '',
  },
};

/** Builds the starting draft: the car is known, so the gate only depends on the plates. */
function startDraft(photoUri: string, withSuggestion: boolean): CaptureDraft {
  const draft = createDraft({
    id: 'test',
    photo: { uri: photoUri, width: 800, height: 600 },
    source: 'camera',
    now: new Date().toISOString(),
    shareNameDefault: false,
  });
  const identified = withSuggestion
    ? captureReducer(draft, { type: 'identify_finished', outcome: WITH_PLATE, models: [CHIRON] })
    : draft;
  return captureReducer(identified, { type: 'choose_car', choice: { kind: 'model', model: CHIRON } });
}

/** PlateEditor + PlateConfirm wired to the real capture reducer, like the review screen does. */
function Harness({ photoUri, withSuggestion }: { photoUri: string; withSuggestion: boolean }) {
  const [draft, dispatch] = useReducer(captureReducer, startDraft(photoUri, withSuggestion));
  const gate = canCollect({ draft, isOnline: true });
  return (
    <div style={{ width: 400 }}>
      <PlateEditor
        photo={draft.photo}
        regions={draft.regions}
        suggestions={draft.suggestions}
        acceptedSuggestions={draft.acceptedSuggestions}
        onAddRegion={(region) => dispatch({ type: 'add_region', region })}
        onUpdateRegion={(index, region) => dispatch({ type: 'update_region', index, region })}
        onRemoveRegion={(index) => dispatch({ type: 'remove_region', index })}
        onAcceptSuggestion={(index) => dispatch({ type: 'accept_suggestion', index })}
      />
      <PlateConfirm
        regionCount={draft.regions.length}
        confirmation={draft.plateConfirmation}
        needsSecondTap={needsSecondTap(draft)}
        ignoredCount={ignoredSuggestions(draft).length}
        onConfirm={(confirmation) => dispatch({ type: 'confirm_plates', confirmation })}
        onConfirmIgnored={() => dispatch({ type: 'confirm_ignored_suggestions' })}
        sectionTestID="plates-section"
      />
      <output data-testid="gate">{gate.ok ? 'ok' : gate.reason}</output>
      <output data-testid="regions">{JSON.stringify(draft.regions)}</output>
    </div>
  );
}

function mountHarness(withSuggestion: boolean) {
  cy.fixture('car.jpg', 'base64').then((base64: string) => {
    cy.mount(<Harness photoUri={`data:image/jpeg;base64,${base64}`} withSuggestion={withSuggestion} />);
  });
  // onLayout on the web arrives one frame after mounting: wait for the measured attribute, not a timer.
  cy.get('[data-testid="plate-editor"]').should('have.attr', 'data-measured', 'true');
}

function regions(): Cypress.Chainable<{ x: number; y: number; width: number; height: number }[]> {
  return cy
    .get('[data-testid="regions"]')
    .invoke('text')
    .then((text) => JSON.parse(text));
}

const MOUSE = { eventConstructor: 'MouseEvent', button: 0, buttons: 1 } as const;

describe('PlateEditor', () => {
  it('shows auto-fill plates as dashed suggestions that are not regions until accepted', () => {
    mountHarness(true);
    cy.get('[data-testid="plate-suggestion-0"]').should('be.visible');
    // A dashed text-colour box, never a glow.
    cy.get('[data-testid="plate-suggestion-0"]').should('have.css', 'border-top-style', 'dashed');
    cy.get('[data-testid="plate-suggestion-0"]').should('have.css', 'box-shadow', 'none');
    cy.get('[data-testid="plate-region-0"]').should('not.exist');
    regions().should('have.length', 0);
    cy.get('[data-testid="plate-suggestion-0"]').click();
    cy.get('[data-testid="plate-suggestion-0"]').should('not.exist');
    cy.get('[data-testid="plate-region-0"]').should('be.visible');
    cy.get('[data-testid="plate-region-chip-0"]').should('be.visible');
    regions().should('have.length', 1);
  });

  it('moves an accepted box by dragging it', () => {
    mountHarness(true);
    cy.get('[data-testid="plate-suggestion-0"]').click();
    regions().then(([before]) => {
      cy.get('[data-testid="plate-region-0"]').trigger('mousedown', 'center', MOUSE);
      // Frame coordinates: the box centre sits at (x + w/2, y + h/2) of the 400 × 300 frame.
      const startX = ((before?.x ?? 0) + (before?.width ?? 0) / 2) * 400;
      const startY = ((before?.y ?? 0) + (before?.height ?? 0) / 2) * 300;
      cy.get('[data-testid="plate-editor"]')
        .trigger('mousemove', startX - 40, startY - 30, MOUSE)
        .trigger('mouseup', startX - 40, startY - 30, { eventConstructor: 'MouseEvent', button: 0 });
      regions().then(([after]) => {
        expect(after?.x).to.be.closeTo((before?.x ?? 0) - 0.1, 0.02);
        expect(after?.y).to.be.closeTo((before?.y ?? 0) - 0.1, 0.02);
        expect(after?.width).to.be.closeTo(before?.width ?? 0, 1e-6);
      });
    });
  });

  it('resizes a box with its corner handle', () => {
    mountHarness(false);
    cy.get('[data-testid="add-box-button"]').click();
    regions().then(([before]) => {
      cy.get('[data-testid="plate-region-0-handle"]').trigger('mousedown', 'center', MOUSE);
      const cornerX = ((before?.x ?? 0) + (before?.width ?? 0)) * 400;
      const cornerY = ((before?.y ?? 0) + (before?.height ?? 0)) * 300;
      cy.get('[data-testid="plate-editor"]')
        .trigger('mousemove', cornerX + 40, cornerY + 15, MOUSE)
        .trigger('mouseup', cornerX + 40, cornerY + 15, { eventConstructor: 'MouseEvent', button: 0 });
      regions().then(([after]) => {
        expect(after?.x).to.be.closeTo(before?.x ?? 0, 1e-6);
        expect(after?.width).to.be.closeTo((before?.width ?? 0) + 0.1, 0.02);
        expect(after?.height).to.be.closeTo((before?.height ?? 0) + 0.05, 0.02);
      });
    });
  });

  it('adds boxes with the accessible button and deletes them from their chip', () => {
    mountHarness(false);
    cy.get('[data-testid="add-box-button"]').click().click();
    cy.get('[data-testid^="plate-region-chip-"]').should('have.length', 2);
    cy.get('[data-testid="plate-region-chip-0"]').find('[role="button"]').click();
    cy.get('[data-testid^="plate-region-chip-"]').should('have.length', 1);
    regions().should('have.length', 1);
  });

  it('draws a new box by dragging over the photo', () => {
    mountHarness(false);
    cy.get('[data-testid="plate-editor"]')
      .trigger('mousedown', 40, 40, MOUSE)
      .trigger('mousemove', 140, 80, MOUSE)
      .trigger('mouseup', 140, 80, { eventConstructor: 'MouseEvent', button: 0 });
    regions().should('have.length', 1);
    cy.get('[data-testid="plate-region-0"]').should('be.visible');
  });
});

describe('PlateConfirm', () => {
  it('"Every plate is blurred" needs at least one region; nothing is pre-selected', () => {
    mountHarness(false);
    cy.get('[data-testid="plate-confirm-blurred"]').should('have.attr', 'aria-disabled', 'true');
    cy.get('[data-testid="plate-confirm-blurred"]').should('not.have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="plate-confirm-none"]').should('not.have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="gate"]').should('have.text', 'confirm_plates');
    cy.get('[data-testid="plates-section"]').should('contain.text', 'Not checked');
    cy.get('[data-testid="add-box-button"]').click();
    cy.get('[data-testid="plate-confirm-blurred"]').should('not.have.attr', 'aria-disabled', 'true').click();
    cy.get('[data-testid="plate-confirm-blurred"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="plates-section"]').should('contain.text', '1 plate blurred');
    cy.get('[data-testid="gate"]').should('have.text', 'ok');
  });

  it('any region change resets the choice', () => {
    mountHarness(false);
    cy.get('[data-testid="add-box-button"]').click();
    cy.get('[data-testid="plate-confirm-blurred"]').click();
    cy.get('[data-testid="gate"]').should('have.text', 'ok');
    cy.get('[data-testid="add-box-button"]').click();
    cy.get('[data-testid="plate-confirm-blurred"]').should('not.have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="gate"]').should('have.text', 'confirm_plates');
    cy.get('[data-testid="plate-confirm-blurred"]').click();
    cy.get('[data-testid="plate-region-chip-1"]').find('[role="button"]').click();
    cy.get('[data-testid="gate"]').should('have.text', 'confirm_plates');
    cy.get('[data-testid="plate-confirm-none"]').click();
    cy.get('[data-testid="plate-region-0"]').trigger('mousedown', 'center', MOUSE);
    cy.get('[data-testid="plate-editor"]')
      .trigger('mousemove', 20, 20, MOUSE)
      .trigger('mouseup', 20, 20, { eventConstructor: 'MouseEvent', button: 0 });
    cy.get('[data-testid="plate-confirm-none"]').should('not.have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="gate"]').should('have.text', 'confirm_plates');
  });

  it('asks a second time when auto-fill suggested a plate that is not blurred', () => {
    mountHarness(true);
    cy.get('[data-testid="plate-confirm-none"]').click();
    cy.get('[data-testid="plate-confirm-warning"]').should('contain.text', 'Auto-fill thinks it saw a plate');
    cy.get('[data-testid="gate"]').should('have.text', 'confirm_ignored_suggestions');
    cy.get('[data-testid="plate-confirm-second-tap"]').click();
    cy.get('[data-testid="plate-confirm-warning"]').should('not.exist');
    cy.get('[data-testid="gate"]').should('have.text', 'ok');
  });

  it('needs no second tap once the suggestion is blurred', () => {
    mountHarness(true);
    cy.get('[data-testid="plate-suggestion-0"]').click();
    cy.get('[data-testid="plate-confirm-blurred"]').click();
    cy.get('[data-testid="plate-confirm-warning"]').should('not.exist');
    cy.get('[data-testid="gate"]').should('have.text', 'ok');
  });
});
