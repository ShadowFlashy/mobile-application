/**
 * One place for every TanStack Query cache key, so queries and mutations always agree.
 * `as const` is a const assertion (not a type cast): it keeps the keys as readonly tuples.
 */
export const queryKeys = {
  carModels: () => ['car-models'] as const,
  /** Appendix E: the themed collections with their member ids. */
  collections: () => ['collections'] as const,
  mySpots: (userId?: string) => ['spots', userId] as const,
  spot: (spotId?: string) => ['spot', spotId] as const,
  spotShowcase: (spotId?: string) => ['spot-showcase', spotId] as const,
  ownerCars: (userId?: string) => ['owner-cars', userId] as const,
  ownerCarStats: (userId?: string) => ['owner-car-stats', userId] as const,
  pings: (userId?: string) => ['pings', userId] as const, // sightings list (name kept)
  sighting: (id?: string) => ['sighting', id] as const,
  identifyQuota: (userId?: string) => ['identify-quota', userId] as const,
};
