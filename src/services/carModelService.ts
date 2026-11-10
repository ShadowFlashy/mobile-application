import { supabase } from '../lib/supabase';
import type { CarModel } from '../types/CarModel';
import type { Collection } from '../types/Collection';
import { isBodyStyle, isCarCategory, isCountryCode, isRarity } from '../utils/typeGuards';
import { toServiceError } from './serviceError';

const CAR_MODEL_COLUMNS =
  'id, sticker_number, make, model, category, rarity, body_style, country, season, year_from, year_to';

/** Optional numeric column: older databases (before Appendix E) simply do not return it. */
function optionalNumber(value: number | null | undefined): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

/** The sticker catalogue: every collectible car model, ordered by sticker number. */
export async function getCarModels(): Promise<CarModel[]> {
  const { data, error } = await supabase
    .from('car_models')
    .select(CAR_MODEL_COLUMNS)
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
      bodyStyle: isBodyStyle(row.body_style) ? row.body_style : 'other',
      country: isCountryCode(row.country) ? row.country : 'XX',
      season: typeof row.season === 'number' ? row.season : 1,
      yearFrom: optionalNumber(row.year_from),
      yearTo: optionalNumber(row.year_to),
    });
  }
  return models;
}

/**
 * The themed collections (Appendix E) with the catalogue ids of their member cars, in set order.
 * Member ids are returned in database order; consumers sort them by sticker number with the catalogue.
 */
export async function getCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, number, sort, collection_models(car_model_id)')
    .order('sort', { ascending: true })
    .order('number', { ascending: true });
  if (error) throw toServiceError(error, 'load_collections');

  return data.map((row) => ({
    id: row.id,
    number: row.number,
    modelIds: (row.collection_models ?? []).map((member) => member.car_model_id),
  }));
}
