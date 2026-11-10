/**
 * App side of the deployed, frozen `identify-car` contract (SPEC §9): turns the function's JSON
 * (or its HTTP error) into a typed `IdentifyOutcome`. Pure functions with runtime type guards and
 * no casts, so a malformed or hostile answer can never reach the UI as anything but data.
 *
 * The model's answer may contain plate text: nothing in here logs or stores anything.
 */
import { CONFIDENCE_LIKELY, CONFIDENCE_SURE } from '../constants/ai';
import type {
  CarGuess,
  ConfidenceTier,
  IdentifiedCar,
  IdentifyOutcome,
  NormalizedBox,
  UnavailableReason,
  VerifyOutcome,
} from '../types/Identification';
import { isBodyStyle, isPaintColor, isRecord, isVerificationResult } from './typeGuards';

/** The function returns at most 2 alternatives and 6 plate boxes (§9.2). */
const MAX_ALTERNATIVES = 2;
const MAX_PLATES = 6;
const MIN_BOX_SIDE = 0.005;
const MAX_FUN_FACT = 160;
const MAX_PLATE_TEXT = 20;
/** Catalogue ids are slugs such as `porsche-911-gt3`. */
const CATALOGUE_ID = /^[a-z0-9][a-z0-9-]{0,79}$/;

export const IDENTIFY_UNAVAILABLE_ERROR: IdentifyOutcome = { status: 'unavailable', reason: 'error' };

function unavailable(reason: UnavailableReason): IdentifyOutcome {
  return { status: 'unavailable', reason };
}

function text(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : undefined;
}

function finite(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function unit(value: unknown): number {
  return Math.min(1, Math.max(0, finite(value) ?? 0));
}

function year(value: unknown): number | undefined {
  const number = finite(value);
  return number !== undefined && Number.isInteger(number) && number >= 1885 && number <= 2100 ? number : undefined;
}

function count(value: unknown): number | undefined {
  const number = finite(value);
  return number !== undefined && number >= 0 ? Math.floor(number) : undefined;
}

function catalogueId(value: unknown): string | undefined {
  return typeof value === 'string' && CATALOGUE_ID.test(value) ? value : undefined;
}

/** A 0..1 box, clamped to the photo. Undefined when malformed or too small to be a plate. */
export function parseBox(value: unknown): NormalizedBox | undefined {
  if (!isRecord(value)) return undefined;
  const x = finite(value.x);
  const y = finite(value.y);
  const width = finite(value.width);
  const height = finite(value.height);
  if (x === undefined || y === undefined || width === undefined || height === undefined) return undefined;
  const left = unit(x);
  const top = unit(y);
  const box = { x: left, y: top, width: Math.min(unit(width), 1 - left), height: Math.min(unit(height), 1 - top) };
  return box.width >= MIN_BOX_SIDE && box.height >= MIN_BOX_SIDE ? box : undefined;
}

function parseGuess(value: unknown): CarGuess | undefined {
  if (!isRecord(value)) return undefined;
  const make = text(value.make, 40);
  const model = text(value.model, 60);
  if (make === undefined || model === undefined) return undefined;
  const id = catalogueId(value.catalogueId);
  return id === undefined
    ? { make, model, confidence: unit(value.confidence) }
    : { make, model, confidence: unit(value.confidence), catalogueId: id };
}

function parsePlateText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const plate = value
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase()
    .slice(0, MAX_PLATE_TEXT);
  return plate.length > 0 ? plate : undefined;
}

/** The `car` object of an `identified` answer. Undefined when make or model is missing. */
export function parseIdentifiedCar(value: unknown): IdentifiedCar | undefined {
  if (!isRecord(value)) return undefined;
  const make = text(value.make, 40);
  const model = text(value.model, 60);
  if (make === undefined || model === undefined) return undefined;

  // The function calls the colour `color`; the app calls it `paint` (§9.2).
  const paintValue = value.color ?? value.paint;
  const alternatives = (Array.isArray(value.alternatives) ? value.alternatives : [])
    .map(parseGuess)
    .filter((guess): guess is CarGuess => guess !== undefined)
    .slice(0, MAX_ALTERNATIVES);
  const plates = (Array.isArray(value.plates) ? value.plates : [])
    .map(parseBox)
    .filter((box): box is NormalizedBox => box !== undefined)
    .slice(0, MAX_PLATES);

  const car: IdentifiedCar = {
    make,
    model,
    bodyStyle: isBodyStyle(value.bodyStyle) ? value.bodyStyle : 'other',
    paint: isPaintColor(paintValue) ? paintValue : 'other',
    confidence: unit(value.confidence),
    alternatives,
    plates,
  };
  const generation = text(value.generation, 30);
  if (generation !== undefined) car.generation = generation;
  const yearFrom = year(value.yearFrom);
  if (yearFrom !== undefined) car.yearFrom = yearFrom;
  const yearTo = year(value.yearTo);
  if (yearTo !== undefined && (yearFrom === undefined || yearTo >= yearFrom)) car.yearTo = yearTo;
  const id = catalogueId(value.catalogueId);
  if (id !== undefined) car.catalogueId = id;
  const vehicleBox = parseBox(value.vehicleBox);
  if (vehicleBox !== undefined) car.vehicleBox = vehicleBox;
  const plateText = parsePlateText(value.plateText);
  if (plateText !== undefined) car.plateText = plateText;
  const funFact = text(value.funFact, MAX_FUN_FACT);
  if (funFact !== undefined) car.funFact = funFact;
  return car;
}

/**
 * Turns a 200 body of `identify-car` into an outcome. Anything that does not follow the §9.2
 * contract (including a missing `remainingToday`) is `unavailable/error`: the user fills in.
 */
export function parseIdentifyResponse(json: unknown): IdentifyOutcome {
  if (!isRecord(json)) return IDENTIFY_UNAVAILABLE_ERROR;
  const remainingToday = count(json.remainingToday);
  if (remainingToday === undefined) return IDENTIFY_UNAVAILABLE_ERROR;

  if (json.status === 'no_car' || json.status === 'not_a_car') {
    const subject = text(json.subject, 60);
    return subject === undefined
      ? { status: 'not_a_car', remainingToday }
      : { status: 'not_a_car', subject, remainingToday };
  }
  if (json.status !== 'identified') return IDENTIFY_UNAVAILABLE_ERROR;

  const car = parseIdentifiedCar(json.car);
  if (car === undefined) return IDENTIFY_UNAVAILABLE_ERROR;
  const provider = text(json.provider, 20);
  return provider === undefined
    ? { status: 'identified', car, remainingToday }
    : { status: 'identified', car, remainingToday, provider };
}

/** Error codes of the deployed function (§9.3) that are not a plain `error`. */
const ERROR_REASONS: ReadonlyMap<string, UnavailableReason> = new Map<string, UnavailableReason>([
  ['quota_exceeded', 'quota'],
  ['provider_busy', 'busy'],
  ['not_configured', 'not_configured'],
]);

/** The `error` code of a `{ "error": code }` body, if any. */
export function errorCode(body: unknown): string | undefined {
  return isRecord(body) && typeof body.error === 'string' ? body.error : undefined;
}

/**
 * Maps a non-2xx answer of `identify-car` (§9.3). The error code decides; a bare 429 without a
 * known code (e.g. the gateway) counts as busy. Everything else is `error`.
 */
export function outcomeForHttpError(status: number, body: unknown): IdentifyOutcome {
  const code = errorCode(body);
  const reason = code !== undefined ? ERROR_REASONS.get(code) : undefined;
  if (reason !== undefined) return unavailable(reason);
  if (status === 429 && code === undefined) return unavailable('busy');
  return IDENTIFY_UNAVAILABLE_ERROR;
}

/**
 * P1: the answer of `verify-owner` (§9.6), `{ status: <VerificationResult>, remainingToday? }`.
 * `result` is accepted as the field name too (the Cypress stub uses it). The decision itself is
 * made by Postgres; this only narrows the value.
 */
export function parseVerifyResponse(json: unknown): VerifyOutcome {
  if (!isRecord(json)) return { status: 'unavailable', reason: 'error' };
  const result = isVerificationResult(json.status) ? json.status : json.result;
  if (!isVerificationResult(result)) return { status: 'unavailable', reason: 'error' };
  return { status: 'result', result, remainingToday: count(json.remainingToday) ?? 0 };
}

/** §4 P0-05: `sure` ≥ 0.85, `likely` 0.60–0.85, `guess` < 0.60 (NaN counts as a guess). */
export function confidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= CONFIDENCE_SURE) return 'sure';
  if (confidence >= CONFIDENCE_LIKELY) return 'likely';
  return 'guess';
}
