import type { AiImage } from '../types/Identification';
import type { PickedPhoto } from '../types/Spot';

/**
 * The EXIF-free, ≤768 px JPEG for Co-Driver (native version). Canvas re-encoding only exists on the
 * web, so the native build returns undefined until December. F1 stub; W3 owns it.
 */
export async function readPhotoBytes(_uri: string): Promise<Uint8Array> {
  return new Uint8Array();
}

export async function prepareAiImage(_photo: PickedPhoto): Promise<AiImage | undefined> {
  return undefined;
}
