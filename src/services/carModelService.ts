import { supabase } from '../lib/supabase';
import type { CarModel } from '../types/CarModel';
import { isCarCategory, isRarity } from '../utils/typeGuards';
import { toServiceError } from './serviceError';

/** The sticker catalogue: every collectible car model, ordered by sticker number. */
export async function getCarModels(): Promise<CarModel[]> {
  const { data, error } = await supabase
    .from('car_models')
    .select('id, sticker_number, make, model, category, rarity')
    .order('sticker_number', { ascending: true });
  if (error) throw toServiceError(error, 'load_collection');

  const models: CarModel[] = [];
  for (const row of data) {
    const { category, rarity } = row;
    // Rows with an unknown category or rarity are skipped instead of cast.
    if (!isCarCategory(category) || !isRarity(rarity)) continue;
    models.push({
      id: row.id,
      stickerNumber: row.sticker_number,
      make: row.make,
      model: row.model,
      category,
      rarity,
    });
  }
  return models;
}
