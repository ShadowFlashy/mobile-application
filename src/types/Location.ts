export interface Coordinates {
  latitude: number;
  longitude: number;
}
export interface Place {
  id: string;
  nameEn: string;
  nameNl: string;
  /** ISO alpha-2 */ country: string;
  lat: number;
  lon: number;
}
export interface PlaceSuggestion {
  place: Place;
  label: string;
  source: 'exif' | 'device';
}
