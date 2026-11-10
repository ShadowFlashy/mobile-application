import type { Coordinates } from '../types/Location';

/**
 * Coarse current position of the device (native version). Not available in the native build until
 * December, so the capture flow falls back to EXIF GPS or a manual city. Coordinates never leave
 * the device: only the nearest city label is ever stored.
 */
export async function getCoarsePosition(): Promise<Coordinates | undefined> {
  return undefined;
}
