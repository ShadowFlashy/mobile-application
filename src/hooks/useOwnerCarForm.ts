import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../services/serviceError';
import { useToastStore } from '../state/useToastStore';
import type { OwnerCar } from '../types/OwnerCar';
import { isValidPlate } from '../utils/plate';
import { hasErrors, validateOwnerCar, type FormErrors, type OwnerCarInput } from '../utils/validation';
import { useRegisterOwnerCar, useRemoveOwnerCar, useSetPlateVisibility } from './useOwnerCars';

const EMPTY_FORM: OwnerCarInput = { make: '', model: '', nickname: '', plate: '' };

/** The collapsible "Register a car" form. */
export interface RegisterCarForm {
  isOpen: boolean;
  values: OwnerCarInput;
  /** Vanity plate: the owner wants the plate shown on spots of this car. */
  showPlate: boolean;
  /** Field -> key of its validation message (validation.*). */
  errors: FormErrors<keyof OwnerCarInput>;
  isPending: boolean;
  open: () => void;
  close: () => void;
  updateField: (field: keyof OwnerCarInput, value: string) => void;
  setShowPlate: (showPlate: boolean) => void;
  submit: () => void;
}

/** Confirmation before a registered car is removed (course ch. 3: error prevention). */
export interface RemoveCarDialog {
  isOpen: boolean;
  isPending: boolean;
  open: (car: OwnerCar) => void;
  cancel: () => void;
  confirm: () => void;
}

/** Confirmation to show or hide a vanity plate. Showing it again requires re-entering the plate. */
export interface PlateVisibilityDialog {
  isOpen: boolean;
  /** True when confirming shows the plate, false when it hides it. */
  willShow: boolean;
  /** The plate the owner re-enters before it is shown again. */
  plate: string;
  /** Translated message: an invalid plate or a failed update. */
  error?: string;
  isPending: boolean;
  open: (car: OwnerCar) => void;
  cancel: () => void;
  changePlate: (plate: string) => void;
  confirm: () => void;
}

export interface OwnerCarForm {
  form: RegisterCarForm;
  removeDialog: RemoveCarDialog;
  plateDialog: PlateVisibilityDialog;
}

/**
 * Business logic of the owner portal (course ch. 15: custom hooks): the register form with its
 * validation, and the dialogs to remove a car or to show / hide its plate, with feedback toasts.
 * The screen only renders what this hook returns.
 */
export function useOwnerCarForm(): OwnerCarForm {
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.show);
  const registration = useRegisterOwnerCar();
  const removal = useRemoveOwnerCar();
  const plateVisibility = useSetPlateVisibility();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [values, setValues] = useState<OwnerCarInput>(EMPTY_FORM);
  const [showPlate, setShowPlate] = useState(false);
  const [errors, setErrors] = useState<FormErrors<keyof OwnerCarInput>>({});

  const [carToRemove, setCarToRemove] = useState<OwnerCar>();

  const [carToToggle, setCarToToggle] = useState<OwnerCar>();
  // Kept after closing, so the dialog texts do not flip while it fades out.
  const [willShowPlate, setWillShowPlate] = useState(false);
  const [plate, setPlate] = useState('');
  const [plateError, setPlateError] = useState<string>();

  const updateField = (field: keyof OwnerCarInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setErrors({});
  };

  const submitForm = async () => {
    const validation = validateOwnerCar(values);
    setErrors(validation);
    if (hasErrors(validation)) return;
    try {
      await registration.mutateAsync({ ...values, showPlate });
      setValues(EMPTY_FORM);
      setShowPlate(false);
      setIsFormOpen(false);
      showToast(t('owners.car_registered_toast'), 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'register_car'), 'error');
    }
  };

  const confirmRemove = async () => {
    if (carToRemove === undefined) return;
    try {
      await removal.mutateAsync(carToRemove.id);
      showToast(t('owners.car_removed_toast'));
    } catch (error) {
      showToast(getErrorMessage(error, 'remove_car'), 'error');
    } finally {
      // Closed in both cases: a toast is not visible on top of an open dialog.
      setCarToRemove(undefined);
    }
  };

  const openPlateDialog = (car: OwnerCar) => {
    setCarToToggle(car);
    setWillShowPlate(!car.showPlate);
    setPlate('');
    setPlateError(undefined);
  };

  const changePlate = (value: string) => {
    setPlate(value);
    setPlateError(undefined);
  };

  const confirmPlate = async () => {
    if (carToToggle === undefined) return;
    if (willShowPlate && !isValidPlate(plate)) {
      setPlateError(t('validation.owner_plate_invalid'));
      return;
    }
    setPlateError(undefined);
    try {
      await plateVisibility.mutateAsync({
        carId: carToToggle.id,
        showPlate: willShowPlate,
        plate: willShowPlate ? plate : undefined,
      });
      setCarToToggle(undefined);
      setPlate('');
      showToast(willShowPlate ? t('owners.plate_shown_toast') : t('owners.plate_hidden_toast'));
    } catch (error) {
      // Shown inside the dialog, next to the plate the owner typed.
      setPlateError(getErrorMessage(error, 'update_plate'));
    }
  };

  return {
    form: {
      isOpen: isFormOpen,
      values,
      showPlate,
      errors,
      isPending: registration.isPending,
      open: () => setIsFormOpen(true),
      close: closeForm,
      updateField,
      setShowPlate,
      submit: () => void submitForm(),
    },
    removeDialog: {
      isOpen: carToRemove !== undefined,
      isPending: removal.isPending,
      open: (car) => setCarToRemove(car),
      cancel: () => setCarToRemove(undefined),
      confirm: () => void confirmRemove(),
    },
    plateDialog: {
      isOpen: carToToggle !== undefined,
      willShow: willShowPlate,
      plate,
      error: plateError,
      isPending: plateVisibility.isPending,
      open: openPlateDialog,
      cancel: () => setCarToToggle(undefined),
      changePlate,
      confirm: () => void confirmPlate(),
    },
  };
}
