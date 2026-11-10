import { create } from 'zustand';
import type { CaptureDraft, CaptureSource } from '../types/Capture';
import type { PickedPhoto } from '../types/Spot';
import { captureReducer, createDraft, type CaptureEvent } from '../utils/captureMachine';

interface StartOptions {
  shareNameDefault?: boolean;
  now?: Date;
}

interface CaptureState {
  /** The photo being reviewed. Memory only: never persisted (it holds the raw photo and the plate). */
  draft?: CaptureDraft;
  /** Starts a new draft for a just-picked photo and returns its id. */
  start: (photo: PickedPhoto, source: CaptureSource, options?: StartOptions) => string;
  /** Applies one capture event (captureMachine) to the current draft. */
  dispatch: (event: CaptureEvent) => void;
  /** Like `dispatch`, but only when `draftId` is still the current draft (background results). */
  dispatchFor: (draftId: string, event: CaptureEvent) => void;
  reset: () => void;
}

let draftCounter = 0;

/** Client state of the New spot capture flow (SPEC §10.5). Zustand without persistence on purpose. */
export const useCaptureStore = create<CaptureState>((set, get) => ({
  draft: undefined,
  start: (photo, source, { shareNameDefault = false, now = new Date() } = {}) => {
    draftCounter += 1;
    const id = `capture-${now.getTime()}-${draftCounter}`;
    set({ draft: createDraft({ id, photo, source, now: now.toISOString(), shareNameDefault }) });
    return id;
  },
  dispatch: (event) => {
    const { draft } = get();
    if (draft !== undefined) set({ draft: captureReducer(draft, event) });
  },
  dispatchFor: (draftId, event) => {
    const { draft } = get();
    if (draft !== undefined && draft.id === draftId) set({ draft: captureReducer(draft, event) });
  },
  reset: () => set({ draft: undefined }),
}));
