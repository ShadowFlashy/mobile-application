/**
 * Supabase Edge Function `identify-car`.
 *
 * POST an EXIF-free JPEG (max 4 MB; the app sends ~768 px) with the user's session. The photo is sent
 * once to a vision model and the structured answer is returned: make, model, generation, years, body
 * style, colour, confidence, sticker-catalogue match, licence-plate boxes (so the app can pre-place
 * the blur) and the plate text (used once for owner pings, never stored). Nothing is stored here
 * except one row per call for the per-user daily limit.
 *
 * Providers — set in Dashboard → Edge Functions → Secrets; the keys never reach the app:
 * - Cloudflare Workers AI (free daily allowance, zero data retention): CLOUDFLARE_ACCOUNT_ID and
 *   CLOUDFLARE_API_TOKEN, optional CLOUDFLARE_AI_MODEL (default: Mistral Small 3.1, Apache-2.0).
 * - Mistral AI API: MISTRAL_API_KEY, optional MISTRAL_MODEL.
 */
import { encodeBase64 } from 'jsr:@std/encoding@1/base64';
import { createClient } from 'npm:@supabase/supabase-js@2';

import {
  buildInstructions,
  IDENTIFICATION_SCHEMA,
  jpegSize,
  parseIdentification,
  SYSTEM_PROMPT,
  type CatalogueEntry,
} from './identification.ts';

const CLOUDFLARE_DEFAULT_MODEL = '@cf/mistralai/mistral-small-3.1-24b-instruct';
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_DEFAULT_MODEL = 'mistral-large-latest';
const MAX_BYTES = 4 * 1024 * 1024;
const TIMEOUT_MS = 30_000;
/** A Cloudflare account id is 32 hex characters; anything else (e.g. a pasted API token) is rejected unused. */
const CLOUDFLARE_ACCOUNT_ID = /^[0-9a-f]{32}$/i;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ProviderAnswer = { ok: true; text: string } | { ok: false; status: number; error: string };

const NOT_CONFIGURED: ProviderAnswer = { ok: false, status: 503, error: 'not_configured' };
const BUSY: ProviderAnswer = { ok: false, status: 429, error: 'provider_busy' };
const FAILED: ProviderAnswer = { ok: false, status: 502, error: 'provider_error' };

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Provider errors can echo request details (URLs, ids, sometimes credentials). Logs only ever get
 * the status and a redacted, shortened message: long token-like strings are masked.
 */
function redact(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return text.replace(/[A-Za-z0-9_\-.]{16,}/g, '[redacted]').slice(0, 300);
}

/** The project's publishable key (new key system) or the legacy anon key. */
function publishableKey(): string {
  const keys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  if (keys) {
    try {
      const parsed: unknown = JSON.parse(keys);
      if (isRecord(parsed) && typeof parsed.default === 'string') return parsed.default;
    } catch {
      // fall back to the legacy key below
    }
  }
  return Deno.env.get('SUPABASE_ANON_KEY') ?? '';
}

function toCatalogue(rows: unknown): CatalogueEntry[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row: unknown) =>
    isRecord(row) && typeof row.id === 'string' && typeof row.make === 'string' && typeof row.model === 'string'
      ? [{ id: row.id, make: row.make, model: row.model }]
      : [],
  );
}

/** Models sometimes wrap JSON in prose or code fences: keep the outermost object. */
function extractJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('no JSON object in the answer');
  return JSON.parse(text.slice(start, end + 1));
}

function withSchema(prompt: string): string {
  return `${prompt}\n\nAnswer with one JSON object matching this JSON schema:\n${JSON.stringify(IDENTIFICATION_SCHEMA)}`;
}

function userContent(text: string, imageUrl: string) {
  return [
    { type: 'text', text },
    { type: 'image_url', image_url: { url: imageUrl } },
  ];
}

/** Cloudflare returns { result: { response } } where response is a string or, with guided_json, an object. */
function cloudflareText(payload: unknown): string {
  if (!isRecord(payload) || !isRecord(payload.result)) return '';
  const response = payload.result.response;
  if (typeof response === 'string') return response;
  return isRecord(response) ? JSON.stringify(response) : '';
}

/** Mistral returns the message content as a string or as a list of text chunks. */
function mistralText(payload: unknown): string {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) return '';
  const first: unknown = payload.choices[0];
  if (!isRecord(first) || !isRecord(first.message)) return '';
  const content = first.message.content;
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((chunk: unknown) => (isRecord(chunk) && typeof chunk.text === 'string' ? chunk.text : ''))
    .join('');
}

async function post(url: string, token: string, body: Record<string, unknown>): Promise<Response | undefined> {
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error('identify-car: provider unreachable', redact(String(error)));
    return undefined;
  }
}

/** Cloudflare Workers AI. First with guided_json (schema-constrained), then once with the schema in the prompt. */
async function askCloudflare(
  accountId: string,
  token: string,
  prompt: string,
  imageUrl: string,
): Promise<ProviderAnswer> {
  const model = Deno.env.get('CLOUDFLARE_AI_MODEL') ?? CLOUDFLARE_DEFAULT_MODEL;
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
  for (const guided of [true, false]) {
    const response = await post(url, token, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent(guided ? prompt : withSchema(prompt), imageUrl) },
      ],
      max_tokens: 1200,
      temperature: 0.1,
      ...(guided ? { guided_json: IDENTIFICATION_SCHEMA } : {}),
    });
    if (!response) return { ok: false, status: 504, error: 'provider_unreachable' };
    if (response.status === 401 || response.status === 403) {
      console.error('identify-car: Cloudflare rejected the account id / API token');
      return NOT_CONFIGURED;
    }
    if (response.status === 429) return BUSY;
    const payload: unknown = await response.json().catch(() => undefined);
    const text = response.ok ? cloudflareText(payload) : '';
    if (text) return { ok: true, text };
    console.error('identify-car: Cloudflare error', response.status, redact(payload));
  }
  return FAILED;
}

/** Mistral AI API. First with a strict JSON schema, then once in plain JSON mode. */
async function askMistral(apiKey: string, prompt: string, imageUrl: string): Promise<ProviderAnswer> {
  const formats = [
    { type: 'json_schema', json_schema: { name: 'car_identification', schema: IDENTIFICATION_SCHEMA, strict: true } },
    { type: 'json_object' },
  ];
  for (const [attempt, responseFormat] of formats.entries()) {
    const response = await post(MISTRAL_URL, apiKey, {
      model: Deno.env.get('MISTRAL_MODEL') ?? MISTRAL_DEFAULT_MODEL,
      temperature: 0.1,
      max_tokens: 1500,
      response_format: responseFormat,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent(attempt === 0 ? prompt : withSchema(prompt), imageUrl) },
      ],
    });
    if (!response) return { ok: false, status: 504, error: 'provider_unreachable' };
    if (response.status === 401 || response.status === 403) {
      console.error('identify-car: Mistral rejected MISTRAL_API_KEY');
      return NOT_CONFIGURED;
    }
    if (response.status === 429) return BUSY;
    const payload: unknown = await response.json().catch(() => undefined);
    const text = response.ok ? mistralText(payload) : '';
    if (text) return { ok: true, text };
    console.error('identify-car: Mistral error', response.status, redact(payload));
  }
  return FAILED;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' });

  const authorization = request.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) return reply(401, { error: 'unauthorized' });

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', publishableKey(), {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // The gateway already verified the JWT; this also checks the session is still valid with Supabase
  // Auth, so anonymous callers stop here before the photo is read or sent anywhere.
  const session = await supabase.auth.getUser(authorization.slice('Bearer '.length));
  if (session.error || !session.data.user) return reply(401, { error: 'unauthorized' });

  const cloudflareAccount = Deno.env.get('CLOUDFLARE_ACCOUNT_ID') ?? '';
  const cloudflareToken = Deno.env.get('CLOUDFLARE_API_TOKEN') ?? '';
  const mistralKey = Deno.env.get('MISTRAL_API_KEY') ?? '';
  const useCloudflare = cloudflareAccount.length > 0 && cloudflareToken.length > 0;
  if (!useCloudflare && mistralKey.length === 0) return reply(503, { error: 'not_configured' });
  if (useCloudflare && !CLOUDFLARE_ACCOUNT_ID.test(cloudflareAccount)) {
    console.error('identify-car: CLOUDFLARE_ACCOUNT_ID must be the 32-character account id, not an API token');
    return reply(503, { error: 'not_configured' });
  }

  const image = new Uint8Array(await request.arrayBuffer());
  if (image.byteLength > MAX_BYTES) return reply(413, { error: 'image_too_large' });
  const size = jpegSize(image);
  if (!size) return reply(415, { error: 'bad_image' });

  // Per-user daily limit, counted in Postgres under the caller's own session.
  const quota = await supabase.rpc('consume_identify_quota');
  if (quota.error) {
    return quota.error.message.includes('quota_exceeded')
      ? reply(429, { error: 'quota_exceeded' })
      : reply(401, { error: 'unauthorized' });
  }
  const remainingToday = typeof quota.data === 'number' ? quota.data : 0;

  const models = await supabase.from('car_models').select('id, make, model');
  const prompt = buildInstructions(toCatalogue(models.data), size.width, size.height);
  const imageUrl = `data:image/jpeg;base64,${encodeBase64(image)}`;

  const answer = useCloudflare
    ? await askCloudflare(cloudflareAccount, cloudflareToken, prompt, imageUrl)
    : await askMistral(mistralKey, prompt, imageUrl);
  if (!answer.ok) return reply(answer.status, { error: answer.error });

  try {
    const identification = parseIdentification(extractJson(answer.text), toCatalogue(models.data));
    return reply(200, { ...identification, provider: useCloudflare ? 'cloudflare' : 'mistral', remainingToday });
  } catch (error) {
    // The answer itself is not logged: it can contain plate text.
    console.error('identify-car: unusable answer', error instanceof Error ? error.message : 'parse error');
    return reply(502, { error: 'provider_error' });
  }
});
