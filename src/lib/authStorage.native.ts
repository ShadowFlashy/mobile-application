import type { SupportedStorage } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

/**
 * Where the Supabase session is persisted — native (Android) version.
 *
 * Tokens are sensitive, so they go into secure storage (Android Keystore via expo-secure-store),
 * never into plain AsyncStorage. SecureStore values should stay small, so long sessions are split
 * into chunks.
 */
const CHUNK_SIZE = 1800;

function chunkCountKey(key: string): string {
  return `${key}.chunks`;
}

function chunkKey(key: string, index: number): string {
  return `${key}.${index}`;
}

async function removeItem(key: string): Promise<void> {
  const countValue = await SecureStore.getItemAsync(chunkCountKey(key));
  const count = countValue === null ? 0 : Number(countValue);
  for (let index = 0; index < count; index += 1) {
    await SecureStore.deleteItemAsync(chunkKey(key, index));
  }
  await SecureStore.deleteItemAsync(chunkCountKey(key));
}

async function setItem(key: string, value: string): Promise<void> {
  await removeItem(key);
  const chunks: string[] = [];
  for (let start = 0; start < value.length; start += CHUNK_SIZE) {
    chunks.push(value.slice(start, start + CHUNK_SIZE));
  }
  for (const [index, chunk] of chunks.entries()) {
    await SecureStore.setItemAsync(chunkKey(key, index), chunk);
  }
  await SecureStore.setItemAsync(chunkCountKey(key), String(chunks.length));
}

// Returns null (not undefined) when nothing is stored: that is the Storage contract Supabase expects.
async function getItem(key: string): Promise<string | null> {
  const countValue = await SecureStore.getItemAsync(chunkCountKey(key));
  if (countValue === null) return null;
  const parts: string[] = [];
  for (let index = 0; index < Number(countValue); index += 1) {
    const part = await SecureStore.getItemAsync(chunkKey(key, index));
    if (part === null) return null;
    parts.push(part);
  }
  return parts.join('');
}

export const authStorage: SupportedStorage = { getItem, setItem, removeItem };
