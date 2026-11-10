import { haptics } from '../theme/motion';
import type { HapticPattern } from '../types/Settings';

/**
 * Web haptics (PWA): `navigator.vibrate`, which Android Chrome supports and iOS Safari ignores.
 * Browsers only vibrate after a user gesture, so without one (e.g. a deep link that nobody tapped
 * yet) the call is skipped instead of being blocked with a console warning.
 */

/** The pattern as navigator.vibrate expects it (the tokens already use the web meaning). */
export function vibrationPattern(pattern: HapticPattern): number | number[] {
  const value = haptics[pattern];
  return typeof value === 'number' ? value : [...value];
}

/** True when the page has had a user gesture (or the browser does not report it). */
function hasUserActivation(): boolean {
  if (!('userActivation' in navigator)) return true;
  return navigator.userActivation.hasBeenActive;
}

/** Vibrates once; a no-op when unsupported, before the first user gesture, or when the call fails. */
export function vibrate(pattern: HapticPattern): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  if (!hasUserActivation()) return;
  try {
    navigator.vibrate(vibrationPattern(pattern));
  } catch {
    // Unsupported: haptics are a nice-to-have, never an error.
  }
}
