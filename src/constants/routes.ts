/**
 * All navigation targets in one place (course ch. 14: no hardcoded screen names spread over
 * the code). Dynamic routes only receive an id; screens load the data themselves.
 */
export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  spot: '/spot',
  owners: '/owners',
  profile: '/profile',
  spotDetail: (spotId: string): `/details/${string}` => `/details/${spotId}`,
  sticker: (carModelId: string): `/sticker/${string}` => `/sticker/${carModelId}`,
} as const; // const assertion: keeps the literal route strings
