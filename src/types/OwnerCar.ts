/** A car registered by its owner in the owner portal. */
export interface OwnerCar {
  id: string;
  make: string;
  model: string;
  nickname?: string;
  /** Last two characters of the plate, so the owner recognises the entry. */
  plateHint: string;
  showPlate: boolean;
  /** The plate as shown on spots, only when the owner opted in (vanity plate). */
  plateDisplay?: string;
  createdAt: string;
}

export interface NewOwnerCar {
  make: string;
  model: string;
  nickname?: string;
  plate: string;
  showPlate: boolean;
}

/** A "ping": an owner's registered car was spotted. */
export interface SpotPing {
  id: string;
  spotId: string;
  ownerCarId: string;
  carMake: string;
  carModel: string;
  carNickname?: string;
  locationLabel?: string;
  spottedAt: string;
  createdAt: string;
  isRead: boolean;
}
