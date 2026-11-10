import type { CaptureDraft } from '../../../src/types/Capture';
import { captureReducer, isAnalysing, type CaptureEvent } from '../../../src/utils/captureMachine';
import { CHIRON, GUESS_CAR, identified, MODELS, newDraft, SURE_CAR } from './fixtures';

function run(draft: CaptureDraft, ...events: CaptureEvent[]): CaptureDraft {
  return events.reduce(captureReducer, draft);
}

const SURE = identified(SURE_CAR);
const REGION = { x: 0.1, y: 0.6, width: 0.3, height: 0.1 };

describe('captureMachine', () => {
  it('starts in preparing, with nothing confirmed', () => {
    const draft = newDraft();
    expect(draft.status).to.equal('preparing');
    expect(draft.manual).to.equal(false);
    expect(draft.plateConfirmation).to.equal(undefined);
    expect(draft.regions).to.deep.equal([]);
    expect(isAnalysing(draft)).to.equal(true);
  });

  it('preparing → identifying → reviewing when Co-Driver answers', () => {
    const identifying = run(newDraft(), { type: 'identify_started' });
    expect(identifying.status).to.equal('identifying');
    const reviewing = captureReducer(identifying, { type: 'identify_finished', outcome: SURE, models: MODELS });
    expect(reviewing.status).to.equal('reviewing');
    expect(reviewing.outcome).to.deep.equal(SURE);
    expect(reviewing.form.carModelId).to.equal('porsche-911-gt3');
    expect(isAnalysing(reviewing)).to.equal(false);
  });

  it('ignores a late AI result after "Fill in myself"', () => {
    const manual = run(newDraft(), { type: 'identify_started' }, { type: 'fill_manually' });
    expect(manual.status).to.equal('reviewing');
    expect(manual.manual).to.equal(true);
    const late = captureReducer(manual, { type: 'identify_finished', outcome: SURE, models: MODELS });
    expect(late).to.equal(manual);
    expect(late.form.carModelId).to.equal(undefined);
    expect(late.suggestions).to.deep.equal([]);
  });

  it('ignores an AI result that arrives while saving', () => {
    const saving = run(
      newDraft(),
      { type: 'add_region', region: REGION },
      { type: 'confirm_plates', confirmation: 'blurred' },
      { type: 'choose_car', choice: { kind: 'model', model: CHIRON } },
      { type: 'collect_started' },
    );
    expect(saving.status).to.equal('collecting');
    expect(captureReducer(saving, { type: 'identify_finished', outcome: SURE, models: MODELS })).to.equal(saving);
  });

  it('an unavailable outcome switches to manual mode', () => {
    const offline = run(newDraft(), {
      type: 'identify_finished',
      outcome: { status: 'unavailable', reason: 'not_configured' },
      models: MODELS,
    });
    expect(offline.status).to.equal('reviewing');
    expect(offline.manual).to.equal(true);
  });

  it('not a car keeps the draft out of manual mode until the user insists', () => {
    const notACar = run(newDraft(), {
      type: 'identify_finished',
      outcome: { status: 'not_a_car', remainingToday: 11 },
      models: MODELS,
    });
    expect(notACar.status).to.equal('reviewing');
    expect(notACar.manual).to.equal(false);
    expect(captureReducer(notACar, { type: 'fill_manually' }).manual).to.equal(true);
  });

  it('consent pauses and identify_started resumes', () => {
    const waiting = run(newDraft(), { type: 'consent_required' });
    expect(waiting.awaitingConsent).to.equal(true);
    const resumed = captureReducer(waiting, { type: 'identify_started' });
    expect(resumed.awaitingConsent).to.equal(false);
    expect(resumed.status).to.equal('identifying');
  });

  describe('plates', () => {
    const withSuggestion = run(newDraft(), { type: 'identify_finished', outcome: SURE, models: MODELS });

    it('AI boxes are padded suggestions, not regions', () => {
      expect(withSuggestion.suggestions).to.have.length(1);
      expect(withSuggestion.regions).to.deep.equal([]);
      const suggestion = withSuggestion.suggestions[0];
      expect(suggestion?.width).to.be.closeTo(0.16 * 1.4, 1e-9);
      expect(suggestion?.height).to.be.closeTo(0.07 * 1.8, 1e-9);
    });

    it('accepting a suggestion turns it into a region once', () => {
      const accepted = run(
        withSuggestion,
        { type: 'accept_suggestion', index: 0 },
        { type: 'accept_suggestion', index: 0 },
      );
      expect(accepted.regions).to.have.length(1);
      expect(accepted.acceptedSuggestions).to.deep.equal([0]);
    });

    it('"Every plate is blurred" needs at least one region', () => {
      expect(
        captureReducer(newDraft(), { type: 'confirm_plates', confirmation: 'blurred' }).plateConfirmation,
      ).to.equal(undefined);
      const confirmed = run(
        newDraft(),
        { type: 'add_region', region: REGION },
        { type: 'confirm_plates', confirmation: 'blurred' },
      );
      expect(confirmed.plateConfirmation).to.equal('blurred');
    });

    it('every region change resets the confirmation', () => {
      const confirmed = run(
        newDraft(),
        { type: 'add_region', region: REGION },
        { type: 'confirm_plates', confirmation: 'blurred' },
      );
      const changes: CaptureEvent[] = [
        { type: 'add_region', region: REGION },
        { type: 'update_region', index: 0, region: { ...REGION, x: 0.2 } },
        { type: 'remove_region', index: 0 },
      ];
      changes.forEach((event) => {
        expect(captureReducer(confirmed, event).plateConfirmation, event.type).to.equal(undefined);
      });
      const accepted = run(
        withSuggestion,
        { type: 'confirm_plates', confirmation: 'none_visible' },
        { type: 'accept_suggestion', index: 0 },
      );
      expect(accepted.plateConfirmation).to.equal(undefined);
    });

    it('removing an accepted suggestion shows it dashed again', () => {
      const accepted = run(withSuggestion, { type: 'accept_suggestion', index: 0 });
      const removed = captureReducer(accepted, { type: 'remove_region', index: 0 });
      expect(removed.acceptedSuggestions).to.deep.equal([]);
    });

    it('clamps regions to the photo', () => {
      const clamped = captureReducer(newDraft(), {
        type: 'add_region',
        region: { x: 0.9, y: 0.9, width: 0.5, height: 0.5 },
      });
      const region = clamped.regions[0];
      expect((region?.x ?? 0) + (region?.width ?? 0)).to.be.at.most(1);
      expect((region?.y ?? 0) + (region?.height ?? 0)).to.be.at.most(1);
    });

    it('the second tap is only stored for "No licence plate is visible"', () => {
      expect(
        captureReducer(withSuggestion, { type: 'confirm_ignored_suggestions' }).ignoredSuggestionsConfirmed,
      ).to.equal(false);
      const none = run(
        withSuggestion,
        { type: 'confirm_plates', confirmation: 'none_visible' },
        { type: 'confirm_ignored_suggestions' },
      );
      expect(none.ignoredSuggestionsConfirmed).to.equal(true);
    });
  });

  it('a field the user edited is never overwritten by a late answer', () => {
    const edited = run(newDraft(), { type: 'edit', field: 'paint', patch: { paint: 'red' } });
    const answered = captureReducer(edited, { type: 'identify_finished', outcome: SURE, models: MODELS });
    expect(answered.form.paint).to.equal('red');
    expect(answered.provenance.paint).to.equal('user');
    expect(answered.form.carModelId).to.equal('porsche-911-gt3');
  });

  it('collect: collecting → failed keeps the draft for a retry → collected', () => {
    const ready = run(
      newDraft(),
      { type: 'confirm_plates', confirmation: 'none_visible' },
      { type: 'choose_car', choice: { kind: 'text', make: 'DeLorean', model: 'DMC-12' } },
      { type: 'collect_started' },
    );
    expect(ready.status).to.equal('collecting');
    expect(captureReducer(ready, { type: 'add_region', region: REGION }).regions).to.deep.equal([]);
    const failed = captureReducer(ready, { type: 'collect_failed', message: 'Your spot could not be saved.' });
    expect(failed.status).to.equal('failed');
    expect(failed.saveError).to.equal('Your spot could not be saved.');
    expect(failed.form.make).to.equal('DeLorean');
    const retry = captureReducer(failed, { type: 'collect_started' });
    expect(retry.status).to.equal('collecting');
    expect(retry.saveError).to.equal(undefined);
    expect(captureReducer(retry, { type: 'collected' }).status).to.equal('collected');
  });

  it('guess tier leaves the car empty for the user to pick', () => {
    const guess = run(newDraft(), { type: 'identify_finished', outcome: identified(GUESS_CAR), models: MODELS });
    expect(guess.form.carModelId).to.equal(undefined);
    expect(guess.form.make).to.equal('');
    expect(guess.form.paint).to.equal('silver');
  });

  it('duplicates can be dismissed', () => {
    const duplicate = run(newDraft(), { type: 'duplicate_found', spotId: 'spot-1' });
    expect(duplicate.duplicateOfId).to.equal('spot-1');
    expect(captureReducer(duplicate, { type: 'dismiss_duplicate' }).duplicateDismissed).to.equal(true);
  });

  it('EXIF time and the place fill date and city as AUTO', () => {
    const filled = run(
      newDraft('library'),
      { type: 'exif_read', exif: { takenAt: '2026-11-03T13:12:00.000Z' } },
      {
        type: 'place_found',
        place: {
          place: { id: 'spa', nameEn: 'Spa', nameNl: 'Spa', country: 'BE', lat: 50.49, lon: 5.86 },
          label: 'Spa',
          source: 'exif',
        },
      },
    );
    expect(filled.form.spottedAt).to.equal('2026-11-03T13:12:00.000Z');
    expect(filled.provenance.date).to.equal('auto');
    expect(filled.form.city).to.equal('Spa');
    expect(filled.provenance.city).to.equal('auto');
  });
});
