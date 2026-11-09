import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { NewOwnerCar, OwnerCar, SpotPing } from '../types/OwnerCar';
import { normalizePlate } from '../utils/plate';
import { toServiceError } from './serviceError';

type OwnerCarRow = Pick<
  Database['public']['Tables']['owner_cars']['Row'],
  'id' | 'owner_id' | 'make' | 'model' | 'nickname' | 'plate_hint' | 'show_plate' | 'plate_display' | 'created_at'
>;
type NotificationRow = Database['public']['Tables']['spot_notifications']['Row'];

// The plate hash is never selected: the database does not even grant clients access to it.
const OWNER_CAR_COLUMNS = 'id, owner_id, make, model, nickname, plate_hint, show_plate, plate_display, created_at';
const PING_COLUMNS =
  'id, spot_id, owner_car_id, created_at, read_at, owner_cars(make, model, nickname), spots(location_label, spotted_at)';

function toOwnerCar(row: OwnerCarRow): OwnerCar {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    nickname: row.nickname ?? undefined,
    plateHint: row.plate_hint,
    showPlate: row.show_plate,
    plateDisplay: row.plate_display ?? undefined,
    createdAt: row.created_at,
  };
}

interface PingRow {
  id: string;
  spot_id: string;
  owner_car_id: string;
  created_at: string;
  read_at: string | null;
  owner_cars: { make: string; model: string; nickname: string | null } | null;
  spots: { location_label: string | null; spotted_at: string } | null;
}

function toPing(row: PingRow): SpotPing {
  const car = row.owner_cars;
  return {
    id: row.id,
    spotId: row.spot_id,
    ownerCarId: row.owner_car_id,
    carMake: car?.make ?? '',
    carModel: car?.model ?? '',
    carNickname: car?.nickname ?? undefined,
    locationLabel: row.spots?.location_label ?? undefined,
    spottedAt: row.spots?.spotted_at ?? row.created_at,
    createdAt: row.created_at,
    isRead: row.read_at !== null,
  };
}

export async function getMyOwnerCars(): Promise<OwnerCar[]> {
  const { data, error } = await supabase
    .from('owner_cars')
    .select(OWNER_CAR_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw toServiceError(error, 'load_owner_cars');
  return data.map(toOwnerCar);
}

/** Registers a car. The plate is hashed by the database; the plain text is never stored. */
export async function registerOwnerCar(input: NewOwnerCar): Promise<OwnerCar> {
  const nickname = input.nickname?.trim() ?? '';
  const { data, error } = await supabase
    .from('owner_cars')
    .insert({
      make: input.make.trim(),
      model: input.model.trim(),
      nickname: nickname.length > 0 ? nickname : null,
      // A vanity plate is shown exactly as typed; otherwise only the normalised form is sent.
      plate_input: input.showPlate ? input.plate.trim().toUpperCase() : normalizePlate(input.plate),
      show_plate: input.showPlate,
    })
    .select(OWNER_CAR_COLUMNS)
    .single();
  if (error) throw toServiceError(error, 'register_car');
  return toOwnerCar(data);
}

/** Shows or hides the (vanity) plate on spots. Showing it again requires re-entering the plate. */
export async function setPlateVisibility(carId: string, showPlate: boolean, plate?: string): Promise<OwnerCar> {
  const { data, error } = await supabase
    .from('owner_cars')
    .update({ show_plate: showPlate, plate_input: plate !== undefined ? plate.trim().toUpperCase() : null })
    .eq('id', carId)
    .select(OWNER_CAR_COLUMNS)
    .single();
  if (error) throw toServiceError(error, 'update_plate');
  return toOwnerCar(data);
}

export async function deleteOwnerCar(carId: string): Promise<void> {
  const { error } = await supabase.from('owner_cars').delete().eq('id', carId);
  if (error) throw toServiceError(error, 'remove_car');
}

export async function getPings(): Promise<SpotPing[]> {
  const { data, error } = await supabase
    .from('spot_notifications')
    .select(PING_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw toServiceError(error, 'load_pings');
  return data.map(toPing);
}

export async function getPingById(pingId: string): Promise<SpotPing | undefined> {
  const { data, error } = await supabase.from('spot_notifications').select(PING_COLUMNS).eq('id', pingId).maybeSingle();
  if (error || !data) return undefined;
  return toPing(data);
}

export async function markAllPingsRead(): Promise<void> {
  const { error } = await supabase
    .from('spot_notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null);
  if (error) throw toServiceError(error, 'update_pings');
}

/**
 * Live pings through Supabase Realtime: called with the id of every new ping for this owner.
 * Returns an unsubscribe function.
 */
export function subscribeToPings(ownerId: string, onPing: (pingId: string) => void): () => void {
  const channel = supabase
    .channel(`pings:${ownerId}`)
    .on<NotificationRow>(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'spot_notifications', filter: `owner_id=eq.${ownerId}` },
      (payload) => {
        if (typeof payload.new.id === 'string') onPing(payload.new.id);
      },
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
