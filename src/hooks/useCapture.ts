import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AI_CONSENT_VERSION, PREVIEW_DEBOUNCE_MS, PREVIEW_MAX_SIDE, UPLOAD_MAX_SIDE } from '../constants/ai';
import { queryKeys } from '../constants/queryKeys';
import { DAY } from '../constants/time';
import { pickCarPhoto, type PhotoSource } from '../services/cameraService';
import { getCarModels } from '../services/carModelService';
import { getErrorMessage } from '../services/serviceError';
import { useAuthStore } from '../state/useAuthStore';
import { useCaptureStore } from '../state/useCaptureStore';
import { useSettingsStore } from '../state/useSettingsStore';
import { useToastStore } from '../state/useToastStore';
import type { CaptureDraft, CaptureForm, PlateGate } from '../types/Capture';
import type { CarModel } from '../types/CarModel';
import type { ConfidenceTier, IdentifyOutcome } from '../types/Identification';
import type { PickedPhoto, PlateRegion, Spot } from '../types/Spot';
import { prepareAiImage, readPhotoBytes } from '../utils/aiImage';
import { buildNewSpot, candidatesFor, isFreshPhoto, type CarCandidate } from '../utils/captureForm';
import { isAnalysing, type CaptureEvent } from '../utils/captureMachine';
import { readExif } from '../utils/exif';
import { confidenceTier } from '../utils/identification';
import { redactPhoto } from '../utils/imageRedaction';
import { findDuplicate } from '../utils/photoHash';
import { canCollect, ignoredSuggestions, needsSecondTap } from '../utils/plateGate';
import { useAutoLocation } from './useAutoLocation';
import { useCarModels } from './useCarModels';
import { useHaptics } from './useHaptics';
import { useIdentifyCar } from './useIdentifyCar';
import { useNetworkStatus } from './useNetworkStatus';
import { useCreateSpot } from './useSpots';

const NO_MODELS: CarModel[] = [];
const NO_REGIONS: PlateRegion[] = [];
const BUSY_GATE: PlateGate = { ok: false, reason: 'busy' };

export interface UseCaptureOptions {
  /** Render the live redacted preview (only the review screen needs it). */
  withPreview?: boolean;
}

export interface UseCapture {
  draft?: CaptureDraft;
  models: CarModel[];
  gate: PlateGate;
  isOnline: boolean;
  /** Co-Driver may still fill in fields (shows the analysing chip and shimmers). */
  isAnalysing: boolean;
  tier?: ConfidenceTier;
  /** "Is it one of these?" chips in the guess tier. */
  candidates: CarCandidate[];
  /** The redacted preview (≤960 px), exactly the pixels that will be uploaded. */
  previewUri?: string;
  duplicateSpot?: Spot;
  /** True while "No licence plate is visible" needs its second tap. */
  needsSecondTap: boolean;
  ignoredSuggestionCount: number;
  isPicking: boolean;
  pickError?: string;
  /** Opens the camera or gallery and starts a draft. Resolves true when a photo was picked. */
  pick: (source: PhotoSource) => Promise<boolean>;
  dispatch: (event: CaptureEvent) => void;
  /** First-use consent: "Use Co-Driver". */
  acceptConsent: () => void;
  /** First-use consent: "Fill in myself" (switches Co-Driver off). */
  declineConsent: () => void;
  /** Ignores any later Co-Driver answer for this photo. */
  fillManually: () => void;
  /** Redacts, uploads and saves the spot. Resolves the new spot id, or undefined on failure. */
  collect: () => Promise<string | undefined>;
  /** Owner-ping row changes: a plate edit flips its provenance to YOU, the switches do not. */
  setOwnerPing: (patch: Partial<Pick<CaptureForm, 'plate' | 'notifyOwner' | 'shareNameWithOwner'>>) => void;
  /** Drops the draft (the photo and plate text leave memory). */
  discard: () => void;
}

/** The redacted preview, re-rendered 150 ms after the last region change (SPEC P0-04, WYSIWYG). */
function useRedactedPreview(photo: PickedPhoto | undefined, regions: PlateRegion[], enabled: boolean) {
  const [previewUri, setPreviewUri] = useState<string>();
  useEffect(() => {
    if (!enabled || photo === undefined) {
      setPreviewUri(undefined);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      redactPhoto(photo, regions, PREVIEW_MAX_SIDE)
        .then((redacted) => {
          if (!cancelled) setPreviewUri(redacted.uri);
        })
        .catch(() => {
          // No preview (e.g. native until December): the editor keeps showing the boxes.
          if (!cancelled) setPreviewUri(undefined);
        });
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [photo, regions, enabled]);
  return previewUri;
}

/**
 * The Pit Stop view-model (SPEC §6.1, W4 task 5). It orchestrates the background work after a photo
 * is picked (EXIF date and GPS on the device, the 768 px AI image, the city from the gazetteer, the
 * first-use consent and Co-Driver), the plate gate, and COLLECT: redact at 1600 px, upload, insert.
 * The screens only render what this returns and navigate.
 */
export function useCapture({ withPreview = false }: UseCaptureOptions = {}): UseCapture {
  const draft = useCaptureStore((state) => state.draft);
  const dispatch = useCaptureStore((state) => state.dispatch);
  const userId = useAuthStore((state) => state.user?.id);
  const models = useCarModels().data ?? NO_MODELS;
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();
  const { identify } = useIdentifyCar();
  const { suggest } = useAutoLocation();
  const createSpot = useCreateSpot();
  const { play } = useHaptics();
  const showToast = useToastStore((state) => state.show);
  const [isPicking, setIsPicking] = useState(false);
  const [pickError, setPickError] = useState<string>();

  // The background pipeline outlives renders: it reads the latest helpers through refs.
  const helpers = useRef({ identify, suggest });
  helpers.current = { identify, suggest };

  const ensureModels = useCallback(
    () => queryClient.ensureQueryData({ queryKey: queryKeys.carModels(), queryFn: getCarModels, staleTime: DAY }),
    [queryClient],
  );

  const finishIdentify = useCallback(
    async (draftId: string, outcome: IdentifyOutcome) => {
      const catalogue = await ensureModels().catch(() => NO_MODELS);
      useCaptureStore.getState().dispatchFor(draftId, { type: 'identify_finished', outcome, models: catalogue });
    },
    [ensureModels],
  );

  const identifyNow = useCallback(
    async (draftId: string) => {
      const current = useCaptureStore.getState().draft;
      if (current === undefined || current.id !== draftId || !isAnalysing(current)) return;
      if (current.aiImage === undefined) {
        await finishIdentify(draftId, { status: 'unavailable', reason: 'unsupported' });
        return;
      }
      useCaptureStore.getState().dispatchFor(draftId, { type: 'identify_started' });
      const outcome = await helpers.current.identify(current.aiImage);
      await finishIdentify(draftId, outcome);
    },
    [finishIdentify],
  );

  const runPipeline = useCallback(
    async (draftId: string, photo: PickedPhoto, source: PhotoSource) => {
      const send = (event: CaptureEvent) => useCaptureStore.getState().dispatchFor(draftId, event);

      // a. EXIF, read on the device. The GPS position is only used for the city and then dropped.
      const exif = readExif(await readPhotoBytes(photo.uri));
      send({ type: 'exif_read', exif: { takenAt: exif.takenAt } });

      // c. The city from the bundled gazetteer (not awaited: it may wait for a permission prompt).
      void helpers.current
        .suggest({ exifGps: exif.gps, isFresh: isFreshPhoto(source, exif.takenAt, new Date()) })
        .then((place) => {
          if (place !== undefined) send({ type: 'place_found', place });
        });

      // b. The EXIF-free ≤768 px image for Co-Driver, and its dHash for the duplicate guard.
      const aiImage = await prepareAiImage(photo);
      if (aiImage !== undefined) {
        send({ type: 'ai_image_ready', aiImage });
        const spots = queryClient.getQueryData<Spot[]>(queryKeys.mySpots(userId)) ?? [];
        const duplicate = findDuplicate(spots, aiImage.dHash);
        if (duplicate !== undefined) send({ type: 'duplicate_found', spotId: duplicate.id });
      }

      // d. Co-Driver: off → no call at all; first use → ask for consent first.
      const settings = useSettingsStore.getState();
      await settings.load();
      const { aiEnabled, aiConsentVersion } = useSettingsStore.getState();
      if (!aiEnabled) {
        await finishIdentify(draftId, { status: 'unavailable', reason: 'disabled' });
        return;
      }
      if (aiImage === undefined) {
        await finishIdentify(draftId, { status: 'unavailable', reason: 'unsupported' });
        return;
      }
      if (aiConsentVersion < AI_CONSENT_VERSION) {
        send({ type: 'consent_required' });
        return;
      }
      // e. Identify in the background; the user is busy with the plates meanwhile (D-15).
      await identifyNow(draftId);
    },
    [finishIdentify, identifyNow, queryClient, userId],
  );

  const pick = useCallback(
    async (source: PhotoSource): Promise<boolean> => {
      setPickError(undefined);
      setIsPicking(true);
      try {
        const photo = await pickCarPhoto(source);
        if (photo === undefined) return false;
        const { shareNameDefault } = useSettingsStore.getState();
        const draftId = useCaptureStore.getState().start(photo, source, { shareNameDefault });
        void runPipeline(draftId, photo, source).catch(() =>
          finishIdentify(draftId, { status: 'unavailable', reason: 'error' }),
        );
        return true;
      } catch (error) {
        setPickError(getErrorMessage(error, 'prepare_photo'));
        return false;
      } finally {
        setIsPicking(false);
      }
    },
    [finishIdentify, runPipeline],
  );

  const acceptConsent = useCallback(() => {
    const current = useCaptureStore.getState().draft;
    useSettingsStore.getState().update({ aiConsentVersion: AI_CONSENT_VERSION });
    if (current !== undefined) void identifyNow(current.id);
  }, [identifyNow]);

  const declineConsent = useCallback(() => {
    const current = useCaptureStore.getState().draft;
    useSettingsStore.getState().update({ aiEnabled: false });
    if (current !== undefined) void finishIdentify(current.id, { status: 'unavailable', reason: 'disabled' });
  }, [finishIdentify]);

  const fillManually = useCallback(() => dispatch({ type: 'fill_manually' }), [dispatch]);

  const collect = useCallback(async (): Promise<string | undefined> => {
    const current = useCaptureStore.getState().draft;
    if (current === undefined || !canCollect({ draft: current, isOnline }).ok) return undefined;
    const draftId = current.id;
    useCaptureStore.getState().dispatchFor(draftId, { type: 'collect_started' });
    try {
      // Redacted again at upload size from the original: the preview is never what gets uploaded.
      const redacted = await redactPhoto(current.photo, current.regions, UPLOAD_MAX_SIDE);
      const catalogue = await ensureModels();
      const spot = await createSpot.mutateAsync(buildNewSpot(current, redacted, catalogue));
      useCaptureStore.getState().dispatchFor(draftId, { type: 'collected' });
      return spot.id;
    } catch (error) {
      const message = getErrorMessage(error, 'save_spot');
      useCaptureStore.getState().dispatchFor(draftId, { type: 'collect_failed', message });
      showToast(message, 'error');
      play('error');
      return undefined;
    }
  }, [createSpot, ensureModels, isOnline, play, showToast]);

  const discard = useCallback(() => useCaptureStore.getState().reset(), []);

  const setOwnerPing = useCallback<UseCapture['setOwnerPing']>(
    ({ plate, notifyOwner, shareNameWithOwner }) => {
      if (plate !== undefined) {
        dispatch({
          type: 'edit',
          field: 'plate',
          patch: notifyOwner !== undefined ? { plate, notifyOwner } : { plate },
        });
      } else {
        const options: Partial<Pick<CaptureForm, 'notifyOwner' | 'shareNameWithOwner'>> = {};
        if (notifyOwner !== undefined) options.notifyOwner = notifyOwner;
        if (shareNameWithOwner !== undefined) options.shareNameWithOwner = shareNameWithOwner;
        dispatch({ type: 'set_options', patch: options });
      }
    },
    [dispatch],
  );

  const previewUri = useRedactedPreview(draft?.photo, draft?.regions ?? NO_REGIONS, withPreview);

  const derived = useMemo(() => {
    if (draft === undefined) {
      return {
        gate: BUSY_GATE,
        tier: undefined,
        candidates: [],
        duplicateSpot: undefined,
        secondTap: false,
        ignored: 0,
      };
    }
    const outcome = draft.outcome?.status === 'identified' ? draft.outcome : undefined;
    const spots = queryClient.getQueryData<Spot[]>(queryKeys.mySpots(userId)) ?? [];
    return {
      gate: canCollect({ draft, isOnline }),
      tier: outcome !== undefined ? confidenceTier(outcome.car.confidence) : undefined,
      candidates: outcome !== undefined ? candidatesFor(outcome.car, models) : [],
      duplicateSpot:
        draft.duplicateOfId !== undefined && !draft.duplicateDismissed
          ? spots.find((spot) => spot.id === draft.duplicateOfId)
          : undefined,
      secondTap: needsSecondTap(draft),
      ignored: ignoredSuggestions(draft).length,
    };
  }, [draft, isOnline, models, queryClient, userId]);

  return {
    draft,
    models,
    gate: derived.gate,
    isOnline,
    isAnalysing: draft !== undefined && isAnalysing(draft),
    tier: derived.tier,
    candidates: derived.candidates,
    previewUri,
    duplicateSpot: derived.duplicateSpot,
    needsSecondTap: derived.secondTap,
    ignoredSuggestionCount: derived.ignored,
    isPicking,
    pickError,
    pick,
    dispatch,
    acceptConsent,
    declineConsent,
    fillManually,
    collect,
    setOwnerPing,
    discard,
  };
}
