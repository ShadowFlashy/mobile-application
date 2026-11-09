import { supabase } from '../lib/supabase';

/** Username of a profile, or undefined when the profile could not be read. */
export async function getProfileUsername(userId: string): Promise<string | undefined> {
  const { data, error } = await supabase.from('profiles').select('username').eq('id', userId).maybeSingle();
  if (error || !data) return undefined;
  return data.username;
}
