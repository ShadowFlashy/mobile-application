import type { Resources } from '../i18n/resources';
import { isValidPlate } from './plate';

/** Key of a validation message in the translation files (validation.*). */
export type ValidationKey = keyof Resources['validation'];

/** Field name -> validation message key. An empty object means the form is valid. */
export type FormErrors<Field extends string> = Partial<Record<Field, ValidationKey>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,24}$/;

export const PASSWORD_MIN_LENGTH = 8;

export function hasErrors<Field extends string>(errors: FormErrors<Field>): boolean {
  return Object.values(errors).some((key) => key !== undefined);
}

export function validateLogin(email: string, password: string): FormErrors<'email' | 'password'> {
  const errors: FormErrors<'email' | 'password'> = {};
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'email_invalid';
  if (password.length === 0) errors.password = 'password_required';
  return errors;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateRegister(input: RegisterInput): FormErrors<keyof RegisterInput> {
  const errors: FormErrors<keyof RegisterInput> = {};
  if (!USERNAME_PATTERN.test(input.username.trim())) errors.username = 'username_invalid';
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = 'email_invalid';
  if (input.password.length < PASSWORD_MIN_LENGTH) errors.password = 'password_too_short';
  if (input.confirmPassword !== input.password) errors.confirmPassword = 'passwords_mismatch';
  return errors;
}

export interface SpotDetailsInput {
  make: string;
  model: string;
  locationLabel: string;
  notes: string;
  plate: string;
}

export function validateSpotDetails(input: SpotDetailsInput): FormErrors<keyof SpotDetailsInput> {
  const errors: FormErrors<keyof SpotDetailsInput> = {};
  const make = input.make.trim();
  const model = input.model.trim();
  if (make.length === 0) errors.make = 'make_required';
  else if (make.length > 40) errors.make = 'make_too_long';
  if (model.length === 0) errors.model = 'model_required';
  else if (model.length > 60) errors.model = 'model_too_long';
  if (input.locationLabel.trim().length > 80) errors.locationLabel = 'location_too_long';
  if (input.notes.trim().length > 500) errors.notes = 'notes_too_long';
  if (input.plate.trim().length > 0 && !isValidPlate(input.plate)) errors.plate = 'plate_invalid';
  return errors;
}

export interface OwnerCarInput {
  make: string;
  model: string;
  nickname: string;
  plate: string;
}

export function validateOwnerCar(input: OwnerCarInput): FormErrors<keyof OwnerCarInput> {
  const errors: FormErrors<keyof OwnerCarInput> = {};
  if (input.make.trim().length === 0) errors.make = 'owner_make_required';
  if (input.model.trim().length === 0) errors.model = 'owner_model_required';
  if (input.nickname.trim().length > 40) errors.nickname = 'nickname_too_long';
  if (!isValidPlate(input.plate)) errors.plate = 'owner_plate_invalid';
  return errors;
}
