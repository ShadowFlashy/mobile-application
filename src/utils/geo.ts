import { NEAREST_PLACE_MAX_KM } from '../constants/ai';
import type { Coordinates, Place } from '../types/Location';

/**
 * On-device geography for the city pre-fill (SPEC D-7). Coordinates are only ever compared with
 * the bundled gazetteer here: they are never stored, sent or logged. Only a city label leaves.
 */

/** Mean Earth radius (IUGG), in km. */
const EARTH_RADIUS_KM = 6371.0088;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance between two points, in km. */
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  return rounded === 0 ? 0 : rounded; // no -0
}

/** Coarsens a position (2 decimals ≈ 1 km), so a precise GPS point never lingers in memory. */
export function roundCoordinate(coordinates: Coordinates, decimals: number = 2): Coordinates {
  return { latitude: round(coordinates.latitude, decimals), longitude: round(coordinates.longitude, decimals) };
}

/** A real position on Earth (finite, latitude ±90, longitude ±180). */
export function isValidCoordinate(coordinates: Coordinates): boolean {
  const { latitude, longitude } = coordinates;
  return (
    Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
  );
}

/** The closest place within `maxKm` (25 km by default), or undefined. */
export function nearestPlace(
  coordinates: Coordinates,
  places: readonly Place[],
  maxKm: number = NEAREST_PLACE_MAX_KM,
): Place | undefined {
  if (!isValidCoordinate(coordinates)) return undefined;
  let best: Place | undefined;
  let bestKm = Number.POSITIVE_INFINITY;
  for (const place of places) {
    const km = haversineKm(coordinates, { latitude: place.lat, longitude: place.lon });
    if (km <= maxKm && km < bestKm) {
      best = place;
      bestKm = km;
    }
  }
  return best;
}

/** The place name in the UI language (Dutch for `nl`/`nl-BE`, English otherwise). */
export function placeLabel(place: Place, language: string): string {
  return language.toLowerCase().startsWith('nl') ? place.nameNl : place.nameEn;
}
