import { isAuthRetryableFetchError, type User as SupabaseUser } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { SECOND } from '../constants/time';
import { authStorage } from '../lib/authStorage';
import { AUTH_STORAGE_KEY, supabase } from '../lib/supabase';
import type { User } from '../types/User';
import { parseStoredSession } from '../utils/storedSession';
import { deleteAllPhotosOfUser } from './photoService';
import { getProfileUsername } from './profileService';
import { ServiceError, toServiceError } from './serviceError';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  /** Set when the account can be used right away. */
  user?: User;
  /** True when Supabase first sent a confirmation email. */
  needsEmailConfirmation: boolean;
}

function readMetadataUsername(authUser: SupabaseUser): string | undefined {
  const value: unknown = authUser.user_metadata.username;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

async function toUser(authUser: SupabaseUser): Promise<User> {
  const email = authUser.email ?? '';
  const username =
    (await getProfileUsername(authUser.id)) ?? readMetadataUsername(authUser) ?? email.split('@')[0] ?? 'spotter';
  return { id: authUser.id, email, name: username };
}

/** Maps Supabase Auth errors to translated messages. Technical details are never shown. */
function toAuthError(error: unknown, fallback: 'login_failed' | 'register_failed'): ServiceError {
  const message = typeof error === 'object' && error !== null ? String(Reflect.get(error, 'message')) : '';
  if (/invalid login credentials/i.test(message)) return new ServiceError('invalid_credentials');
  if (/email not confirmed/i.test(message)) return new ServiceError('email_not_confirmed');
  if (/already registered|already been registered|already exists/i.test(message))
    return new ServiceError('email_taken');
  if (/rate limit|too many/i.test(message)) return new ServiceError('rate_limited');
  if (/password/i.test(message)) return new ServiceError('weak_password');
  return toServiceError(error, fallback);
}

/**
 * Signs in with email and password through Supabase Auth (the identity provider handles
 * hashing, brute-force protection and token rotation, course ch. 7).
 */
export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw toAuthError(error, 'login_failed');
  return toUser(data.user);
}

export async function register(input: RegisterInput): Promise<RegisterResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: { username: input.username.trim() },
      emailRedirectTo: Linking.createURL('/login'),
    },
  });
  if (error) throw toAuthError(error, 'register_failed');
  if (data.session && data.user) {
    return { user: await toUser(data.user), needsEmailConfirmation: false };
  }
  return { needsEmailConfirmation: true };
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (!error) return;
  if (isConnectionFailure(error)) {
    // Offline: the server-side refresh token cannot be revoked now, but this device signs out anyway.
    await supabase.auth.signOut({ scope: 'local' });
    return;
  }
  throw toServiceError(error, 'logout_failed');
}

/** The session restored on app start. */
export interface RestoredSession {
  user?: User;
  /**
   * True when the session could not be refreshed because the device is offline and the user was
   * read from the session stored on this device: the app then shows its cached data read-only.
   */
  isOffline: boolean;
}

/**
 * How long app start waits for Supabase to refresh an expired session before it opens offline on
 * the stored session (Supabase keeps refreshing in the background and reports TOKEN_REFRESHED).
 */
const SESSION_RESTORE_PATIENCE_MS = 5 * SECOND;

/** True for a failure that says "no network" rather than "this session is not valid". */
function isConnectionFailure(error: unknown): boolean {
  if (isAuthRetryableFetchError(error)) return true;
  if (error instanceof TypeError) return true; // fetch() rejects with a TypeError when offline
  const status: unknown = typeof error === 'object' && error !== null ? Reflect.get(error, 'status') : undefined;
  return typeof status === 'number' && (status === 0 || status >= 500);
}

/** The user of the session stored on this device, without any network call. */
async function readStoredUser(): Promise<User | undefined> {
  try {
    return parseStoredSession(await authStorage.getItem(AUTH_STORAGE_KEY))?.user;
  } catch {
    return undefined;
  }
}

/**
 * Restores the session on app start (SPEC §13.3). Online this is Supabase's own session. When the
 * access token expired and the refresh fails only because the device is offline, the user is read
 * from the stored session instead (`isOffline: true`), so the persisted album still opens; Supabase
 * keeps that session and refreshes it as soon as the network is back (TOKEN_REFRESHED).
 */
export async function restoreSession(): Promise<RestoredSession> {
  const online = (async (): Promise<RestoredSession | 'offline'> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) return { user: await toUser(data.session.user), isOffline: false };
      return error && isConnectionFailure(error) ? 'offline' : { isOffline: false };
    } catch (error) {
      if (!isConnectionFailure(error)) throw error;
      return 'offline';
    }
  })();
  // Never an unhandled rejection when the stored session already answered.
  online.catch(() => undefined);
  // Offline, Supabase keeps retrying the refresh for up to 30 s: do not keep the user on a spinner.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const slow = new Promise<'slow'>((resolve) => {
    timer = setTimeout(() => resolve('slow'), SESSION_RESTORE_PATIENCE_MS);
  });
  try {
    const first = await Promise.race([online, slow]);
    if (first !== 'slow' && first !== 'offline') return first;
    const user = await readStoredUser();
    if (user !== undefined) return { user, isOffline: true };
    // Nothing stored to fall back on: wait for Supabase's own answer after all.
    const settled = first === 'slow' ? await online : first;
    return settled === 'offline' ? { isOffline: false } : settled;
  } finally {
    clearTimeout(timer);
  }
}

/** The signed-in user restored from the persisted session (or, offline, from the stored session). */
export async function getCurrentUser(): Promise<User | undefined> {
  return (await restoreSession()).user;
}

/**
 * The shared demo account (its password is in the README for graders). The database refuses to
 * delete it (`delete_my_account`); this client check only makes sure its photos are not removed
 * before that refusal.
 */
const DEMO_EMAIL = 'demo@redline.test';

/**
 * Right to erasure (GDPR): removes the user's photos page by page, then their account. All rows of
 * the user (profile, spots, registered cars, sightings) are deleted by the database through
 * ON DELETE CASCADE. The demo account gets `demo_protected` and keeps everything.
 */
export async function deleteMyAccount(userId: string): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user.email?.toLowerCase() === DEMO_EMAIL) throw new ServiceError('demo_protected');
  await deleteAllPhotosOfUser(userId);
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw toServiceError(error, 'delete_account');
  // The account no longer exists server-side; only clear the local session.
  await supabase.auth.signOut({ scope: 'local' });
}

export type AuthEvent = 'signed-in' | 'signed-out' | 'token-refreshed';
export type AuthListener = (event: AuthEvent) => void;

/**
 * Notifies when a session starts (e.g. through an email confirmation link), is refreshed (for
 * example when the network is back after an offline start) or ends (logout, revoked refresh token).
 * Returns an unsubscribe function.
 */
export function onAuthChange(listener: AuthListener): () => void {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    // Supabase advises not to call other Supabase methods inside this callback: defer the work.
    if (event === 'SIGNED_OUT') setTimeout(() => listener('signed-out'), 0);
    if (event === 'SIGNED_IN') setTimeout(() => listener('signed-in'), 0);
    if (event === 'TOKEN_REFRESHED') setTimeout(() => listener('token-refreshed'), 0);
  });
  return () => data.subscription.unsubscribe();
}
