import type { AlbumPageId } from '../types/Progress';

/**
 * All navigation targets in one place (course ch. 14: no hardcoded screen names spread over
 * the code). Dynamic routes only receive an id; screens load the data themselves.
 */
export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  privacy: '/privacy',
  onboarding: '/onboarding',
  spot: '/spot',
  progress: '/progress',
  owners: '/owners',
  profile: '/profile',
  trust: '/trust',
  capture: '/capture',
  garageNew: '/garage/new',
  albumPage: (page: AlbumPageId): `/album/${string}` => `/album/${page}`,
  /** Appendix E: a themed collection page (W5 reuses AlbumPage). */
  albumCollection: (collectionId: string): `/album/collection/${string}` => `/album/collection/${collectionId}`,
  spotDetail: (spotId: string): `/details/${string}` => `/details/${spotId}`,
  sticker: (carModelId: string): `/sticker/${string}` => `/sticker/${carModelId}`,
  reveal: (spotId: string): `/reveal/${string}` => `/reveal/${spotId}`,
  garageCar: (carId: string): `/garage/${string}` => `/garage/${carId}`,
  garageVerify: (carId: string): `/garage/${string}/verify` => `/garage/${carId}/verify`,
  sighting: (id: string): `/sighting/${string}` => `/sighting/${id}`,
} as const; // const assertion: keeps the literal route strings
