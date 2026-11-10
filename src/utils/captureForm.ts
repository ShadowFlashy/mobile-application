import { FRESH_PHOTO_MS } from '../constants/ai';
import type { CaptureDraft, CaptureField, CaptureForm, CaptureSource, FieldProvenance } from '../types/Capture';
import type { CarModel } from '../types/CarModel';
import type { IdentifiedCar, Provenance } from '../types/Identification';
import type { PlaceSuggestion } from '../types/Location';
import type { IdentifiedBy, NewSpot, RedactedPhoto } from '../types/Spot';
import { bestMatch } from './carSearch';
import { confidenceTier } from './identification';
import { isValidPlate, normalizePlate } from './plate';
import { regionsFromDetections } from './plateRegions';

/**
 * The capture form (SPEC P0-02, P0-05): built from the photo's EXIF, the gazetteer place and the
 * Co-Driver answer, with a provenance per field (CO-DRIVER, AUTO or YOU). A field the user edited is
 * never overwritten by a late answer. Pure functions: every one returns a new draft.
 */

/** Database limits (Appendix A): longer AI values are cut, never rejected. */
export const LIMITS = { make: 40, model: 60, generation: 30, city: 60, notes: 500, plate: 12 } as const;

export function emptyForm(spottedAt: string, shareNameDefault: boolean): CaptureForm {
  return {
    carModelId: undefined,
    make: '',
    model: '',
    generation: '',
    yearFrom: undefined,
    yearTo: undefined,
    paint: 'other',
    bodyStyle: 'other',
    city: '',
    spottedAt,
    notes: '',
    plate: '',
    notifyOwner: false,
    shareNameWithOwner: shareNameDefault,
  };
}

/** A camera shot is taken right now, so its date is AUTO; a gallery photo's date waits for EXIF. */
export function initialProvenance(source: CaptureSource): FieldProvenance {
  return { car: 'user', paint: 'user', city: 'user', date: source === 'camera' ? 'auto' : 'user', plate: 'user' };
}

/** The tag to show next to a field: CO-DRIVER / AUTO for machine values, YOU once edited, else none. */
export function visibleProvenance(draft: CaptureDraft, field: CaptureField): Provenance | undefined {
  if (draft.touched.includes(field)) return 'user';
  const provenance = draft.provenance[field];
  return provenance === 'user' ? undefined : provenance;
}

/** A camera capture, or a photo whose EXIF time is less than an hour old (SPEC P0-02). */
export function isFreshPhoto(source: CaptureSource, takenAt: string | undefined, now: Date): boolean {
  if (source === 'camera') return true;
  if (takenAt === undefined) return false;
  const age = now.getTime() - new Date(takenAt).getTime();
  return Number.isFinite(age) && age >= 0 && age < FRESH_PHOTO_MS;
}

function cut(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function setMachineValue(
  draft: CaptureDraft,
  field: CaptureField,
  provenance: Provenance,
  patch: Partial<CaptureForm>,
): CaptureDraft {
  if (draft.touched.includes(field)) return draft;
  return {
    ...draft,
    form: { ...draft.form, ...patch },
    provenance: { ...draft.provenance, [field]: provenance },
  };
}

/** The EXIF capture time fills the date with an AUTO tag. */
export function applyExif(draft: CaptureDraft, exif: { takenAt?: string }): CaptureDraft {
  if (exif.takenAt === undefined) return draft;
  return setMachineValue(draft, 'date', 'auto', { spottedAt: exif.takenAt });
}

/** The nearest gazetteer place fills the city with an AUTO tag. */
export function applyPlace(draft: CaptureDraft, place: PlaceSuggestion): CaptureDraft {
  return setMachineValue(draft, 'city', 'auto', { city: cut(place.label, LIMITS.city) });
}

/** The catalogue model Co-Driver means: its own (validated) catalogue id, else one strong search hit. */
export function matchCatalogue(
  car: { make: string; model: string; generation?: string; catalogueId?: string },
  models: readonly CarModel[],
): CarModel | undefined {
  if (car.catalogueId !== undefined) {
    const byId = models.find((model) => model.id === car.catalogueId);
    if (byId !== undefined) return byId;
  }
  return bestMatch(models, `${car.make} ${car.model} ${car.generation ?? ''}`);
}

/** A "Is it one of these?" chip: a catalogue sticker, or a free-text name when it is not in the album. */
export interface CarCandidate {
  key: string;
  carModel?: CarModel;
  make: string;
  modelName: string;
  confidence: number;
}

/** Co-Driver's guess plus its alternatives (max 3), mapped through carSearch and deduplicated. */
export function candidatesFor(car: IdentifiedCar, models: readonly CarModel[]): CarCandidate[] {
  const guesses = [
    {
      make: car.make,
      model: car.model,
      generation: car.generation,
      confidence: car.confidence,
      catalogueId: car.catalogueId,
    },
    ...car.alternatives.map((alternative) => ({ ...alternative, generation: undefined })),
  ];
  const candidates: CarCandidate[] = [];
  for (const guess of guesses) {
    const carModel = matchCatalogue(guess, models);
    const key = carModel !== undefined ? carModel.id : `text:${guess.make} ${guess.model}`.toLowerCase();
    if (candidates.some((candidate) => candidate.key === key)) continue;
    candidates.push({
      key,
      carModel,
      make: carModel?.make ?? guess.make,
      modelName: carModel?.model ?? guess.model,
      confidence: guess.confidence,
    });
    if (candidates.length === 3) break;
  }
  return candidates;
}

/**
 * Fills every untouched field from a Co-Driver answer and turns its plate boxes into dashed
 * suggestions. In the `guess` tier the car itself is left empty: the user picks a candidate.
 */
export function applyIdentified(draft: CaptureDraft, car: IdentifiedCar, models: readonly CarModel[]): CaptureDraft {
  let next: CaptureDraft = { ...draft, suggestions: regionsFromDetections(car.plates), acceptedSuggestions: [] };
  const aiFilled: CaptureField[] = [];

  if (!next.touched.includes('car')) {
    if (confidenceTier(car.confidence) === 'guess') {
      next = { ...next, form: { ...next.form, bodyStyle: car.bodyStyle } };
    } else {
      const match = matchCatalogue(car, models);
      next = setMachineValue(next, 'car', 'ai', {
        carModelId: match?.id,
        make: cut(match?.make ?? car.make, LIMITS.make),
        model: cut(match?.model ?? car.model, LIMITS.model),
        generation: cut(car.generation ?? '', LIMITS.generation),
        yearFrom: car.yearFrom,
        yearTo: car.yearTo,
        bodyStyle: car.bodyStyle === 'other' && match !== undefined ? match.bodyStyle : car.bodyStyle,
      });
      aiFilled.push('car');
    }
  }
  if (!next.touched.includes('paint')) {
    next = setMachineValue(next, 'paint', 'ai', { paint: car.paint });
    aiFilled.push('paint');
  }
  const plateText = car.plateText !== undefined ? normalizePlate(car.plateText) : '';
  if (plateText.length > 0 && !next.touched.includes('plate')) {
    // D-4: an AI-read plate pings a verified owner by default (visible toggle, masked plate).
    next = setMachineValue(next, 'plate', 'ai', { plate: plateText.slice(0, LIMITS.plate), notifyOwner: true });
    aiFilled.push('plate');
  }
  return { ...next, aiFilled };
}

/** The car the user picked: a catalogue sticker, or free text after "Not in the album". */
export type CarChoice = { kind: 'model'; model: CarModel } | { kind: 'text'; make: string; model: string };

/** The user edits one field: the value changes and the field's provenance flips to YOU. */
export function editField(draft: CaptureDraft, field: CaptureField, patch: Partial<CaptureForm>): CaptureDraft {
  const touched = draft.touched.includes(field) ? draft.touched : [...draft.touched, field];
  return { ...draft, form: { ...draft.form, ...patch }, provenance: { ...draft.provenance, [field]: 'user' }, touched };
}

/** Picking a car keeps the AI's generation and years only when it is the car Co-Driver meant. */
export function chooseCar(draft: CaptureDraft, choice: CarChoice): CaptureDraft {
  const aiCarModelId = draft.provenance.car === 'ai' ? draft.form.carModelId : undefined;
  if (choice.kind === 'model') {
    const keepAiDetails = aiCarModelId !== undefined && aiCarModelId === choice.model.id;
    return editField(draft, 'car', {
      carModelId: choice.model.id,
      make: choice.model.make,
      model: choice.model.model,
      bodyStyle: choice.model.bodyStyle,
      generation: keepAiDetails ? draft.form.generation : '',
      yearFrom: keepAiDetails ? draft.form.yearFrom : undefined,
      yearTo: keepAiDetails ? draft.form.yearTo : undefined,
    });
  }
  return editField(draft, 'car', {
    carModelId: undefined,
    make: choice.make.slice(0, LIMITS.make),
    model: choice.model.slice(0, LIMITS.model),
  });
}

/** True when the form names a car: a sticker, or a typed make and model. */
export function hasCar(form: Pick<CaptureForm, 'carModelId' | 'make' | 'model'>): boolean {
  return form.carModelId !== undefined || (form.make.trim().length > 0 && form.model.trim().length > 0);
}

/**
 * `identified_by` (SPEC P0-05): `manual` without an applied Co-Driver answer, `ai_edited` once the
 * user changed anything Co-Driver filled in (or picked the car in the guess tier), otherwise `ai`.
 */
export function identifiedBy(draft: CaptureDraft): IdentifiedBy {
  if (draft.outcome?.status !== 'identified') return 'manual';
  if (draft.provenance.car !== 'ai') return 'ai_edited';
  return draft.aiFilled.some((field) => draft.touched.includes(field)) ? 'ai_edited' : 'ai';
}

/** "••34": only the last two characters of a plate are ever shown. */
export function maskPlate(plate: string): string {
  const normalized = normalizePlate(plate);
  return normalized.length === 0 ? '' : `••${normalized.slice(-2)}`;
}

/** The plate to send as `plate_input`: only with the ping toggle on and a plausible plate. */
export function plateToSend(form: CaptureForm): string | undefined {
  return form.notifyOwner && isValidPlate(form.plate) ? normalizePlate(form.plate) : undefined;
}

function optionalText(value: string, max: number): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, max) : undefined;
}

/** The insert for `createSpot`, from the reviewed draft and its redacted photo. */
export function buildNewSpot(draft: CaptureDraft, photo: RedactedPhoto, models: readonly CarModel[]): NewSpot {
  const { form } = draft;
  const catalogueModel = models.find((model) => model.id === form.carModelId);
  const outcome = draft.outcome?.status === 'identified' ? draft.outcome : undefined;
  const aiModelId =
    outcome?.car.catalogueId !== undefined && models.some((model) => model.id === outcome.car.catalogueId)
      ? outcome.car.catalogueId
      : undefined;
  const plate = plateToSend(form);
  return {
    photo,
    carModelId: catalogueModel?.id,
    make: (catalogueModel?.make ?? form.make).trim().slice(0, LIMITS.make),
    model: (catalogueModel?.model ?? form.model).trim().slice(0, LIMITS.model),
    city: optionalText(form.city, LIMITS.city),
    notes: optionalText(form.notes, LIMITS.notes),
    spottedAt: form.spottedAt,
    plate,
    paint: form.paint,
    bodyStyle: form.bodyStyle,
    platesHidden: Math.min(draft.regions.length, 20),
    identifiedBy: identifiedBy(draft),
    aiConfidence: outcome?.car.confidence,
    aiModelId,
    generation: optionalText(form.generation, LIMITS.generation),
    yearFrom: form.yearFrom,
    yearTo: form.yearTo,
    photoHash: draft.aiImage?.dHash,
    shareNameWithOwner: plate !== undefined && form.shareNameWithOwner,
  };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** An ISO time as local "YYYY-MM-DD" and "HH:MM" (for the date sheet). */
export function localDateTimeParts(iso: string): { date: string; time: string } {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { date: '', time: '' };
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

/** Local "YYYY-MM-DD" + "HH:MM" → ISO, or undefined when invalid or in the future. */
export function parseLocalDateTime(date: string, time: string, now: Date = new Date()): string | undefined {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (dateMatch === null || timeMatch === null) return undefined;
  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  if (hours > 23 || minutes > 59 || year < 1900) return undefined;
  const result = new Date(year, month - 1, day, hours, minutes);
  // Rejects dates like 31 February, which Date silently rolls over.
  if (result.getMonth() !== month - 1 || result.getDate() !== day) return undefined;
  if (result.getTime() > now.getTime() + 60_000) return undefined;
  return result.toISOString();
}
