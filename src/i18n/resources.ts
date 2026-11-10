/**
 * Every translation namespace, one JSON file per namespace and language (parallel-safe: each lane
 * owns its own files, SPEC §11). Keys stay `t('<namespace>.<key>')`.
 * `nl` is typed as `Resources`, so a missing Dutch key is a compile error.
 */
import enCommon from './locales/en/common.json';
import enErrors from './locales/en/errors.json';
import enValidation from './locales/en/validation.json';
import enCategories from './locales/en/categories.json';
import enRarity from './locales/en/rarity.json';
import enPaint from './locales/en/paint.json';
import enBodyStyle from './locales/en/body_style.json';
import enCountries from './locales/en/countries.json';
import enShell from './locales/en/shell.json';
import enA11y from './locales/en/a11y.json';
import enOffline from './locales/en/offline.json';
import enNotFound from './locales/en/not_found.json';
import enAuth from './locales/en/auth.json';
import enUi from './locales/en/ui.json';
import enTabs from './locales/en/tabs.json';
import enBrand from './locales/en/brand.json';
import enSpot from './locales/en/spot.json';
import enCapture from './locales/en/capture.json';
import enCoDriver from './locales/en/co_driver.json';
import enRedactor from './locales/en/redactor.json';
import enPicker from './locales/en/picker.json';
import enAlbum from './locales/en/album.json';
import enStickerDetail from './locales/en/sticker_detail.json';
import enSpotDetail from './locales/en/spot_detail.json';
import enCollections from './locales/en/collections.json';
import enProgress from './locales/en/progress.json';
import enLevels from './locales/en/levels.json';
import enAchievements from './locales/en/achievements.json';
import enChallenges from './locales/en/challenges.json';
import enReveal from './locales/en/reveal.json';
import enGarage from './locales/en/garage.json';
import enVerify from './locales/en/verify.json';
import enSightings from './locales/en/sightings.json';
import enProfile from './locales/en/profile.json';
import enTrust from './locales/en/trust.json';
import enPrivacy from './locales/en/privacy.json';
import enPwa from './locales/en/pwa.json';
import enOnboarding from './locales/en/onboarding.json';
import nlCommon from './locales/nl/common.json';
import nlErrors from './locales/nl/errors.json';
import nlValidation from './locales/nl/validation.json';
import nlCategories from './locales/nl/categories.json';
import nlRarity from './locales/nl/rarity.json';
import nlPaint from './locales/nl/paint.json';
import nlBodyStyle from './locales/nl/body_style.json';
import nlCountries from './locales/nl/countries.json';
import nlShell from './locales/nl/shell.json';
import nlA11y from './locales/nl/a11y.json';
import nlOffline from './locales/nl/offline.json';
import nlNotFound from './locales/nl/not_found.json';
import nlAuth from './locales/nl/auth.json';
import nlUi from './locales/nl/ui.json';
import nlTabs from './locales/nl/tabs.json';
import nlBrand from './locales/nl/brand.json';
import nlSpot from './locales/nl/spot.json';
import nlCapture from './locales/nl/capture.json';
import nlCoDriver from './locales/nl/co_driver.json';
import nlRedactor from './locales/nl/redactor.json';
import nlPicker from './locales/nl/picker.json';
import nlAlbum from './locales/nl/album.json';
import nlStickerDetail from './locales/nl/sticker_detail.json';
import nlSpotDetail from './locales/nl/spot_detail.json';
import nlCollections from './locales/nl/collections.json';
import nlProgress from './locales/nl/progress.json';
import nlLevels from './locales/nl/levels.json';
import nlAchievements from './locales/nl/achievements.json';
import nlChallenges from './locales/nl/challenges.json';
import nlReveal from './locales/nl/reveal.json';
import nlGarage from './locales/nl/garage.json';
import nlVerify from './locales/nl/verify.json';
import nlSightings from './locales/nl/sightings.json';
import nlProfile from './locales/nl/profile.json';
import nlTrust from './locales/nl/trust.json';
import nlPrivacy from './locales/nl/privacy.json';
import nlPwa from './locales/nl/pwa.json';
import nlOnboarding from './locales/nl/onboarding.json';

export const en = {
  common: enCommon,
  errors: enErrors,
  validation: enValidation,
  categories: enCategories,
  rarity: enRarity,
  paint: enPaint,
  body_style: enBodyStyle,
  countries: enCountries,
  shell: enShell,
  a11y: enA11y,
  offline: enOffline,
  not_found: enNotFound,
  auth: enAuth,
  ui: enUi,
  tabs: enTabs,
  brand: enBrand,
  spot: enSpot,
  capture: enCapture,
  co_driver: enCoDriver,
  redactor: enRedactor,
  picker: enPicker,
  album: enAlbum,
  sticker_detail: enStickerDetail,
  spot_detail: enSpotDetail,
  collections: enCollections,
  progress: enProgress,
  levels: enLevels,
  achievements: enAchievements,
  challenges: enChallenges,
  reveal: enReveal,
  garage: enGarage,
  verify: enVerify,
  sightings: enSightings,
  profile: enProfile,
  trust: enTrust,
  privacy: enPrivacy,
  pwa: enPwa,
  onboarding: enOnboarding,
};

export type Resources = typeof en;

export const nl: Resources = {
  common: nlCommon,
  errors: nlErrors,
  validation: nlValidation,
  categories: nlCategories,
  rarity: nlRarity,
  paint: nlPaint,
  body_style: nlBodyStyle,
  countries: nlCountries,
  shell: nlShell,
  a11y: nlA11y,
  offline: nlOffline,
  not_found: nlNotFound,
  auth: nlAuth,
  ui: nlUi,
  tabs: nlTabs,
  brand: nlBrand,
  spot: nlSpot,
  capture: nlCapture,
  co_driver: nlCoDriver,
  redactor: nlRedactor,
  picker: nlPicker,
  album: nlAlbum,
  sticker_detail: nlStickerDetail,
  spot_detail: nlSpotDetail,
  collections: nlCollections,
  progress: nlProgress,
  levels: nlLevels,
  achievements: nlAchievements,
  challenges: nlChallenges,
  reveal: nlReveal,
  garage: nlGarage,
  verify: nlVerify,
  sightings: nlSightings,
  profile: nlProfile,
  trust: nlTrust,
  privacy: nlPrivacy,
  pwa: nlPwa,
  onboarding: nlOnboarding,
};
