import type { User as SupabaseUser } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import type { User } from '../types/User';
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
  if (error) throw toServiceError(error, 'logout_failed');
}

/** The signed-in user restored from the persisted session, or undefined. */
export async function getCurrentUser(): Promise<User | undefined> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return undefined;
  return toUser(data.session.user);
}

/**
 * Right to erasure (GDPR): removes the user's photos, then their account. All rows of the user
 * (profile, spots, registered cars, pings) are deleted by the database through ON DELETE CASCADE.
 */
export async function deleteMyAccount(userId: string): Promise<void> {
  await deleteAllPhotosOfUser(userId);
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw toServiceError(error, 'delete_account');
  // The account no longer exists server-side; only clear the local session.
  await supabase.auth.signOut({ scope: 'local' });
}

export type AuthListener = (event: 'signed-in' | 'signed-out') => void;

/**
 * Notifies when a session starts (e.g. through an email confirmation link) or ends (logout,
 * revoked refresh token). Returns an unsubscribe function.
 */
export function onAuthChange(listener: AuthListener): () => void {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    // Supabase advises not to call other Supabase methods inside this callback: defer the work.
    if (event === 'SIGNED_OUT') setTimeout(() => listener('signed-out'), 0);
    if (event === 'SIGNED_IN') setTimeout(() => listener('signed-in'), 0);
  });
  return () => data.subscription.unsubscribe();
}
