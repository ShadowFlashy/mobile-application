import * as ImagePicker from 'expo-image-picker';
import type { PickedPhoto } from '../types/Spot';
import { ServiceError } from './serviceError';

export type PhotoSource = 'camera' | 'library';

/**
 * Lets the user take or choose a photo of a car.
 * PWA: opens the phone camera or gallery through the browser file input (works in Android Chrome).
 * Native: asks the camera / photo permission at the moment it is needed (course ch. 9).
 * Returns undefined when the user cancels.
 */
export async function pickCarPhoto(source: PhotoSource): Promise<PickedPhoto | undefined> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new ServiceError(source === 'camera' ? 'camera_permission' : 'library_permission');
  }

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.9, exif: false };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled) return undefined;
  const asset = result.assets[0];
  if (asset === undefined) return undefined;
  return { uri: asset.uri, width: asset.width, height: asset.height };
}
