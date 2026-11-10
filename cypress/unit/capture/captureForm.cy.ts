import type { RedactedPhoto } from '../../../src/types/Spot';
import {
  buildNewSpot,
  candidatesFor,
  identifiedBy,
  isFreshPhoto,
  localDateTimeParts,
  maskPlate,
  matchCatalogue,
  parseLocalDateTime,
  plateToSend,
  visibleProvenance,
} from '../../../src/utils/captureForm';
import { captureReducer, type CaptureEvent } from '../../../src/utils/captureMachine';
import type { CaptureDraft } from '../../../src/types/Capture';
import { CHIRON, GT3, GUESS_CAR, identified, LIKELY_CAR, MODELS, MX5, newDraft, SURE_CAR } from './fixtures';

const PHOTO: RedactedPhoto = { uri: 'data:image/jpeg;base64,AAAA', width: 1600, height: 1200, mimeType: 'image/jpeg' };

function run(draft: CaptureDraft, ...events: CaptureEvent[]): CaptureDraft {
  return events.reduce(captureReducer, draft);
}

const sure = () => run(newDraft(), { type: 'identify_finished', outcome: identified(SURE_CAR), models: MODELS });

describe('captureForm', () => {
  it('fills every field from a sure answer, marked CO-DRIVER', () => {
    const draft = sure();
    expect(draft.form).to.include({
      carModelId: 'porsche-911-gt3',
      make: 'Porsche',
      model: '911 GT3',
      generation: '992',
      yearFrom: 2021,
      paint: 'blue',
      bodyStyle: 'coupe',
      plate: '1ABC234',
      notifyOwner: true,
    });
    expect(visibleProvenance(draft, 'car')).to.equal('ai');
    expect(visibleProvenance(draft, 'paint')).to.equal('ai');
    expect(visibleProvenance(draft, 'plate')).to.equal('ai');
    expect(visibleProvenance(draft, 'city')).to.equal(undefined);
    expect(draft.aiFilled).to.have.members(['car', 'paint', 'plate']);
  });

  it('a camera shot dates itself (AUTO); a gallery photo waits for EXIF', () => {
    expect(visibleProvenance(newDraft('camera'), 'date')).to.equal('auto');
    expect(visibleProvenance(newDraft('library'), 'date')).to.equal(undefined);
  });

  describe('identified_by', () => {
    it('manual without an answer', () => {
      expect(identifiedBy(newDraft())).to.equal('manual');
      const unavailable = run(newDraft(), {
        type: 'identify_finished',
        outcome: { status: 'unavailable', reason: 'quota' },
        models: MODELS,
      });
      expect(identifiedBy(unavailable)).to.equal('manual');
    });

    it('ai for an untouched answer, also after editing a field Co-Driver did not fill', () => {
      expect(identifiedBy(sure())).to.equal('ai');
      const withCity = captureReducer(sure(), { type: 'edit', field: 'city', patch: { city: 'Gent' } });
      expect(identifiedBy(withCity)).to.equal('ai');
      const withNotes = captureReducer(sure(), { type: 'set_options', patch: { notes: 'Loud', notifyOwner: false } });
      expect(identifiedBy(withNotes)).to.equal('ai');
    });

    it('ai_edited once a Co-Driver field is edited, and the field flips to YOU', () => {
      const paint = captureReducer(sure(), { type: 'edit', field: 'paint', patch: { paint: 'red' } });
      expect(visibleProvenance(paint, 'paint')).to.equal('user');
      expect(identifiedBy(paint)).to.equal('ai_edited');
      const car = captureReducer(sure(), { type: 'choose_car', choice: { kind: 'model', model: CHIRON } });
      expect(visibleProvenance(car, 'car')).to.equal('user');
      expect(identifiedBy(car)).to.equal('ai_edited');
      const plate = captureReducer(sure(), { type: 'edit', field: 'plate', patch: { plate: '2XYZ987' } });
      expect(identifiedBy(plate)).to.equal('ai_edited');
    });

    it('ai_edited when the user picks a candidate in the guess tier', () => {
      const guess = run(newDraft(), { type: 'identify_finished', outcome: identified(GUESS_CAR), models: MODELS });
      const picked = captureReducer(guess, { type: 'choose_car', choice: { kind: 'model', model: GT3 } });
      expect(identifiedBy(picked)).to.equal('ai_edited');
    });

    it('the likely tier still pre-fills the car', () => {
      const likely = run(newDraft(), { type: 'identify_finished', outcome: identified(LIKELY_CAR), models: MODELS });
      expect(likely.form.carModelId).to.equal('porsche-911-gt3');
      expect(identifiedBy(likely)).to.equal('ai');
    });
  });

  it('choosing another car drops the AI generation and years', () => {
    const changed = captureReducer(sure(), { type: 'choose_car', choice: { kind: 'model', model: MX5 } });
    expect(changed.form).to.include({ carModelId: 'mazda-mx-5', generation: '', bodyStyle: 'convertible' });
    expect(changed.form.yearFrom).to.equal(undefined);
  });

  it('matches the catalogue by id, else by one strong search hit', () => {
    expect(matchCatalogue({ make: 'X', model: 'Y', catalogueId: 'mazda-mx-5' }, MODELS)?.id).to.equal('mazda-mx-5');
    expect(matchCatalogue({ make: 'Porsche', model: '911 GT3', catalogueId: 'not-a-model' }, MODELS)?.id).to.equal(
      'porsche-911-gt3',
    );
    expect(matchCatalogue({ make: 'Porsche', model: '911' }, MODELS)).to.equal(undefined);
  });

  it('a car outside the album stays free text (a wildcard), still CO-DRIVER', () => {
    const delorean = run(newDraft(), {
      type: 'identify_finished',
      outcome: identified({ ...SURE_CAR, make: 'DeLorean', model: 'DMC-12', catalogueId: undefined }),
      models: MODELS,
    });
    expect(delorean.form.carModelId).to.equal(undefined);
    expect(delorean.form.make).to.equal('DeLorean');
    expect(visibleProvenance(delorean, 'car')).to.equal('ai');
  });

  it('builds at most 3 deduplicated candidates mapped through carSearch', () => {
    const candidates = candidatesFor(GUESS_CAR, MODELS);
    expect(candidates.map((candidate) => candidate.key)).to.deep.equal([
      'text:porsche 911',
      'porsche-911-gt3',
      'mazda-mx-5',
    ]);
    expect(candidates[0]?.carModel).to.equal(undefined);
    expect(candidates[1]?.carModel?.id).to.equal('porsche-911-gt3');
  });

  it('masks plates to the last two characters', () => {
    expect(maskPlate('1-abc-234')).to.equal('••34');
    expect(maskPlate('')).to.equal('');
  });

  it('sends the plate only with the ping toggle on and a plausible plate', () => {
    const form = sure().form;
    expect(plateToSend(form)).to.equal('1ABC234');
    expect(plateToSend({ ...form, notifyOwner: false })).to.equal(undefined);
    expect(plateToSend({ ...form, plate: 'x' })).to.equal(undefined);
  });

  it('builds the insert with every v2 field', () => {
    const accepted = run(
      sure(),
      { type: 'accept_suggestion', index: 0 },
      { type: 'confirm_plates', confirmation: 'blurred' },
    );
    const withHash = { ...accepted, aiImage: { blob: new Blob(), width: 768, height: 576, dHash: '0123456789abcdef' } };
    const spot = buildNewSpot(withHash, PHOTO, MODELS);
    expect(spot).to.include({
      carModelId: 'porsche-911-gt3',
      make: 'Porsche',
      model: '911 GT3',
      paint: 'blue',
      bodyStyle: 'coupe',
      platesHidden: 1,
      identifiedBy: 'ai',
      aiConfidence: 0.94,
      aiModelId: 'porsche-911-gt3',
      generation: '992',
      yearFrom: 2021,
      photoHash: '0123456789abcdef',
      plate: '1ABC234',
      shareNameWithOwner: false,
      spottedAt: '2026-11-10T12:00:00.000Z',
    });
    expect(spot.city).to.equal(undefined);
    expect(spot.notes).to.equal(undefined);
  });

  it('never shares the name without a ping', () => {
    const draft = run(sure(), { type: 'set_options', patch: { notifyOwner: false, shareNameWithOwner: true } });
    const spot = buildNewSpot(draft, PHOTO, MODELS);
    expect(spot.plate).to.equal(undefined);
    expect(spot.shareNameWithOwner).to.equal(false);
  });

  it('a fresh photo is a camera shot or an EXIF time under an hour old', () => {
    const now = new Date('2026-11-10T12:00:00Z');
    expect(isFreshPhoto('camera', undefined, now)).to.equal(true);
    expect(isFreshPhoto('library', undefined, now)).to.equal(false);
    expect(isFreshPhoto('library', '2026-11-10T11:30:00Z', now)).to.equal(true);
    expect(isFreshPhoto('library', '2026-11-10T10:30:00Z', now)).to.equal(false);
    expect(isFreshPhoto('library', '2026-11-10T12:30:00Z', now)).to.equal(false);
  });

  it('parses the date sheet input (local time, not in the future)', () => {
    const now = new Date(2026, 10, 10, 12, 0);
    const iso = parseLocalDateTime('2026-11-03', '14:12', now);
    expect(iso).to.equal(new Date(2026, 10, 3, 14, 12).toISOString());
    expect(localDateTimeParts(iso ?? '')).to.deep.equal({ date: '2026-11-03', time: '14:12' });
    expect(parseLocalDateTime('2026-02-31', '10:00', now)).to.equal(undefined);
    expect(parseLocalDateTime('2026-11-03', '25:00', now)).to.equal(undefined);
    expect(parseLocalDateTime('2026-12-24', '10:00', now)).to.equal(undefined);
    expect(parseLocalDateTime('3/11/2026', '10:00', now)).to.equal(undefined);
  });
});
