import { useCallback, useState } from 'react';
import { pickCarPhoto, type PhotoSource } from '../services/cameraService';
import { getErrorMessage } from '../services/serviceError';
import type { CarModel } from '../types/CarModel';
import type { PickedPhoto, PlateRegion, RedactedPhoto, Spot } from '../types/Spot';
import { redactPhoto } from '../utils/imageRedaction';
import { hasErrors, validateSpotDetails, type FormErrors, type SpotDetailsInput } from '../utils/validation';
import { useCreateSpot, useMySpots } from './useSpots';

/** Step-by-step process (course ch. 3, progressive disclosure): photo → hide plates → details. */
export type WizardStep = 'photo' | 'privacy' | 'details';

export interface SpotDetailsForm extends SpotDetailsInput {
  carModelId?: string;
}

const EMPTY_FORM: SpotDetailsForm = { make: '', model: '', locationLabel: '', notes: '', plate: '' };

export interface SaveResult {
  spot: Spot;
  /** True when this spot filled an empty sticker slot. */
  isNewSticker: boolean;
}

/** Business logic of the "Spot a car" flow; the screen only renders what this hook returns. */
export function useSpotWizard() {
  const { data: spots } = useMySpots();
  const createSpot = useCreateSpot();

  const [step, setStep] = useState<WizardStep>('photo');
  const [photo, setPhoto] = useState<PickedPhoto>();
  const [regions, setRegions] = useState<PlateRegion[]>([]);
  const [noPlateVisible, setNoPlateVisible] = useState(false);
  const [redactedPhoto, setRedactedPhoto] = useState<RedactedPhoto>();
  const [form, setForm] = useState<SpotDetailsForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors<keyof SpotDetailsInput>>({});
  const [isWorking, setIsWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const reset = useCallback(() => {
    setStep('photo');
    setPhoto(undefined);
    setRegions([]);
    setNoPlateVisible(false);
    setRedactedPhoto(undefined);
    setForm(EMPTY_FORM);
    setErrors({});
    setErrorMessage(undefined);
  }, []);

  const pickPhoto = useCallback(async (source: PhotoSource) => {
    setErrorMessage(undefined);
    setIsWorking(true);
    try {
      const picked = await pickCarPhoto(source);
      if (picked === undefined) return;
      setPhoto(picked);
      setRegions([]);
      setNoPlateVisible(false);
      setRedactedPhoto(undefined);
      setStep('privacy');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }, []);

  const addRegion = useCallback((region: PlateRegion) => {
    setRegions((current) => [...current, region]);
    setNoPlateVisible(false);
  }, []);

  const undoRegion = useCallback(() => setRegions((current) => current.slice(0, -1)), []);
  const clearRegions = useCallback(() => setRegions([]), []);

  const canConfirmPrivacy = regions.length > 0 || noPlateVisible;

  /** Pixelates the marked plates on the device, before anything is uploaded. */
  const confirmPrivacy = useCallback(async () => {
    if (photo === undefined || !canConfirmPrivacy) return;
    setErrorMessage(undefined);
    setIsWorking(true);
    try {
      setRedactedPhoto(await redactPhoto(photo, regions));
      setStep('details');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'redaction_failed'));
    } finally {
      setIsWorking(false);
    }
  }, [photo, regions, canConfirmPrivacy]);

  const selectModel = useCallback((model?: CarModel) => {
    setForm((current) => ({
      ...current,
      carModelId: model?.id,
      make: model?.make ?? '',
      model: model?.model ?? '',
    }));
    setErrors((current) => ({ ...current, make: undefined, model: undefined }));
  }, []);

  const updateField = useCallback((field: keyof SpotDetailsInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }, []);

  const goBack = useCallback(() => {
    setErrorMessage(undefined);
    if (step === 'details') setStep('privacy');
    else if (step === 'privacy') reset();
  }, [step, reset]);

  const save = useCallback(async (): Promise<SaveResult | undefined> => {
    if (redactedPhoto === undefined) return undefined;
    const validation = validateSpotDetails(form);
    setErrors(validation);
    if (hasErrors(validation)) return undefined;

    setErrorMessage(undefined);
    try {
      const isNewSticker =
        form.carModelId !== undefined && !(spots ?? []).some((spot) => spot.carModelId === form.carModelId);
      const spot = await createSpot.mutateAsync({
        photo: redactedPhoto,
        carModelId: form.carModelId,
        make: form.make,
        model: form.model,
        locationLabel: form.locationLabel,
        notes: form.notes,
        plate: form.plate.trim().length > 0 ? form.plate : undefined,
      });
      reset();
      return { spot, isNewSticker };
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'save_spot'));
      return undefined;
    }
  }, [redactedPhoto, form, spots, createSpot, reset]);

  return {
    step,
    photo,
    regions,
    noPlateVisible,
    redactedPhoto,
    form,
    errors,
    isBusy: isWorking || createSpot.isPending,
    errorMessage,
    canConfirmPrivacy,
    pickPhoto,
    addRegion,
    undoRegion,
    clearRegions,
    setNoPlateVisible,
    confirmPrivacy,
    selectModel,
    updateField,
    goBack,
    save,
    reset,
  };
}
