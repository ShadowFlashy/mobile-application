import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { AI_HARD_TIMEOUT_MS, IDENTIFY_DAILY_LIMIT, IDENTIFY_FUNCTION } from '../constants/ai';
import { supabase } from '../lib/supabase';
import type { AiImage, IdentifyOutcome, IdentifyQuota, VerifyOutcome } from '../types/Identification';
import { IDENTIFY_UNAVAILABLE_ERROR, outcomeForHttpError, parseIdentifyResponse } from '../utils/identification';
import { toServiceError } from './serviceError';

/**
 * Auto-fill client of the deployed, frozen `identify-car` Edge Function (SPEC §9).
 *
 * - Sends only the EXIF-free ≤768 px JPEG from `prepareAiImage`, with the user's JWT (no custom headers).
 * - Never throws: every answer, HTTP error, network failure, unparseable body and the 35 s hard stop
 *   becomes an `IdentifyOutcome`, so the capture screen can always continue in manual mode.
 * - Nothing is logged, cached or persisted here: the answer can contain plate text.
 */

const OFFLINE: IdentifyOutcome = { status: 'unavailable', reason: 'offline' };
const TIMEOUT: IdentifyOutcome = { status: 'unavailable', reason: 'timeout' };

/**
 * True only when the platform positively reports no connection. Feature-detected, so it is safe on
 * every platform: React Native has no `navigator.onLine` and is then treated as online.
 */
function isDeviceOffline(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && !navigator.onLine;
}

/** The `{ "error": code }` body and status of a FunctionsHttpError, read without trusting its shape. */
async function readHttpError(error: FunctionsHttpError): Promise<IdentifyOutcome> {
  const context: unknown = error.context;
  if (!(context instanceof Response)) return IDENTIFY_UNAVAILABLE_ERROR;
  const body: unknown = await context.json().catch(() => undefined);
  return outcomeForHttpError(context.status, body);
}

async function callIdentify(image: AiImage, signal: AbortSignal): Promise<IdentifyOutcome> {
  try {
    const { data, error } = await supabase.functions.invoke<unknown>(IDENTIFY_FUNCTION, {
      body: image.blob,
      headers: { 'Content-Type': 'image/jpeg' },
      signal,
    });
    if (signal.aborted) return TIMEOUT;
    if (error === null) return parseIdentifyResponse(data);
    if (error instanceof FunctionsHttpError) return await readHttpError(error);
    if (error instanceof FunctionsFetchError) return OFFLINE;
    if (error instanceof FunctionsRelayError) return IDENTIFY_UNAVAILABLE_ERROR;
    return IDENTIFY_UNAVAILABLE_ERROR;
  } catch {
    return signal.aborted ? TIMEOUT : IDENTIFY_UNAVAILABLE_ERROR;
  }
}

/**
 * Asks Auto-fill to identify the car. Offline there is no call at all. After AI_HARD_TIMEOUT_MS
 * (35 s; the provider gives up at 30 s) the request is aborted and the outcome is `timeout`,
 * even if the network layer ignores the abort.
 */
export async function identifyCar(image: AiImage): Promise<IdentifyOutcome> {
  if (isDeviceOffline()) return OFFLINE;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const hardStop = new Promise<IdentifyOutcome>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve(TIMEOUT);
    }, AI_HARD_TIMEOUT_MS);
  });
  try {
    return await Promise.race([callIdentify(image, controller.signal), hardStop]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/** Auto-fill identifications left today (15/day per user), from the read-only `identify_quota_status` RPC. */
export async function getIdentifyQuota(): Promise<IdentifyQuota> {
  const { data, error } = await supabase.rpc('identify_quota_status');
  if (error !== null) throw toServiceError(error, 'generic');
  const row = Array.isArray(data) ? data[0] : undefined;
  if (row === undefined) return { remaining: IDENTIFY_DAILY_LIMIT, dailyLimit: IDENTIFY_DAILY_LIMIT };
  const dailyLimit = Number.isFinite(row.daily_limit) && row.daily_limit > 0 ? row.daily_limit : IDENTIFY_DAILY_LIMIT;
  const remaining = Number.isFinite(row.remaining) ? Math.min(Math.max(0, row.remaining), dailyLimit) : dailyLimit;
  return { remaining, dailyLimit };
}

/**
 * P1: automated owner verification through the separate `verify-owner` function (§9.6). Not built
 * tonight (it needs the user's go-ahead to deploy a second function), so it reports `not_configured`.
 */
export async function verifyOwnerCar(_carId: string, _image: AiImage): Promise<VerifyOutcome> {
  return { status: 'unavailable', reason: 'not_configured' };
}
