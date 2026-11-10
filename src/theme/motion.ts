import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Easing, Platform, type EasingFunction } from 'react-native';
import type { HapticPattern } from '../types/Settings';

/**
 * LIVERY motion (SPEC §7.6). Only `transform` and `opacity` are animated, blinks stay at ≤ 3 Hz
 * (WCAG 2.3.1), and with reduced motion every duration is 0 and loops stop.
 */
export const durations = {
  instant: 90,
  fast: 120,
  base: 200,
  slow: 320,
  stamp: 260,
  stick: 380,
  flip: 520,
  odometer: 900,
  sheen: 1100,
  scanLoop: 1200,
} as const;

export type DurationToken = keyof typeof durations;

export const easings: Record<'standard' | 'decelerate' | 'launch' | 'brake', EasingFunction> = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  decelerate: Easing.bezier(0, 0, 0, 1),
  launch: Easing.bezier(0.7, 0, 0.2, 1),
  brake: Easing.bezier(0.4, 0, 1, 1),
};

/** Animated.spring configs. */
export const springs = {
  stamp: { friction: 5, tension: 160 },
  stick: { friction: 7, tension: 120 },
  press: { friction: 6, tension: 200 },
} as const;

/** Vibration patterns in ms (SPEC §7.7), played through hapticsService / useHaptics. */
export const haptics: Record<HapticPattern, number | readonly number[]> = {
  tap: 10,
  tear: 15,
  stamp: [10, 40, 10],
  shiftUp: [30, 60, 30, 60, 60],
  stick: 20,
  error: [40, 60, 40],
};

/** Duration of a token in ms; 0 when the user asked for reduced motion. Pure, so it is unit-tested. */
export function resolveDuration(token: DurationToken, reduced: boolean): number {
  return reduced ? 0 : durations[token];
}

/** True when the OS (or, on the web, `prefers-reduced-motion`) asks for reduced motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduced(value);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => setReduced(value));
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}

export interface Motion {
  reduced: boolean;
  duration: (token: DurationToken) => number;
  /** The native driver is not available on the web. */
  nativeDriver: boolean;
}

/** Motion helpers for components: durations that collapse to 0 with reduced motion. */
export function useMotion(): Motion {
  const reduced = useReducedMotion();
  return useMemo(
    () => ({
      reduced,
      duration: (token: DurationToken) => resolveDuration(token, reduced),
      nativeDriver: Platform.OS !== 'web',
    }),
    [reduced],
  );
}
