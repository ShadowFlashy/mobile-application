import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NEAREST_PLACE_MAX_KM } from '../constants/ai';
import { PLACES } from '../constants/places';
import { getCoarsePosition } from '../services/locationService';
import { useSettingsStore } from '../state/useSettingsStore';
import type { Coordinates, PlaceSuggestion } from '../types/Location';
import { nearestPlace, placeLabel, roundCoordinate } from '../utils/geo';

export interface AutoLocationInput {
  /** GPS read from the photo's EXIF on the device (then discarded). */
  exifGps?: Coordinates;
  /** True for a camera capture or a photo taken less than an hour ago. */
  isFresh: boolean;
}

export interface UseAutoLocation {
  suggest: (input: AutoLocationInput) => Promise<PlaceSuggestion | undefined>;
}

/** The stored auto-city switch, read at call time. */
async function isAutoLocationEnabled(): Promise<boolean> {
  await useSettingsStore.getState().load();
  return useSettingsStore.getState().autoLocation;
}

/**
 * Suggests the city of a spot, resolved on the device against the bundled gazetteer (SPEC P0-02, D-7):
 * 1. the photo's EXIF GPS; when the photo has GPS, it alone decides (an old photo's place is not here);
 * 2. otherwise, only for a fresh photo, the coarse current position (asks for permission);
 * 3. otherwise nothing, and the user picks the city.
 * Coordinates are rounded to 2 decimals first and are dropped right after the lookup: only the
 * place (and its label in the UI language) is returned. With auto-city off, nothing is read at all.
 */
export function useAutoLocation(): UseAutoLocation {
  const { i18n } = useTranslation();
  const language = i18n.language;

  const suggest = useCallback(
    async ({ exifGps, isFresh }: AutoLocationInput): Promise<PlaceSuggestion | undefined> => {
      try {
        if (!(await isAutoLocationEnabled())) return undefined;
        const source: PlaceSuggestion['source'] = exifGps !== undefined ? 'exif' : 'device';
        const position = exifGps ?? (isFresh ? await getCoarsePosition() : undefined);
        if (position === undefined) return undefined;
        const place = nearestPlace(roundCoordinate(position, 2), PLACES, NEAREST_PLACE_MAX_KM);
        return place === undefined ? undefined : { place, label: placeLabel(place, language), source };
      } catch {
        return undefined;
      }
    },
    [language],
  );

  return { suggest };
}
