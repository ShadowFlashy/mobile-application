import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type {
  NewOwnerCar,
  OwnerCar,
  OwnerCarChanges,
  OwnerCarStats,
  OwnerVisibility,
  Sighting,
  VerificationCode,
} from '../types/OwnerCar';
import { normalizePlate } from '../utils/plate';
import { SIGHTINGS_PAGE_SIZE, truncateToHour } from '../utils/sightings';
import { isOwnerVisibility } from '../utils/typeGuards';
import { getSignedPhotoUrls } from './photoService';
import { ServiceError, toServiceError } from './serviceError';

/**
 * Garage (owner portal) v2 (SPEC §4 P0-16/P0-17, D-3, D-8).
 * - Owners only ever read their own cars and privacy-safe sighting snapshots: car label, city, hour
 *   window, blurred photo and (only when the spotter opted in) a username. Never a spot row.
 * - The plate is sent once as `plate_input`; the database hashes it and clears it.
 * - Verification is decided in Postgres (verified_at), never by the client.
 */

type OwnerCarRow = Pick<
  Database['public']['Tables']['owner_cars']['Row'],
  | 'id'
  | 'owner_id'
  | 'make'
  | 'model'
  | 'nickname'
  | 'plate_hint'
  | 'show_plate'
  | 'plate_display'
  | 'visibility'
  | 'shoutout'
  | 'pings_paused'
  | 'verified_at'
  | 'verify_expires_at'
  | 'car_model_id'
  | 'created_at'
>;
type NotificationRow = Database['public']['Tables']['spot_notifications']['Row'];
type SightingRow = Pick<
  NotificationRow,
  | 'id'
  | 'owner_car_id'
  | 'car_label'
  | 'city'
  | 'spotted_hour'
  | 'photo_path'
  | 'spotter_name'
  | 'created_at'
  | 'read_at'
>;
type OwnerCarUpdate = Database['public']['Tables']['owner_cars']['Update'];
type StatsRow = Database['public']['Functions']['get_owner_car_stats']['Returns'][number];

// The plate hash is never selected: the database does not even grant clients access to it.
const OWNER_CAR_COLUMNS =
  'id, owner_id, make, model, nickname, plate_hint, show_plate, plate_display, visibility, shoutout, pings_paused, verified_at, verify_expires_at, car_model_id, created_at';
// Snapshot columns only: no spot_id join, no spotter_key, nothing from the spotter's row (D-8).
const SIGHTING_COLUMNS =
  'id, owner_car_id, car_label, city, spotted_hour, photo_path, spotter_name, created_at, read_at';

function emptyToUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Defensive mapping: a row from a v1 database (before the v2 migration) lacks the new columns. */
function toOwnerCar(row: OwnerCarRow): OwnerCar {
  const visibility: OwnerVisibility = isOwnerVisibility(row.visibility)
    ? row.visibility
    : row.show_plate
      ? 'vanity'
      : 'hidden';
  const verifiedAt = row.verified_at ?? undefined;
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    nickname: emptyToUndefined(row.nickname),
    plateHint: row.plate_hint,
    visibility,
    shoutout: emptyToUndefined(row.shoutout),
    plateDisplay: visibility === 'vanity' ? (row.plate_display ?? undefined) : undefined,
    pingsPaused: row.pings_paused === true,
    verification: verifiedAt !== undefined ? 'verified' : 'pending',
    verifiedAt,
    verifyExpiresAt: row.verify_expires_at ?? undefined,
    carModelId: row.car_model_id ?? undefined,
    createdAt: row.created_at,
  };
}

function toSighting(row: SightingRow, photoUrl?: string): Sighting {
  return {
    id: row.id,
    ownerCarId: row.owner_car_id,
    carLabel: row.car_label,
    city: emptyToUndefined(row.city),
    // v1 rows without a snapshot hour fall back to the hour of the ping, never the exact time.
    spottedHour: truncateToHour(row.spotted_hour ?? row.created_at),
    photoPath: row.photo_path ?? undefined,
    photoUrl,
    spotterName: emptyToUndefined(row.spotter_name),
    createdAt: row.created_at,
    isRead: row.read_at !== null,
  };
}

/** Maps rows and signs the blurred photos in one request (owners may read only their sightings' photos). */
async function toSightings(rows: SightingRow[]): Promise<Sighting[]> {
  const paths = rows.flatMap((row) => (row.photo_path !== null ? [row.photo_path] : []));
  const urls = await getSignedPhotoUrls(paths);
  return rows.map((row) => toSighting(row, row.photo_path !== null ? urls.get(row.photo_path) : undefined));
}

/** The plate as it is sent once: shown as typed for a vanity plate, otherwise only the normalised form. */
function plateInput(plate: string, visibility: OwnerVisibility): string {
  return visibility === 'vanity' ? plate.trim().toUpperCase() : normalizePlate(plate);
}

export async function getMyOwnerCars(): Promise<OwnerCar[]> {
  const { data, error } = await supabase
    .from('owner_cars')
    .select(OWNER_CAR_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw toServiceError(error, 'load_owner_cars');
  return data.map(toOwnerCar);
}

/**
 * Registers a car. It starts as "Waiting for verification" (the database forces verified_at = null) and
 * gets no pings until the Redline team verifies it. A plate claimed by someone else is not revealed:
 * the registration succeeds and simply stays pending.
 */
export async function registerOwnerCar(input: NewOwnerCar): Promise<OwnerCar> {
  const visibility: OwnerVisibility = input.visibility ?? 'hidden';
  const nickname = emptyToUndefined(input.nickname);
  const shoutout = visibility !== 'hidden' ? emptyToUndefined(input.shoutout) : undefined;
  const { data, error } = await supabase
    .from('owner_cars')
    .insert({
      make: input.make.trim(),
      model: input.model.trim(),
      nickname: nickname ?? null,
      plate_input: plateInput(input.plate, visibility),
      visibility,
      ...(shoutout !== undefined ? { shoutout } : {}),
      ...(input.carModelId !== undefined ? { car_model_id: input.carModelId } : {}),
    })
    .select(OWNER_CAR_COLUMNS)
    .single();
  if (error) throw toServiceError(error, 'register_car');
  return toOwnerCar(data);
}

/**
 * Changes the settings of a registered car: visibility, shout-out (≤ 80), pause pings, nickname or
 * sticker match. Switching to 'vanity' needs the plate re-entered; the database refuses a different plate.
 */
export async function updateOwnerCar(carId: string, changes: OwnerCarChanges): Promise<OwnerCar> {
  const update: OwnerCarUpdate = {};
  if (changes.nickname !== undefined) update.nickname = emptyToUndefined(changes.nickname) ?? null;
  if (changes.visibility !== undefined) update.visibility = changes.visibility;
  if (changes.shoutout !== undefined) update.shoutout = emptyToUndefined(changes.shoutout) ?? null;
  if (changes.pingsPaused !== undefined) update.pings_paused = changes.pingsPaused;
  if (changes.carModelId !== undefined) update.car_model_id = changes.carModelId;
  if (changes.plate !== undefined) update.plate_input = plateInput(changes.plate, changes.visibility ?? 'vanity');
  const { data, error } = await supabase
    .from('owner_cars')
    .update(update)
    .eq('id', carId)
    .select(OWNER_CAR_COLUMNS)
    .single();
  if (error) throw toServiceError(error, 'update_car');
  return toOwnerCar(data);
}

export async function deleteOwnerCar(carId: string): Promise<void> {
  const { error } = await supabase.from('owner_cars').delete().eq('id', carId);
  if (error) throw toServiceError(error, 'remove_car');
}

/** Starts the P1 ownership check: a one-time code RL-XXXXXX, valid for 30 minutes. */
export async function startOwnerVerification(carId: string): Promise<VerificationCode> {
  const { data, error } = await supabase.rpc('start_owner_verification', { p_car_id: carId });
  if (error) throw toServiceError(error, 'start_verification');
  const row = data[0];
  if (row === undefined) throw new ServiceError('start_verification');
  return { code: row.code, expiresAt: row.expires_at };
}

function toStats(row: StatsRow): OwnerCarStats {
  return {
    ownerCarId: row.owner_car_id,
    sightings: row.sightings,
    unread: row.unread,
    lastCity: emptyToUndefined(row.last_city),
    lastSeen: row.last_seen ?? undefined,
  };
}

/** Sightings and unread counts per car, counted on the server (get_owner_car_stats; no 50 cap). */
export async function getOwnerCarStats(): Promise<OwnerCarStats[]> {
  const { data, error } = await supabase.rpc('get_owner_car_stats');
  if (error) throw toServiceError(error, 'load_stats');
  return data.map(toStats);
}

/** Privacy-safe sighting snapshots, newest first, paged by `before` (ISO createdAt of the last item). */
export async function getSightings(options: { before?: string; limit?: number } = {}): Promise<Sighting[]> {
  let query = supabase
    .from('spot_notifications')
    .select(SIGHTING_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(options.limit ?? SIGHTINGS_PAGE_SIZE);
  if (options.before !== undefined) query = query.lt('created_at', options.before);
  const { data, error } = await query;
  if (error) throw toServiceError(error, 'load_sightings');
  return toSightings(data);
}

export async function getSightingById(sightingId: string): Promise<Sighting | undefined> {
  const { data, error } = await supabase
    .from('spot_notifications')
    .select(SIGHTING_COLUMNS)
    .eq('id', sightingId)
    .maybeSingle();
  if (error) throw toServiceError(error, 'load_sightings');
  if (data === null) return undefined;
  const [sighting] = await toSightings([data]);
  return sighting;
}

export async function markSightingRead(sightingId: string): Promise<void> {
  const { error } = await supabase
    .from('spot_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', sightingId)
    .is('read_at', null);
  if (error) throw toServiceError(error, 'update_pings');
}

export async function markAllSightingsRead(): Promise<void> {
  const { error } = await supabase
    .from('spot_notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null);
  if (error) throw toServiceError(error, 'update_pings');
}

/**
 * Live sightings through Supabase Realtime: called with the id of every new sighting for this owner
 * (RLS limits the stream to the owner's own rows). Returns an unsubscribe function.
 */
export function subscribeToSightings(ownerId: string, onSighting: (sightingId: string) => void): () => void {
  const channel = supabase
    .channel(`pings:${ownerId}`)
    .on<NotificationRow>(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'spot_notifications', filter: `owner_id=eq.${ownerId}` },
      (payload) => {
        if (typeof payload.new.id === 'string') onSighting(payload.new.id);
      },
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
