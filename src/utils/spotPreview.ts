import type { CaptureForm } from '../types/Capture';
import type { CarModel } from '../types/CarModel';
import type { Collection } from '../types/Collection';
import type { RevealKind, WeeklyChallenge } from '../types/Progress';
import type { Spot } from '../types/Spot';
import { hasCar } from './captureForm';
import { deriveProgress, revealFor } from './progression';

/** Id of the not-yet-saved spot in the preview replay. */
const PREVIEW_SPOT_ID = 'capture-preview';

export type PreviewForm = Pick<
  CaptureForm,
  'carModelId' | 'make' | 'model' | 'paint' | 'bodyStyle' | 'city' | 'spottedAt' | 'notes'
>;

/** What saving this spot would add to the album, shown in the "Car" section before saving. */
export interface SpotPreview {
  /** new sticker, a new paint for a known sticker, a repeat, or a wildcard. */
  kind: RevealKind;
  /** Spots of this model including this one. */
  count: number;
  /** Collections this model belongs to. */
  setIds: string[];
  /** This week's challenges this spot would complete. */
  challenges: WeeklyChallenge[];
  /** All XP this spot would earn. */
  xpGained: number;
}

/**
 * Replays the user's own spots plus this draft through the same progression rules as the reveal
 * (deriveProgress + revealFor, all on the device), so the review can say "#31 New sticker" and
 * "Completes Spot 1 car in orange" before anything is saved. Pure: no network, no storage.
 */
export function previewSpot(
  form: PreviewForm,
  models: readonly CarModel[],
  spots: readonly Spot[],
  collections: readonly Collection[],
  now: Date,
): SpotPreview | undefined {
  if (!hasCar(form)) return undefined;
  const createdAt = now.toISOString();
  const draft: Spot = {
    id: PREVIEW_SPOT_ID,
    userId: '',
    carModelId: form.carModelId,
    make: form.make,
    model: form.model,
    photoPath: '',
    city: form.city.length > 0 ? form.city : undefined,
    notes: form.notes.trim().length > 0 ? form.notes : undefined,
    spottedAt: form.spottedAt,
    createdAt,
    paint: form.paint,
    bodyStyle: form.bodyStyle,
    platesHidden: 0,
    identifiedBy: 'manual',
    shareNameWithOwner: false,
  };
  const all = [...spots, draft];
  const snapshot = deriveProgress(all, models, now, undefined, collections);
  const reveal = revealFor(snapshot, all, models, PREVIEW_SPOT_ID, collections);
  if (reveal === undefined) return undefined;
  return {
    kind: reveal.kind,
    count: reveal.count,
    setIds: reveal.sets.map((set) => set.collectionId),
    challenges: reveal.challengesCompleted,
    xpGained: reveal.xpGained,
  };
}
