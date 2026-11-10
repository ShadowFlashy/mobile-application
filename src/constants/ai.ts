/**
 * Co-Driver (identify-car Edge Function) client constants. The function is deployed and frozen:
 * these values match supabase/functions/identify-car and 20261110080000_identify_quota.sql.
 */
export const IDENTIFY_FUNCTION = 'identify-car';
export const AI_MAX_SIDE = 768;
export const AI_JPEG_QUALITY = 0.85; // matches the deployed function
export const AI_HARD_TIMEOUT_MS = 35000; // provider timeout is 30 s
export const CONFIDENCE_SURE = 0.85;
export const CONFIDENCE_LIKELY = 0.6;
export const PLATE_PAD_X = 0.4; // AI boxes are imprecise → generous padding
export const PLATE_PAD_Y = 0.8;
export const PREVIEW_MAX_SIDE = 960;
export const PREVIEW_DEBOUNCE_MS = 150;
export const UPLOAD_MAX_SIDE = 1600;
export const DUPLICATE_HAMMING_MAX = 6;
export const NEAREST_PLACE_MAX_KM = 25;
export const FRESH_PHOTO_MS = 60 * 60 * 1000;
export const AI_CONSENT_VERSION = 1;
export const IDENTIFY_DAILY_LIMIT = 15; // must equal 20261110080000_identify_quota.sql
