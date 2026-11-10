/**
 * Everyday spellings for the catalogue search (SPEC P0-07). Written in plain lowercase: `carSearch`
 * folds accents, case and punctuation of both the aliases and the query, so "G-Wagon", "g wagon" and
 * "gwagon" are the same alias.
 *
 * - `MAKE_ALIASES` rewrites one query word into the make it stands for ("vw" → "volkswagen").
 * - `MODEL_ALIASES` adds extra search words to one catalogue model (by its `car_models.id`), e.g.
 *   nicknames ("eend", "kever"), chassis codes ("mk4", "a80") and joined spellings ("rs6").
 *
 * Car-culture reference data, not UI text, so it is not translated. Unknown ids are simply ignored,
 * which keeps the table valid when the catalogue grows (Appendix E: 118 models).
 */
export const MAKE_ALIASES: Readonly<Record<string, string>> = {
  vw: 'volkswagen',
  volkswagon: 'volkswagen',
  merc: 'mercedes',
  merco: 'mercedes',
  benz: 'mercedes',
  mb: 'mercedes',
  lambo: 'lamborghini',
  lamborgini: 'lamborghini',
  chevy: 'chevrolet',
  beemer: 'bmw',
  bimmer: 'bmw',
  beamer: 'bmw',
  porche: 'porsche',
  ferari: 'ferrari',
};

export const MODEL_ALIASES: Readonly<Record<string, readonly string[]>> = {
  // Season 1
  'volkswagen-golf-gti': ['golf 7 gti', 'gti'],
  'mini-cooper-s': ['mini cooper', 'jcw'],
  'land-rover-defender': ['landy'],
  'range-rover': ['rangie'],
  'mercedes-g-class': ['g wagon', 'gwagon', 'g wagen', 'gelandewagen', 'g63', 'g klasse'],
  'porsche-911-gt3': ['992 gt3', 'gt 3'],
  'bmw-m3': ['m 3'],
  'audi-rs6-avant': ['rs6', 'rs 6'],
  'mercedes-amg-gt': ['amg gt', 'amg gt r'],
  'lamborghini-huracan': ['huracan'],
  'ferrari-laferrari': ['la ferrari'],
  'porsche-918-spyder': ['918'],
  'jaguar-e-type': ['etype', 'e type', 'xke'],
  'mercedes-300-sl': ['gullwing', '300sl'],
  'volkswagen-beetle': ['kever', 'kafer', 'bug', 'type 1'],
  'citroen-2cv': ['eend', 'deux chevaux', 'geit', '2 cv'],
  'toyota-supra-a80': ['mk4', 'mkiv', 'mk 4', 'a80', 'supra 4'],
  'nissan-skyline-gt-r-r34': ['gtr', 'r34', 'godzilla'],
  'mazda-mx-5': ['miata', 'mx5', 'eunos'],
  'subaru-impreza-wrx-sti': ['sti', 'wrx', 'scooby', 'scoobie'],
  'toyota-gr-yaris': ['gr yaris', 'yaris gr'],
  'ford-mustang': ['stang', 'pony'],
  'chevrolet-corvette-c8': ['vette', 'c8'],
  'ford-gt': ['gt40'],
  'audi-e-tron-gt': ['etron gt', 'etron'],
  // Appendix E (seed_collections.sql)
  'nissan-gt-r-r35': ['gtr', 'r35', 'godzilla'],
  'mazda-rx-7-fd': ['rx7', 'fd3s', 'fd'],
  'honda-civic-type-r-fk8': ['type r', 'ctr', 'fk8'],
  'mitsubishi-lancer-evolution-ix': ['evo', 'evo 9', 'evo ix', 'lancer evo'],
  'nissan-silvia-s15': ['s15'],
  'toyota-sprinter-trueno-ae86': ['ae86', 'hachiroku', 'corolla ae86'],
  'honda-s2000': ['s2k'],
  'toyota-gr86': ['gt86', 'gr 86'],
  'datsun-240z': ['fairlady', '240 z'],
  'toyota-land-cruiser': ['landcruiser', 'lc'],
  'chevrolet-corvette-c2': ['vette', 'stingray', 'c2'],
  'plymouth-barracuda-e-body': ['cuda', 'hemi cuda'],
  'ford-model-t': ['tin lizzie'],
  'porsche-911-turbo-930': ['930', 'widowmaker'],
  'mercedes-amg-c63': ['c63', 'c 63'],
  'audi-quattro': ['ur quattro', 'urquattro'],
  'porsche-carrera-gt': ['cgt'],
  'mercedes-sl-w113': ['pagode', 'pagoda', 'w113'],
  'volkswagen-type-2-t1': ['bulli', 'samba', 't1', 'kombi', 'busje'],
  'porsche-911-carrera-rs-2-7': ['rs 2.7', '2.7 rs'],
  'ferrari-308-gtsi': ['308 gts', 'magnum', 'magnum pi'],
  'lamborghini-countach': ['lp400'],
  'alfa-romeo-giulia-quadrifoglio': ['giulia qv'],
  'fiat-500-nuova': ['cinquecento'],
  'lancia-delta-hf-integrale': ['deltona'],
  'aston-martin-db5': ['bond car'],
  'citroen-ds': ['snoek', 'deesse', 'ds19'],
  'volvo-p1800': ['p 1800'],
  'volkswagen-id-buzz': ['id buzz', 'idbuzz'],
  'renault-5-e-tech': ['r5', 'renault 5'],
};
