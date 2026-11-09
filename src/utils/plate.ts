/**
 * Licence plate helpers. The same normalisation runs on the server (see the migration),
 * so "1-abc-234", "1 ABC 234" and "1abc234" all match the same registration.
 */
export function normalizePlate(input: string): string {
  return input.replace(/[^a-z0-9]/gi, '').toUpperCase();
}

export function isValidPlate(input: string): boolean {
  const normalized = normalizePlate(input);
  return normalized.length >= 2 && normalized.length <= 12;
}

/** Masks all but the last two characters, e.g. "••••34". */
export function maskPlateHint(hint: string): string {
  return `••••${hint}`;
}
