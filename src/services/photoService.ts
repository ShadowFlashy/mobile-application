import { supabase } from '../lib/supabase';
import type { RedactedPhoto } from '../types/Spot';
import { dataUriToArrayBuffer } from '../utils/dataUri';
import { toServiceError } from './serviceError';

const BUCKET = 'spot-photos';
/** Signed photo URLs stay valid for one hour; spots are refetched before that. */
const SIGNED_URL_SECONDS = 60 * 60;

/**
 * The upload body. The PWA's redacted photo is a `data:` URI and is decoded locally (the CSP does not
 * let fetch read data: or blob: URIs); the Android build's file:// photo is read with fetch.
 */
async function toUploadBody(uri: string): Promise<ArrayBuffer> {
  const decoded = dataUriToArrayBuffer(uri);
  if (decoded !== undefined) return decoded;
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

/** Page size of the storage listing used when an account is deleted. */
const LIST_PAGE_SIZE = 100;

/**
 * Removes every photo in the user's folder (used when the account is deleted). The folder is listed
 * in pages of 100 until it is empty, so accounts with more than 1000 photos are erased completely.
 */
export async function deleteAllPhotosOfUser(userId: string): Promise<void> {
  // First list every page (removing while listing would shift the offsets), then remove per page.
  const paths: string[] = [];
  for (let offset = 0; ; offset += LIST_PAGE_SIZE) {
    const { data, error } = await supabase.storage.from(BUCKET).list(userId, { limit: LIST_PAGE_SIZE, offset });
    if (error) throw toServiceError(error, 'delete_account');
    paths.push(...data.map((file) => `${userId}/${file.name}`));
    if (data.length < LIST_PAGE_SIZE) break;
  }
  for (let start = 0; start < paths.length; start += LIST_PAGE_SIZE) {
    const { error } = await supabase.storage.from(BUCKET).remove(paths.slice(start, start + LIST_PAGE_SIZE));
    if (error) throw toServiceError(error, 'delete_account');
  }
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

/** One short-lived URL for a private photo, or undefined when it cannot be signed. */
export async function getSignedPhotoUrl(path: string): Promise<string | undefined> {
  const urls = await getSignedPhotoUrls([path]);
  return urls.get(path);
}
