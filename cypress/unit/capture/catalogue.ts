import type { CarModel } from '../../../src/types/CarModel';
import { isBodyStyle, isCarCategory, isRarity } from '../../../src/utils/typeGuards';

/**
 * The real catalogue for the W4 tests, parsed from the seed files (48 Season 1 models plus the 70
 * Appendix E models), so the search is tested against every car the app can match.
 */
const ROW =
  /\(\s*'([a-z0-9-]+)',\s*(\d+),\s*'((?:[^']|'')+)',\s*'((?:[^']|'')+)',\s*'([a-z]+)',\s*'([a-z]+)',\s*'([a-z]+)',\s*'([A-Z]{2})'/g;

export function parseSeedModels(sql: string): CarModel[] {
  const models: CarModel[] = [];
  for (const match of sql.matchAll(ROW)) {
    const [, id, number, make, model, category, rarity, bodyStyle, country] = match;
    if (id === undefined || make === undefined || model === undefined || country === undefined) continue;
    if (!isCarCategory(category) || !isRarity(rarity) || !isBodyStyle(bodyStyle)) continue;
    models.push({
      id,
      stickerNumber: Number(number),
      make: make.replace(/''/g, "'"),
      model: model.replace(/''/g, "'"),
      category,
      rarity,
      bodyStyle,
      country,
      season: 1,
    });
  }
  return models;
}

/** Loads both seed files and calls `use` with the whole catalogue. */
export function withCatalogue(use: (models: CarModel[]) => void): void {
  cy.readFile('supabase/seed.sql').then((season: string) => {
    cy.readFile('supabase/seed_collections.sql').then((collections: string) => {
      use([...parseSeedModels(season), ...parseSeedModels(collections)]);
    });
  });
}
