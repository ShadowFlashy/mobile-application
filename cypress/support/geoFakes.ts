/** Typed fakes of the browser Geolocation objects, so tests never need a type cast. */
export function fakePosition(latitude: number, longitude: number, accuracy: number): GeolocationPosition {
  const coords: GeolocationCoordinates = {
    latitude,
    longitude,
    accuracy,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    toJSON: () => ({ latitude, longitude, accuracy }),
  };
  const timestamp = Date.now();
  return { coords, timestamp, toJSON: () => ({ coords: coords.toJSON(), timestamp }) };
}

export function fakePositionError(code: 1 | 2 | 3, message: string): GeolocationPositionError {
  return { code, message, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
}
