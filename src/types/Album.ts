import type { CarModel } from './CarModel';
import type { AlbumPageId } from './Progress';
import type { Spot } from './Spot';
export interface AlbumSlotData {
  model: CarModel;
  spots: Spot[];
  isCollected: boolean;
  /** first spot by createdAt */ cover?: Spot;
}
export interface AlbumPageData {
  id: AlbumPageId;
  number: number;
  slots: AlbumSlotData[];
  wildcards: Spot[];
  collected: number;
  total: number;
  isComplete: boolean;
}
export interface AlbumCoverData {
  collected: number;
  total: number;
  ratio: number;
  latest: Spot[];
}
