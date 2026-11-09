import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { NewSpot, Spot } from '../types/Spot';
import { normalizePlate } from '../utils/plate';
import { deleteSpotPhoto, getSignedPhotoUrls, spotPhotoPath, uploadSpotPhoto } from './photoService';
import { ServiceError, toServiceError } from './serviceError';

type SpotRow = Pick<
  Database['public']['Tables']['spots']['Row'],
  | 'id'
  | 'user_id'
  | 'car_model_id'
  | 'make'
  | 'model'
  | 'photo_path'
  | 'location_label'
  | 'notes'
  | 'spotted_at'
  | 'owner_car_id'
  | 'vanity_plate'
>;

const SPOT_COLUMNS =
  'id, user_id, car_model_id, make, model, photo_path, location_label, notes, spotted_at, owner_car_id, vanity_plate';

/** Converts a database row (with nulls) into the app's Spot type (with optional fields). */
function toSpot(row: SpotRow, photoUrl?: string): Spot {
  return {
    id: row.id,
    userId: row.user_id,
    carModelId: row.car_model_id ?? undefined,
    make: row.make,
    model: row.model,
    photoPath: row.photo_path,
    photoUrl,
    locationLabel: row.location_label ?? undefined,
    notes: row.notes ?? undefined,
    spottedAt: row.spotted_at,
    ownerCarId: row.owner_car_id ?? undefined,
    vanityPlate: row.vanity_plate ?? undefined,
  };
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

/** All spots of the signed-in user, newest first, with signed photo URLs. */
export async function getMySpots(userId: string): Promise<Spot[]> {
  const { data, error } = await supabase
    .from('spots')
    .select(SPOT_COLUMNS)
    .eq('user_id', userId)
    .order('spotted_at', { ascending: false });
  if (error) throw toServiceError(error, 'load_spots');
  const urls = await getSignedPhotoUrls(data.map((row) => row.photo_path));
  return data.map((row) => toSpot(row, urls.get(row.photo_path)));
}

/** A spot the user may see: their own, or one of a car they registered as owner (RLS decides). */
export async function getSpotById(spotId: string): Promise<Spot> {
  const { data, error } = await supabase.from('spots').select(SPOT_COLUMNS).eq('id', spotId).maybeSingle();
  if (error) throw toServiceError(error, 'spot_not_found');
  if (!data) throw new ServiceError('spot_not_found');
  const urls = await getSignedPhotoUrls([data.photo_path]);
  return toSpot(data, urls.get(data.photo_path));
}

/**
 * Uploads the redacted photo and saves the spot. The id is generated on the device (course ch. 22:
 * client-side uuids keep references stable for later offline sync). The optional plate is sent
 * once so the database can ping a registered owner; the database clears it before storing the row.
 */
export async function createSpot(userId: string, input: NewSpot): Promise<Spot> {
  const spotId = Crypto.randomUUID();
  const photoPath = spotPhotoPath(userId, spotId);
  await uploadSpotPhoto(photoPath, input.photo);
  const plate = input.plate !== undefined ? normalizePlate(input.plate) : '';

  const { data, error } = await supabase
    .from('spots')
    .insert({
      id: spotId,
      car_model_id: input.carModelId ?? null,
      make: input.make.trim(),
      model: input.model.trim(),
      photo_path: photoPath,
      location_label: emptyToNull(input.locationLabel),
      notes: emptyToNull(input.notes),
      plate_input: plate.length > 0 ? plate : null,
    })
    .select(SPOT_COLUMNS)
    .single();

  if (error) {
    // Never leave an orphaned photo behind when saving the spot failed.
    await deleteSpotPhoto(photoPath).catch(() => undefined);
    throw toServiceError(error, 'save_spot');
  }
  return toSpot(data, input.photo.uri);
}

export async function deleteSpot(spot: Spot): Promise<void> {
  const { error } = await supabase.from('spots').delete().eq('id', spot.id);
  if (error) throw toServiceError(error, 'delete_spot');
  await deleteSpotPhoto(spot.photoPath).catch(() => undefined);
}
