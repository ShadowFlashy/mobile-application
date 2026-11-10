import type { User } from '../types/User';
import { isRecord } from './typeGuards';

/** What the offline fallback needs from a session that Supabase persisted on this device. */
export interface StoredSessionUser {
  user: User;
  /** Expiry of the stored access token (ISO), when the session says so. */
  expiresAt?: string;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Reads the user out of the session JSON that Supabase Auth stores under `AUTH_STORAGE_KEY`
 * (SPEC §13.3, offline session). Used only when the session cannot be refreshed because the device
 * is offline, so the persisted album can still be shown read-only. Tokens are never returned.
 * Accepts the current shape (`{ access_token, user, expires_at }`) and the older
 * `{ currentSession: { … } }` wrapper. Returns undefined for anything else, including corrupt JSON.
 */
export function parseStoredSession(raw: string | null | undefined): StoredSessionUser | undefined {
  if (raw === null || raw === undefined || raw.length === 0) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!isRecord(parsed)) return undefined;
  const session = isRecord(parsed.currentSession) ? parsed.currentSession : parsed;
  const authUser = session.user;
  if (!isRecord(authUser)) return undefined;
  // A stored session always carries a refresh token; without one it can never be revalidated.
  if (readString(session, 'refresh_token') === undefined) return undefined;

  const id = readString(authUser, 'id');
  if (id === undefined) return undefined;
  const email = readString(authUser, 'email') ?? '';
  const metadata = isRecord(authUser.user_metadata) ? authUser.user_metadata : {};
  const name = readString(metadata, 'username') ?? email.split('@')[0] ?? '';

  const expiresAtSeconds = session.expires_at;
  const expiresAt =
    typeof expiresAtSeconds === 'number' && Number.isFinite(expiresAtSeconds)
      ? new Date(expiresAtSeconds * 1000).toISOString()
      : undefined;

  return { user: { id, email, name: name.length > 0 ? name : 'spotter' }, expiresAt };
}
