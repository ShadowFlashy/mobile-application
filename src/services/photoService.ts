import { supabase } from '../lib/supabase';
import type { RedactedPhoto } from '../types/Spot';
import { toServiceError } from './serviceError';

const BUCKET = 'spot-photos';
/** Signed photo URLs stay valid for one hour; spots are refetched before that. */
const SIGNED_URL_SECONDS = 60 * 60;

async function toUploadBody(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  return response.arrayBuffer();
}

/** Storage path of a spot photo: every user only writes in their own folder (storage policy). */
export function spotPhotoPath(userId: string, spotId: string): string {
  return `${userId}/${spotId}.jpg`;
}

/** Uploads an already redacted photo. */
export async function uploadSpotPhoto(path: string, photo: RedactedPhoto): Promise<void> {
  const body = await toUploadBody(photo.uri);
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: photo.mimeType,
    upsert: false,
  });
  if (error) throw toServiceError(error, 'upload_photo');
}

export async function deleteSpotPhoto(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw toServiceError(error, 'delete_spot');
}

/** Removes every photo in the user's folder (used when the account is deleted). */
export async function deleteAllPhotosOfUser(userId: string): Promise<void> {
  const { data, error } = await supabase.storage.from(BUCKET).list(userId, { limit: 1000 });
  if (error) throw toServiceError(error, 'delete_account');
  const paths = data.map((file) => `${userId}/${file.name}`);
  if (paths.length === 0) return;
  const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths);
  if (removeError) throw toServiceError(removeError, 'delete_account');
}

/** Creates short-lived URLs for the private photos. Missing photos are left out of the map. */
export async function getSignedPhotoUrls(paths: string[]): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  if (paths.length === 0) return urls;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (error) return urls;
  for (const entry of data) {
    if (entry.path && entry.signedUrl) urls.set(entry.path, entry.signedUrl);
  }
  return urls;
}
