import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { NewSpot, Spot, SpotChanges, SpotShowcase } from '../types/Spot';
import { normalizePlate } from '../utils/plate';
import { isBodyStyle, isIdentifiedBy, isPaintColor } from '../utils/typeGuards';
import { deleteSpotPhoto, getSignedPhotoUrl, getSignedPhotoUrls, spotPhotoPath, uploadSpotPhoto } from './photoService';
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
  | 'created_at'
  | 'city'
  | 'paint'
  | 'body_style'
  | 'plates_hidden'
  | 'identified_by'
  | 'ai_confidence'
  | 'ai_model_id'
  | 'generation'
  | 'year_from'
  | 'year_to'
  | 'photo_hash'
  | 'share_name_with_owner'
>;
type SpotInsert = Database['public']['Tables']['spots']['Insert'];
type SpotUpdate = Database['public']['Tables']['spots']['Update'];

// v2 never selects owner_car_id / vanity_plate: plate matches are private (private.spot_matches).
// One literal string, so supabase-js can infer the row type from it.
const SPOT_COLUMNS =
  'id, user_id, car_model_id, make, model, photo_path, location_label, notes, spotted_at, created_at, city, paint, body_style, plates_hidden, identified_by, ai_confidence, ai_model_id, generation, year_from, year_to, photo_hash, share_name_with_owner';

function optionalString(value: string | null | undefined): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function optionalNumber(value: number | null | undefined): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

/**
 * Converts a database row (with nulls) into the app's Spot type (with optional fields).
 * Defensive on purpose: a row from a v1 database (before the v2 migration) lacks the new columns.
 */
function toSpot(row: SpotRow, photoUrl?: string): Spot {
  return {
    id: row.id,
    userId: row.user_id,
    carModelId: optionalString(row.car_model_id),
    make: row.make,
    model: row.model,
    photoPath: row.photo_path,
    photoUrl,
    city: optionalString(row.city),
    locationLabel: optionalString(row.location_label),
    notes: optionalString(row.notes),
    spottedAt: row.spotted_at,
    createdAt: optionalString(row.created_at) ?? row.spotted_at,
    paint: isPaintColor(row.paint) ? row.paint : 'other',
    bodyStyle: isBodyStyle(row.body_style) ? row.body_style : 'other',
    platesHidden: typeof row.plates_hidden === 'number' ? row.plates_hidden : 0,
    identifiedBy: isIdentifiedBy(row.identified_by) ? row.identified_by : 'manual',
    aiConfidence: optionalNumber(row.ai_confidence),
    aiModelId: optionalString(row.ai_model_id),
    generation: optionalString(row.generation),
    yearFrom: optionalNumber(row.year_from),
    yearTo: optionalNumber(row.year_to),
    photoHash: optionalString(row.photo_hash),
    shareNameWithOwner: row.share_name_with_owner === true,
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

/** One of the user's own spots (owners no longer read spot rows in v2: they get a sighting snapshot). */
export async function getSpotById(spotId: string): Promise<Spot> {
  const { data, error } = await supabase.from('spots').select(SPOT_COLUMNS).eq('id', spotId).maybeSingle();
  if (error) throw toServiceError(error, 'spot_not_found');
  if (!data) throw new ServiceError('spot_not_found');
  return toSpot(data, await getSignedPhotoUrl(data.photo_path));
}

/**
 * Uploads the redacted photo and saves the spot. The id is generated on the device (course ch. 22:
 * client-side uuids keep references stable for later offline sync). The plate is only sent when
 * present, exactly once, so the database can ping a VERIFIED owner; the trigger clears it before
 * the row is stored. The returned spot carries a freshly signed URL, never the local photo URI.
 */
export async function createSpot(userId: string, input: NewSpot): Promise<Spot> {
  const spotId = Crypto.randomUUID();
  const photoPath = spotPhotoPath(userId, spotId);
  await uploadSpotPhoto(photoPath, input.photo);
  const plate = input.plate !== undefined ? normalizePlate(input.plate) : '';

  const row: SpotInsert = {
    id: spotId,
    car_model_id: input.carModelId ?? null,
    make: input.make.trim(),
    model: input.model.trim(),
    photo_path: photoPath,
    city: emptyToNull(input.city),
    location_label: emptyToNull(input.locationLabel),
    notes: emptyToNull(input.notes),
    paint: input.paint,
    body_style: input.bodyStyle,
    plates_hidden: input.platesHidden,
    identified_by: input.identifiedBy,
    ai_confidence: input.aiConfidence ?? null,
    ai_model_id: input.aiModelId ?? null,
    generation: emptyToNull(input.generation),
    year_from: input.yearFrom ?? null,
    year_to: input.yearTo ?? null,
    photo_hash: input.photoHash ?? null,
    share_name_with_owner: input.shareNameWithOwner,
  };
  if (input.spottedAt !== undefined) row.spotted_at = input.spottedAt;
  if (plate.length > 0) row.plate_input = plate;

  const { data, error } = await supabase.from('spots').insert(row).select(SPOT_COLUMNS).single();

  if (error) {
    // Never leave an orphaned photo behind when saving the spot failed.
    await deleteSpotPhoto(photoPath).catch(() => undefined);
    throw toServiceError(error, 'save_spot');
  }
  return toSpot(data, await getSignedPhotoUrl(data.photo_path));
}

/** P1 "Fix it": updates the identification of one of the user's spots. */
export async function updateSpot(spotId: string, changes: SpotChanges): Promise<Spot> {
  const update: SpotUpdate = {};
  if (changes.clearCarModel === true) update.car_model_id = null;
  else if (changes.carModelId !== undefined) update.car_model_id = changes.carModelId;
  if (changes.make !== undefined) update.make = changes.make.trim();
  if (changes.model !== undefined) update.model = changes.model.trim();
  if (changes.city !== undefined) update.city = emptyToNull(changes.city);
  if (changes.notes !== undefined) update.notes = emptyToNull(changes.notes);
  if (changes.paint !== undefined) update.paint = changes.paint;
  if (changes.bodyStyle !== undefined) update.body_style = changes.bodyStyle;
  if (changes.generation !== undefined) update.generation = emptyToNull(changes.generation);
  if (changes.yearFrom !== undefined) update.year_from = changes.yearFrom;
  if (changes.yearTo !== undefined) update.year_to = changes.yearTo;
  if (changes.identifiedBy !== undefined) update.identified_by = changes.identifiedBy;

  const { data, error } = await supabase.from('spots').update(update).eq('id', spotId).select(SPOT_COLUMNS).single();
  if (error) throw toServiceError(error, 'save_spot');
  return toSpot(data, await getSignedPhotoUrl(data.photo_path));
}

export async function deleteSpot(spot: Spot): Promise<void> {
  const { error } = await supabase.from('spots').delete().eq('id', spot.id);
  if (error) throw toServiceError(error, 'delete_spot');
  await deleteSpotPhoto(spot.photoPath).catch(() => undefined);
}

/**
 * The owner showcase on one of the user's own spots (badge, shout-out, vanity plate), read live and
 * only when the matched car's VERIFIED owner opted in. Undefined when there is nothing to show.
 */
export async function getSpotShowcase(spotId: string): Promise<SpotShowcase | undefined> {
  const { data, error } = await supabase.rpc('get_spot_showcase', { p_spot_id: spotId });
  if (error) throw toServiceError(error, 'generic');
  const row = data[0];
  if (row === undefined || (row.visibility !== 'badge' && row.visibility !== 'vanity')) return undefined;
  return {
    visibility: row.visibility,
    shoutout: optionalString(row.shoutout),
    vanityPlate: row.visibility === 'vanity' ? optionalString(row.vanity_plate) : undefined,
  };
}
