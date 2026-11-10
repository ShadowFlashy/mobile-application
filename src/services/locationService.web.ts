import type { Coordinates } from '../types/Location';
import { roundCoordinate } from '../utils/geo';

/** Browser geolocation options (SPEC §10.3): coarse, a cached fix of up to 10 min is fine, 5 s budget. */
const POSITION_OPTIONS: PositionOptions = { enableHighAccuracy: false, maximumAge: 600_000, timeout: 5_000 };
/**
 * `timeout` above does not include the time the permission prompt is open. After this the spot
 * simply gets no automatic city (the user picks one), and a late answer is ignored.
 */
const PROMPT_GIVE_UP_MS = 20_000;

/**
 * Coarse current position in the browser (PWA), rounded to 2 decimals (≈1 km) before it is returned.
 * Coordinates never leave the device: the capture flow only keeps the nearest city label.
 * Resolves undefined when geolocation is unavailable, denied, times out or fails.
 */
export function getCoarsePosition(): Promise<Coordinates | undefined> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || navigator.geolocation === undefined) {
      resolve(undefined);
      return;
    }
    let settled = false;
    let giveUp: ReturnType<typeof setTimeout> | undefined;
    const finish = (value: Coordinates | undefined) => {
      if (settled) return;
      settled = true;
      if (giveUp !== undefined) clearTimeout(giveUp);
      resolve(value);
    };
    giveUp = setTimeout(() => finish(undefined), PROMPT_GIVE_UP_MS);
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          finish(roundCoordinate({ latitude: position.coords.latitude, longitude: position.coords.longitude }, 2));
        },
        () => finish(undefined),
        POSITION_OPTIONS,
      );
    } catch {
      finish(undefined);
    }
  });
}
