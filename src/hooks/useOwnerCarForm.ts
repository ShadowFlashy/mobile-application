import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../services/serviceError';
import { useToastStore } from '../state/useToastStore';
import type { CarModel } from '../types/CarModel';
import type { OwnerCar, OwnerCarChanges, OwnerCarStats, OwnerVisibility } from '../types/OwnerCar';
import { isValidPlate } from '../utils/plate';
import { hasErrors, validateOwnerCar, type FormErrors, type OwnerCarInput } from '../utils/validation';
import {
  MAX_OWNER_CARS,
  statsForCar,
  useDeleteOwnerCar,
  useOwnerCar,
  useOwnerCars,
  useOwnerCarStats,
  useRegisterOwnerCar,
  useUpdateOwnerCar,
} from './useOwnerCars';

/** A shout-out on spots of the car is at most 80 characters (database check). */
export const SHOUTOUT_MAX_LENGTH = 80;

const EMPTY_VALUES: OwnerCarInput = { make: '', model: '', nickname: '', plate: '' };

function shoutoutTooLong(value: string): boolean {
  return value.trim().length > SHOUTOUT_MAX_LENGTH;
}

/** The "Add a car" form (/garage/new). */
export interface RegisterCarForm {
  values: OwnerCarInput;
  /** The catalogue model the car is matched to, if any. */
  carModel?: CarModel;
  /** "Not in the sticker book": make and model are typed by hand. */
  isOtherModel: boolean;
  visibility: OwnerVisibility;
  shoutout: string;
  /** Field -> key of its validation message (validation.*). */
  errors: FormErrors<keyof OwnerCarInput>;
  /** Translated message when the shout-out is too long. */
  shoutoutError?: string;
  /** False when the owner already has 3 cars. */
  canAdd: boolean;
  isPending: boolean;
  selectModel: (model?: CarModel) => void;
  /** "Not in the album": only now are the free-text make and model fields shown (SPEC P0-07). */
  chooseOther: () => void;
  updateField: (field: keyof OwnerCarInput, value: string) => void;
  setVisibility: (visibility: OwnerVisibility) => void;
  setShoutout: (shoutout: string) => void;
  submit: () => void;
}

/**
 * Business logic of /garage/new (course ch. 15: custom hooks): pick the model from the catalogue or
 * type it, the plate, a nickname and the visibility. The car always starts as Waiting for verification.
 */
export function useOwnerCarForm(options: { onRegistered: (car: OwnerCar) => void }): RegisterCarForm {
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.show);
  const registration = useRegisterOwnerCar();
  const cars = useOwnerCars();

  const [values, setValues] = useState<OwnerCarInput>(EMPTY_VALUES);
  const [carModel, setCarModel] = useState<CarModel>();
  const [isOtherModel, setIsOtherModel] = useState(false);
  const [visibility, setVisibility] = useState<OwnerVisibility>('hidden');
  const [shoutout, setShoutout] = useState('');
  const [errors, setErrors] = useState<FormErrors<keyof OwnerCarInput>>({});
  const [shoutoutError, setShoutoutError] = useState<string>();

  const canAdd = (cars.data?.length ?? 0) < MAX_OWNER_CARS;

  const updateField = (field: keyof OwnerCarInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const selectModel = (model?: CarModel) => {
    setCarModel(model);
    // Picking a sticker (or "Change") leaves free-text mode; typed make/model stay for a later switch.
    setIsOtherModel(false);
    setErrors((current) => ({ ...current, make: undefined, model: undefined }));
  };

  const chooseOther = () => {
    setCarModel(undefined);
    setIsOtherModel(true);
    setErrors((current) => ({ ...current, make: undefined, model: undefined }));
  };

  const submit = async () => {
    // Without a sticker and outside free-text mode, no typed make/model counts.
    const typed = isOtherModel ? values : { ...values, make: '', model: '' };
    const input: OwnerCarInput = {
      ...typed,
      make: carModel?.make ?? typed.make,
      model: carModel?.model ?? typed.model,
    };
    const validation = validateOwnerCar(input);
    setErrors(validation);
    const tooLong = visibility !== 'hidden' && shoutoutTooLong(shoutout);
    setShoutoutError(tooLong ? t('garage.shoutout_too_long', { max: SHOUTOUT_MAX_LENGTH }) : undefined);
    if (hasErrors(validation) || tooLong) return;
    if (!canAdd) {
      showToast(t('errors.too_many_cars'), 'error');
      return;
    }
    try {
      const car = await registration.mutateAsync({
        make: input.make,
        model: input.model,
        nickname: input.nickname,
        plate: input.plate,
        visibility,
        shoutout: visibility !== 'hidden' ? shoutout : undefined,
        carModelId: carModel?.id,
      });
      showToast(t('garage.registered_toast'), 'success');
      options.onRegistered(car);
    } catch (error) {
      showToast(getErrorMessage(error, 'register_car'), 'error');
    }
  };

  return {
    values,
    carModel,
    isOtherModel,
    visibility,
    shoutout,
    errors,
    shoutoutError,
    canAdd,
    isPending: registration.isPending,
    selectModel,
    chooseOther,
    updateField,
    setVisibility: (next) => {
      setVisibility(next);
      setShoutoutError(undefined);
    },
    setShoutout: (next) => {
      setShoutout(next);
      setShoutoutError(undefined);
    },
    submit: () => void submit(),
  };
}

/** Confirmation before a registered car is removed (course ch. 3: error prevention). */
export interface RemoveCarDialog {
  isOpen: boolean;
  isPending: boolean;
  open: () => void;
  cancel: () => void;
  confirm: () => void;
}

/** The car settings screen (/garage/[carId]). */
export interface OwnerCarSettings {
  car?: OwnerCar;
  stats?: OwnerCarStats;
  isLoading: boolean;
  isMissing: boolean;
  /** Translated message when the car could not be loaded. */
  loadError?: string;
  retry: () => void;
  visibility: OwnerVisibility;
  setVisibility: (visibility: OwnerVisibility) => void;
  /** Switching to Vanity plate needs the plate typed again. */
  needsPlate: boolean;
  plate: string;
  setPlate: (plate: string) => void;
  plateError?: string;
  shoutout: string;
  setShoutout: (shoutout: string) => void;
  shoutoutError?: string;
  /** Visibility or shout-out differ from what is saved. */
  isDirty: boolean;
  isSaving: boolean;
  save: () => void;
  /** Pausing pings is saved at once. */
  setPingsPaused: (paused: boolean) => void;
  removeDialog: RemoveCarDialog;
}

/**
 * Business logic of the car settings: visibility (Hidden, Badge + shout-out, Vanity plate with the
 * plate re-entered), pause pings and remove. The screen only renders what this hook returns.
 */
export function useOwnerCarSettings(carId: string | undefined, options: { onRemoved: () => void }): OwnerCarSettings {
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.show);
  const { car, isLoading, isMissing, isError, error, refetch } = useOwnerCar(carId);
  const statsQuery = useOwnerCarStats();
  const update = useUpdateOwnerCar();
  const removal = useDeleteOwnerCar();

  // Drafts: undefined means "unchanged", so the saved values show until the owner edits them.
  const [visibilityDraft, setVisibilityDraft] = useState<OwnerVisibility>();
  const [shoutoutDraft, setShoutoutDraft] = useState<string>();
  const [plate, setPlate] = useState('');
  const [plateError, setPlateError] = useState<string>();
  const [shoutoutError, setShoutoutError] = useState<string>();
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  const visibility = visibilityDraft ?? car?.visibility ?? 'hidden';
  const shoutout = shoutoutDraft ?? car?.shoutout ?? '';
  const needsPlate = visibility === 'vanity' && car?.visibility !== 'vanity';
  const isDirty =
    car !== undefined &&
    (visibility !== car.visibility || (visibility !== 'hidden' && shoutout.trim() !== (car.shoutout ?? '')));

  const save = async () => {
    if (car === undefined) return;
    const plateInvalid = needsPlate && !isValidPlate(plate);
    const tooLong = visibility !== 'hidden' && shoutoutTooLong(shoutout);
    setPlateError(plateInvalid ? t('validation.owner_plate_invalid') : undefined);
    setShoutoutError(tooLong ? t('garage.shoutout_too_long', { max: SHOUTOUT_MAX_LENGTH }) : undefined);
    if (plateInvalid || tooLong) return;

    const changes: OwnerCarChanges = {};
    if (visibility !== car.visibility) changes.visibility = visibility;
    if (visibility !== 'hidden' && shoutout.trim() !== (car.shoutout ?? '')) changes.shoutout = shoutout;
    if (needsPlate) changes.plate = plate;
    try {
      await update.mutateAsync({ carId: car.id, changes });
      setVisibilityDraft(undefined);
      setShoutoutDraft(undefined);
      setPlate('');
      showToast(t('garage.saved_toast'), 'success');
    } catch (saveError) {
      // Shown next to the plate when that was the reason (e.g. a different plate).
      if (needsPlate) setPlateError(getErrorMessage(saveError, 'update_car'));
      else showToast(getErrorMessage(saveError, 'update_car'), 'error');
    }
  };

  const setPingsPaused = (paused: boolean) => {
    if (car === undefined) return;
    update.mutate(
      { carId: car.id, changes: { pingsPaused: paused } },
      {
        onSuccess: () => showToast(paused ? t('garage.paused_toast') : t('garage.resumed_toast')),
        onError: (pauseError) => showToast(getErrorMessage(pauseError, 'update_car'), 'error'),
      },
    );
  };

  const confirmRemove = async () => {
    if (car === undefined) return;
    try {
      await removal.mutateAsync(car.id);
      showToast(t('garage.removed_toast'));
      options.onRemoved();
    } catch (removeError) {
      showToast(getErrorMessage(removeError, 'remove_car'), 'error');
    } finally {
      // Closed in both cases: a toast is not visible on top of an open dialog.
      setIsRemoveOpen(false);
    }
  };

  return {
    car,
    stats: car !== undefined ? statsForCar(statsQuery.data, car.id) : undefined,
    isLoading,
    isMissing,
    loadError: isError ? getErrorMessage(error, 'load_owner_cars') : undefined,
    retry: () => void refetch(),
    visibility,
    setVisibility: (next) => {
      setVisibilityDraft(next);
      setPlateError(undefined);
      setShoutoutError(undefined);
    },
    needsPlate,
    plate,
    setPlate: (next) => {
      setPlate(next);
      setPlateError(undefined);
    },
    plateError,
    shoutout,
    setShoutout: (next) => {
      setShoutoutDraft(next);
      setShoutoutError(undefined);
    },
    shoutoutError,
    isDirty,
    isSaving: update.isPending && update.variables?.changes.pingsPaused === undefined,
    save: () => void save(),
    setPingsPaused,
    removeDialog: {
      isOpen: isRemoveOpen,
      isPending: removal.isPending,
      open: () => setIsRemoveOpen(true),
      cancel: () => setIsRemoveOpen(false),
      confirm: () => void confirmRemove(),
    },
  };
}
