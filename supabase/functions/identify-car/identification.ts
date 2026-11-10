/**
 * Provider-independent part of the identify-car Edge Function: the JSON schema the vision model
 * must answer with, the prompt, and a strict parser for the answer.
 *
 * This file uses no Deno, network or npm APIs on purpose, so the app's Cypress unit tests can
 * import and test it directly (cypress/unit/identification.cy.ts).
 */

export const BODY_STYLES = [
  'hatchback',
  'sedan',
  'wagon',
  'coupe',
  'convertible',
  'suv',
  'pickup',
  'van',
  'supercar',
  'other',
] as const;
export type BodyStyle = (typeof BODY_STYLES)[number];

export const CAR_COLORS = [
  'black',
  'white',
  'silver',
  'grey',
  'red',
  'blue',
  'green',
  'yellow',
  'orange',
  'brown',
  'beige',
  'purple',
  'gold',
  'other',
] as const;
export type CarColor = (typeof CAR_COLORS)[number];

/** A rectangle relative to the photo: 0..1 from the top-left corner. */
export interface NormalizedBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CarGuess {
  make: string;
  model: string;
  confidence: number;
}

export interface IdentifiedCar {
  make: string;
  model: string;
  /** Generation or chassis code such as "992" or "XP210"; empty when unknown. */
  generation: string;
  yearFrom?: number;
  yearTo?: number;
  bodyStyle: BodyStyle;
  color: CarColor;
  /** 0..1 — how sure the model is about make + model. */
  confidence: number;
  /** id of the matching row in public.car_models, when the car is in the sticker catalogue. */
  catalogueId?: string;
  alternatives: CarGuess[];
  vehicleBox?: NormalizedBox;
  /** Every licence plate the model found, to be pre-placed as blur regions. */
  plates: NormalizedBox[];
  /** Normalised plate text (A-Z, 0-9) used once to ping a registered owner; empty when unreadable. */
  plateText: string;
  /** One short, fun fact about this model (AI-generated, shown as such). */
  funFact: string;
}

export type Identification = { status: 'identified'; car: IdentifiedCar } | { status: 'no_car' };

export interface CatalogueEntry {
  id: string;
  make: string;
  model: string;
}

const BOX_SCHEMA = {
  type: 'object',
  properties: {
    x: { type: 'number' },
    y: { type: 'number' },
    width: { type: 'number' },
    height: { type: 'number' },
  },
  required: ['x', 'y', 'width', 'height'],
  additionalProperties: false,
};

/** JSON schema for structured output. Unknown values use "" / 0 instead of null. */
export const IDENTIFICATION_SCHEMA = {
  type: 'object',
  properties: {
    isCar: { type: 'boolean' },
    make: { type: 'string' },
    model: { type: 'string' },
    generation: { type: 'string' },
    yearFrom: { type: 'integer' },
    yearTo: { type: 'integer' },
    bodyStyle: { type: 'string', enum: [...BODY_STYLES] },
    color: { type: 'string', enum: [...CAR_COLORS] },
    confidence: { type: 'number' },
    catalogueId: { type: 'string' },
    alternatives: {
      type: 'array',
      items: {
        type: 'object',
        properties: { make: { type: 'string' }, model: { type: 'string' }, confidence: { type: 'number' } },
        required: ['make', 'model', 'confidence'],
        additionalProperties: false,
      },
    },
    vehicleBox: BOX_SCHEMA,
    plates: { type: 'array', items: BOX_SCHEMA },
    plateText: { type: 'string' },
    funFact: { type: 'string' },
  },
  required: [
    'isCar',
    'make',
    'model',
    'generation',
    'yearFrom',
    'yearTo',
    'bodyStyle',
    'color',
    'confidence',
    'catalogueId',
    'alternatives',
    'vehicleBox',
    'plates',
    'plateText',
    'funFact',
  ],
  additionalProperties: false,
};

export const SYSTEM_PROMPT =
  'You are the recognition engine of Redline, a car-spotting app. Car spotters photograph cars they see ' +
  'on the street and collect them as stickers. You identify the car in the photo as precisely as possible ' +
  'and locate every licence plate so the app can blur it for privacy. You answer only with JSON that ' +
  'follows the given schema.';

export function buildInstructions(catalogue: CatalogueEntry[], width: number, height: number): string {
  const list = catalogue.map((entry) => `${entry.id} = ${entry.make} ${entry.model}`).join('\n');
  return [
    `The photo is ${width}x${height} pixels.`,
    'Identify the main car: the largest or most central road vehicle. If there is no car, van, pickup or SUV',
    'in the photo (or it is a toy, drawing or screen), set isCar to false and leave the other fields empty or 0.',
    '- make and model: as enthusiasts write them, e.g. make "Porsche", model "911 GT3"; include the variant when',
    '  badges or styling make it clear (GT3, RS, AMG, M3, Type R...).',
    '- generation: chassis or generation code when you are confident (e.g. "992", "XP210", "G80"), else "".',
    '- yearFrom / yearTo: production years of that generation or facelift; 0 when unknown (yearTo 0 = still built).',
    '- confidence: 0..1 for make + model together. Be honest; lower it for blurry, distant or partial cars.',
    '- catalogueId: the id from the catalogue below when the photo shows exactly that model (variant included),',
    '  otherwise "". Never invent ids.',
    '- alternatives: up to 2 other plausible make/model guesses with their confidence, best first.',
    '- vehicleBox: the whole car as a box relative to the photo, every value 0..1 from the top-left corner.',
    '- plates: one box (same 0..1 coordinates) per visible licence plate, front or rear, of ANY vehicle in the',
    '  photo. Make each box tightly cover the whole plate including its frame. Empty array when none is visible.',
    '- plateText: the main car\'s plate characters (letters and digits only) if clearly readable, else "".',
    '- funFact: one short, true and fun fact about this model for car enthusiasts (max 140 characters), or "".',
    '',
    'Sticker catalogue (id = make model):',
    list,
  ].join('\n');
}

/**
 * Reads the pixel size from a JPEG's start-of-frame header without decoding it.
 * Returns undefined for anything that is not a well-formed JPEG.
 */
export function jpegSize(bytes: Uint8Array): { width: number; height: number } | undefined {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return undefined;
  let offset = 2;
  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) return undefined;
    const marker = bytes[offset + 1];
    if (marker === 0xff) {
      offset += 1; // fill byte
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2; // markers without a length
      continue;
    }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      if (offset + 8 >= bytes.length) return undefined;
      const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
      const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
      return width > 0 && height > 0 ? { width, height } : undefined;
    }
    if (marker === 0xd9 || length < 2) return undefined;
    offset += 2 + length;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function unit(value: unknown): number {
  const number = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return Math.min(1, Math.max(0, number));
}

function year(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1885 && value <= 2100 ? value : undefined;
}

function oneOf<T extends string>(options: readonly T[], value: unknown, fallback: T): T {
  return options.find((option) => option === value) ?? fallback;
}

/** Accepts 0..1 boxes and, defensively, 0..1000 boxes (a common convention of vision models). */
export function parseBox(value: unknown): NormalizedBox | undefined {
  if (!isRecord(value)) return undefined;
  const raw = [value.x, value.y, value.width, value.height];
  if (!raw.every((part) => typeof part === 'number' && Number.isFinite(part))) return undefined;
  const numbers = raw.map((part) => (typeof part === 'number' ? part : 0));
  const scale = numbers.some((part) => part > 1.5) ? 1000 : 1;
  const [x, y, width, height] = numbers.map((part) => part / scale);
  const left = unit(x);
  const top = unit(y);
  const box = { x: left, y: top, width: Math.min(unit(width), 1 - left), height: Math.min(unit(height), 1 - top) };
  return box.width >= 0.005 && box.height >= 0.005 ? box : undefined;
}

/** Turns the model's JSON answer into a safe, typed result. Throws when the answer is unusable. */
export function parseIdentification(raw: unknown, catalogue: CatalogueEntry[]): Identification {
  if (!isRecord(raw)) throw new Error('identification is not an object');
  const make = text(raw.make, 40);
  const model = text(raw.model, 60);
  if (raw.isCar !== true || make.length === 0 || model.length === 0) return { status: 'no_car' };

  const catalogueId = text(raw.catalogueId, 80);
  const alternatives = (Array.isArray(raw.alternatives) ? raw.alternatives : [])
    .filter(isRecord)
    .map((guess) => ({ make: text(guess.make, 40), model: text(guess.model, 60), confidence: unit(guess.confidence) }))
    .filter((guess) => guess.make.length > 0 && guess.model.length > 0)
    .slice(0, 2);
  const plates = (Array.isArray(raw.plates) ? raw.plates : [])
    .map(parseBox)
    .filter((box): box is NormalizedBox => box !== undefined)
    .slice(0, 6);

  return {
    status: 'identified',
    car: {
      make,
      model,
      generation: text(raw.generation, 30),
      yearFrom: year(raw.yearFrom),
      yearTo: year(raw.yearTo),
      bodyStyle: oneOf(BODY_STYLES, raw.bodyStyle, 'other'),
      color: oneOf(CAR_COLORS, raw.color, 'other'),
      confidence: unit(raw.confidence),
      catalogueId: catalogue.some((entry) => entry.id === catalogueId) ? catalogueId : undefined,
      alternatives,
      vehicleBox: parseBox(raw.vehicleBox),
      plates,
      plateText: text(raw.plateText, 20)
        .replace(/[^a-z0-9]/gi, '')
        .toUpperCase(),
      funFact: text(raw.funFact, 160),
    },
  };
}
