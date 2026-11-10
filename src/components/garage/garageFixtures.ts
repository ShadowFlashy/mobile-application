import type { OwnerCar, OwnerCarStats, Sighting } from '../../types/OwnerCar';

/**
 * Example data for the Garage stories and component tests only (never imported by the app).
 * Times are relative to "now" so the stories always look current.
 */

const HOUR_MS = 60 * 60 * 1000;

function hoursAgo(hours: number): string {
  const date = new Date(Date.now() - hours * HOUR_MS);
  date.setMinutes(0, 0, 0);
  return date.toISOString();
}

export const pendingCar: OwnerCar = {
  id: 'car-pending',
  make: 'Ferrari',
  model: '308 GTSi',
  nickname: 'Magnum',
  plateHint: '08',
  visibility: 'hidden',
  pingsPaused: false,
  verification: 'pending',
  createdAt: '2026-11-09T10:00:00Z',
};

export const verifiedCar: OwnerCar = {
  id: 'car-verified',
  make: 'Porsche',
  model: '911 GT3',
  nickname: 'Demo GT3',
  plateHint: '23',
  visibility: 'vanity',
  plateDisplay: 'DEMO-123',
  shoutout: 'Thanks for the spot! Say hi at Spa.',
  pingsPaused: false,
  verification: 'verified',
  verifiedAt: '2026-11-01T10:00:00Z',
  carModelId: 'porsche-911-gt3',
  createdAt: '2026-11-01T09:00:00Z',
};

export const pausedCar: OwnerCar = {
  ...verifiedCar,
  id: 'car-paused',
  make: 'Lamborghini',
  model: 'Huracán',
  nickname: undefined,
  visibility: 'badge',
  plateDisplay: undefined,
  pingsPaused: true,
};

export const verifiedStats: OwnerCarStats = {
  ownerCarId: verifiedCar.id,
  sightings: 7,
  unread: 2,
  lastCity: 'Antwerpen',
  lastSeen: hoursAgo(2),
};

export const unreadSighting: Sighting = {
  id: 'sighting-unread',
  ownerCarId: verifiedCar.id,
  carLabel: 'Demo GT3',
  city: 'Antwerpen',
  spottedHour: hoursAgo(2),
  createdAt: hoursAgo(1),
  isRead: false,
};

export const readSighting: Sighting = {
  id: 'sighting-read',
  ownerCarId: verifiedCar.id,
  carLabel: 'Demo GT3',
  city: 'Leuven',
  spottedHour: hoursAgo(30),
  spotterName: 'spotter_jas',
  createdAt: hoursAgo(29),
  isRead: true,
};

export const anonymousSighting: Sighting = {
  id: 'sighting-anonymous',
  ownerCarId: verifiedCar.id,
  carLabel: 'Porsche 911 GT3',
  spottedHour: hoursAgo(80),
  createdAt: hoursAgo(79),
  isRead: true,
};
