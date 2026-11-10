import { MAKE_ALIASES, MODEL_ALIASES } from '../constants/carAliases';
import type { CarModel } from '../types/CarModel';

/**
 * Catalogue search that understands everyday spellings (SPEC P0-07): accents are folded (NFD),
 * case and punctuation are ignored, make nicknames are expanded ("vw", "merc", "lambo") and every
 * model has extra alias words ("eend", "kever", "mk4", "g-wagon"). All query words must match
 * (AND), so a search never files a car under the wrong sticker just because one word fits.
 */

/** Lowercase, accents removed (NFD), every non-alphanumeric run turned into one space. */
export function foldText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** The folded words of a text. */
export function tokenize(input: string): string[] {
  const folded = foldText(input);
  return folded.length === 0 ? [] : folded.split(' ');
}

/** The folded query words with make nicknames expanded ("vw golf" → volkswagen, golf). */
export function expandQuery(input: string): string[] {
  return tokenize(input).map((token) => MAKE_ALIASES[token] ?? token);
}

function compact(tokens: readonly string[]): string {
  return tokens.join('');
}

interface IndexedModel {
  model: CarModel;
  /** Make, model and alias words. */
  tokens: string[];
  /** Everything joined without spaces, so "gtr" finds "GT-R" and "mx5" finds "MX-5". */
  joined: string;
  /** Make and model name only (no aliases), joined. */
  nameJoined: string;
  makeToken: string;
  /** Each alias as its own word list. */
  aliasPhrases: string[][];
}

function indexModel(model: CarModel): IndexedModel {
  const makeTokens = tokenize(model.make);
  const modelTokens = tokenize(model.model);
  const aliasPhrases = (MODEL_ALIASES[model.id] ?? []).map(tokenize).filter((phrase) => phrase.length > 0);
  const tokens = [...makeTokens, ...modelTokens, ...aliasPhrases.flat()];
  return {
    model,
    tokens,
    joined: compact(tokens),
    nameJoined: compact(modelTokens),
    makeToken: makeTokens[0] ?? '',
    aliasPhrases,
  };
}

/** Points for one query word: an exact word 4, the start of a word 3, inside a joined spelling 1. */
function tokenScore(entry: IndexedModel, queryToken: string): number {
  if (entry.tokens.includes(queryToken)) return 4;
  if (entry.tokens.some((token) => token.startsWith(queryToken))) return 3;
  if (queryToken.length >= 2 && entry.joined.includes(queryToken)) return 1;
  return 0;
}

export interface SearchHit {
  model: CarModel;
  score: number;
}

/** Every model that matches all query words, best first (ties: sticker number). */
export function searchCatalogueScored(models: readonly CarModel[], query: string): SearchHit[] {
  const queryTokens = expandQuery(query);
  if (queryTokens.length === 0) return [];
  const hits: SearchHit[] = [];
  for (const model of models) {
    const entry = indexModel(model);
    let score = 0;
    let matchesAll = true;
    for (const token of queryTokens) {
      const points = tokenScore(entry, token);
      if (points === 0) {
        matchesAll = false;
        break;
      }
      score += points;
    }
    if (matchesAll) hits.push({ model, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.model.stickerNumber - b.model.stickerNumber);
}

/** The best matching catalogue models for a search box. */
export function searchCatalogue(models: readonly CarModel[], query: string, limit = 6): CarModel[] {
  return searchCatalogueScored(models, query)
    .slice(0, limit)
    .map((hit) => hit.model);
}

function containsPhrase(queryTokens: readonly string[], phrase: readonly string[]): boolean {
  if (phrase.length === 0 || phrase.length > queryTokens.length) return false;
  for (let start = 0; start + phrase.length <= queryTokens.length; start += 1) {
    if (phrase.every((token, offset) => queryTokens[start + offset] === token)) return true;
  }
  return false;
}

/**
 * True when some run of whole query words, joined, spells `target` exactly: "mx5" and "mx 5" both
 * spell "mx5", but "m340i" never spells "m3" (word boundaries are respected).
 */
function spellsJoined(queryTokens: readonly string[], target: string): boolean {
  if (target.length === 0) return false;
  for (let start = 0; start < queryTokens.length; start += 1) {
    let joined = '';
    for (let end = start; end < queryTokens.length && joined.length < target.length; end += 1) {
      joined += queryTokens[end] ?? '';
      if (joined === target) return true;
    }
  }
  return false;
}

/**
 * The ONE catalogue model a full car name clearly refers to, or undefined (SPEC §9.4, P0-07).
 * Stricter than the search: the text must contain the model's whole name (e.g. "Porsche 911 GT3"),
 * or one of its aliases word for word ("Citroën eend"), and name the make (or a nickname of it) if
 * it names one at all. "Porsche 911" fits three stickers and therefore returns undefined, and
 * "Toyota Yaris" never becomes the GR Yaris sticker. A longer, more specific name wins a tie
 * ("Ford Mustang Mach-E" over "Ford Mustang").
 */
export function bestMatch(models: readonly CarModel[], text: string): CarModel | undefined {
  const queryTokens = expandQuery(text);
  if (queryTokens.length === 0) return undefined;

  const byName: IndexedModel[] = [];
  const byAlias: IndexedModel[] = [];
  for (const model of models) {
    const entry = indexModel(model);
    if (entry.makeToken.length > 0 && !queryTokens.includes(entry.makeToken)) continue;
    if (spellsJoined(queryTokens, entry.nameJoined)) byName.push(entry);
    else if (entry.aliasPhrases.some((phrase) => containsPhrase(queryTokens, phrase))) byAlias.push(entry);
  }

  const pick = (entries: IndexedModel[]): CarModel | undefined => {
    if (entries.length === 0) return undefined;
    const sorted = [...entries].sort((a, b) => b.nameJoined.length - a.nameJoined.length);
    const [first, second] = sorted;
    if (first === undefined) return undefined;
    if (second !== undefined && second.nameJoined.length === first.nameJoined.length) return undefined;
    return first.model;
  };

  if (byName.length > 0) return pick(byName);
  // An alias ("gtr") can belong to several stickers: only a single alias hit is clear enough.
  return byAlias.length === 1 ? byAlias[0]?.model : undefined;
}
