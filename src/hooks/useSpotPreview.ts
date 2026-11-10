import { useMemo } from 'react';
import { useCollections } from './useCarModels';
import { useMySpots } from './useSpots';
import type { CarModel } from '../types/CarModel';
import { previewSpot, type PreviewForm, type SpotPreview } from '../utils/spotPreview';

/**
 * The review's "what this spot adds" preview, from the cached own spots and collections (the same
 * queries the Album uses). Undefined while the spots are not known yet, so a repeat is never shown
 * as a new sticker.
 */
export function useSpotPreview(form: PreviewForm | undefined, models: readonly CarModel[]): SpotPreview | undefined {
  const spots = useMySpots().data;
  const collections = useCollections().data;
  const carModelId = form?.carModelId;
  const make = form?.make;
  const model = form?.model;
  const paint = form?.paint;
  const bodyStyle = form?.bodyStyle;
  const city = form?.city;
  const spottedAt = form?.spottedAt;
  const hasNotes = (form?.notes.trim().length ?? 0) > 0;

  return useMemo(() => {
    if (
      spots === undefined ||
      make === undefined ||
      model === undefined ||
      paint === undefined ||
      bodyStyle === undefined ||
      city === undefined ||
      spottedAt === undefined
    ) {
      return undefined;
    }
    const preview = { carModelId, make, model, paint, bodyStyle, city, spottedAt, notes: hasNotes ? 'note' : '' };
    return previewSpot(preview, models, spots, collections ?? [], new Date());
  }, [spots, collections, models, carModelId, make, model, paint, bodyStyle, city, spottedAt, hasNotes]);
}
