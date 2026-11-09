import i18n from '../i18n';
import type en from '../i18n/locales/en.json';

export type ErrorKey = keyof (typeof en)['errors'];

/** Error with a translated message that is safe and friendly to show in the UI. */
export class ServiceError extends Error {
  readonly key: ErrorKey;

  constructor(key: ErrorKey) {
    super(i18n.t(`errors.${key}`));
    this.name = 'ServiceError';
    this.key = key;
  }
}

function readField(error: unknown, field: 'message' | 'code'): string | undefined {
  if (typeof error !== 'object' || error === null || !(field in error)) return undefined;
  const value: unknown = Reflect.get(error, field);
  return typeof value === 'string' ? value : undefined;
}

/** Messages raised by the database triggers (see supabase/migrations), mapped to translations. */
const DATABASE_MESSAGES: { pattern: RegExp; key: ErrorKey }[] = [
  { pattern: /needs 2 to 12 letters or digits/i, key: 'plate_invalid' },
  { pattern: /plate is required/i, key: 'plate_required' },
  { pattern: /re-enter your licence plate/i, key: 'plate_reenter' },
];

/** Converts Supabase / network errors into a ServiceError with a user friendly message. */
export function toServiceError(error: unknown, fallback: ErrorKey): ServiceError {
  if (error instanceof ServiceError) return error;
  const message = readField(error, 'message') ?? '';
  const code = readField(error, 'code');

  if (/failed to fetch|network request failed|networkerror|load failed/i.test(message)) {
    return new ServiceError('network');
  }
  if (code === '23505') return new ServiceError('plate_taken');
  const known = DATABASE_MESSAGES.find((entry) => entry.pattern.test(message));
  if (known !== undefined) return new ServiceError(known.key);
  return new ServiceError(fallback);
}

/** Message to show for any caught error (never logs or exposes technical details). */
export function getErrorMessage(error: unknown, fallback: ErrorKey = 'generic'): string {
  return toServiceError(error, fallback).message;
}
