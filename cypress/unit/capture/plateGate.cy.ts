import type { CaptureDraft } from '../../../src/types/Capture';
import { captureReducer, type CaptureEvent } from '../../../src/utils/captureMachine';
import { canCollect, ignoredSuggestions, needsSecondTap } from '../../../src/utils/plateGate';
import { CHIRON, identified, MODELS, newDraft, SURE_CAR } from './fixtures';

function run(draft: CaptureDraft, ...events: CaptureEvent[]): CaptureDraft {
  return events.reduce(captureReducer, draft);
}

const REGION = { x: 0.1, y: 0.1, width: 0.2, height: 0.1 };
const withCar = () => run(newDraft(), { type: 'choose_car', choice: { kind: 'model', model: CHIRON } });
const withSuggestion = () =>
  run(newDraft(), { type: 'identify_finished', outcome: identified(SURE_CAR), models: MODELS });

function reason(draft: CaptureDraft, isOnline = true): string {
  const gate = canCollect({ draft, isOnline });
  return gate.ok ? 'ok' : gate.reason;
}

describe('plateGate.canCollect', () => {
  it('nothing is ever pre-confirmed', () => {
    expect(reason(withCar())).to.equal('confirm_plates');
    expect(reason(withSuggestion())).to.equal('confirm_plates');
  });

  it('"Every plate is blurred" with a region opens the gate', () => {
    expect(
      reason(
        run(withCar(), { type: 'add_region', region: REGION }, { type: 'confirm_plates', confirmation: 'blurred' }),
      ),
    ).to.equal('ok');
  });

  it('"No licence plate is visible" opens the gate when Co-Driver saw nothing', () => {
    expect(reason(run(withCar(), { type: 'confirm_plates', confirmation: 'none_visible' }))).to.equal('ok');
  });

  it('a region change after confirming closes the gate again', () => {
    const confirmed = run(
      withCar(),
      { type: 'add_region', region: REGION },
      { type: 'confirm_plates', confirmation: 'blurred' },
    );
    expect(
      reason(captureReducer(confirmed, { type: 'update_region', index: 0, region: { ...REGION, y: 0.5 } })),
    ).to.equal('confirm_plates');
    expect(reason(captureReducer(confirmed, { type: 'remove_region', index: 0 }))).to.equal('confirm_plates');
  });

  it('ignoring a suggested plate needs the second tap', () => {
    const none = run(withSuggestion(), { type: 'confirm_plates', confirmation: 'none_visible' });
    expect(ignoredSuggestions(none)).to.have.length(1);
    expect(needsSecondTap(none)).to.equal(true);
    expect(reason(none)).to.equal('confirm_ignored_suggestions');
    const second = captureReducer(none, { type: 'confirm_ignored_suggestions' });
    expect(needsSecondTap(second)).to.equal(false);
    expect(reason(second)).to.equal('ok');
  });

  it('a covered suggestion needs no second tap', () => {
    const covered = run(
      withSuggestion(),
      { type: 'accept_suggestion', index: 0 },
      { type: 'confirm_plates', confirmation: 'blurred' },
    );
    expect(ignoredSuggestions(covered)).to.deep.equal([]);
    expect(reason(covered)).to.equal('ok');
  });

  it('needs a car (a sticker or a typed make and model)', () => {
    const noCar = run(newDraft(), { type: 'confirm_plates', confirmation: 'none_visible' });
    expect(reason(noCar)).to.equal('missing_car');
    const halfTyped = captureReducer(noCar, {
      type: 'choose_car',
      choice: { kind: 'text', make: 'DeLorean', model: ' ' },
    });
    expect(reason(halfTyped)).to.equal('missing_car');
    const typed = captureReducer(noCar, {
      type: 'choose_car',
      choice: { kind: 'text', make: 'DeLorean', model: 'DMC-12' },
    });
    expect(reason(typed)).to.equal('ok');
  });

  it('not a car blocks until the user fills it in', () => {
    const notACar = run(
      withCar(),
      { type: 'identify_finished', outcome: { status: 'not_a_car', remainingToday: 3 }, models: MODELS },
      { type: 'confirm_plates', confirmation: 'none_visible' },
    );
    expect(reason(notACar)).to.equal('missing_car');
    expect(reason(captureReducer(notACar, { type: 'fill_manually' }))).to.equal('ok');
  });

  it('offline and saving block COLLECT', () => {
    const ready = run(withCar(), { type: 'confirm_plates', confirmation: 'none_visible' });
    expect(reason(ready, false)).to.equal('offline');
    expect(reason(captureReducer(ready, { type: 'collect_started' }))).to.equal('busy');
  });
});
