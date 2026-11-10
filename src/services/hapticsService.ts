import { Platform, Vibration } from 'react-native';
import { haptics } from '../theme/motion';
import type { HapticPattern } from '../types/Settings';

/**
 * Plays a LIVERY vibration pattern (SPEC §7.7) through RN `Vibration`. Native counterpart of
 * hapticsService.web.ts; `expo-haptics` replaces it in December. Callers go through useHaptics,
 * which respects the haptics setting.
 */

/**
 * The pattern in the platform's format. The tokens use the web meaning (vibrate, pause, vibrate, …);
 * Android's Vibration pattern starts with a pause, so it gets a leading 0.
 */
export function vibrationPattern(pattern: HapticPattern, os: string = Platform.OS): number | number[] {
  const value = haptics[pattern];
  if (typeof value === 'number') return value;
  return os === 'android' ? [0, ...value] : [...value];
}

/** Vibrates once; a no-op on devices without a vibration motor or when the call fails. */
export function vibrate(pattern: HapticPattern): void {
  try {
    Vibration.vibrate(vibrationPattern(pattern));
  } catch {
    // Unsupported: haptics are a nice-to-have, never an error.
  }
}
