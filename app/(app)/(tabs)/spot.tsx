import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FormError } from '../../../src/components/brand/FormError';
import { AiStatusChips } from '../../../src/components/capture/AiStatusChips';
import { ShutterButton } from '../../../src/components/capture/ShutterButton';
import { Screen, Stack } from '../../../src/components/primitives';
import { PrivacyNotice } from '../../../src/components/PrivacyNotice';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useCapture } from '../../../src/hooks/useCapture';
import { useIdentifyQuota } from '../../../src/hooks/useIdentifyQuota';
import { useSettings } from '../../../src/hooks/useSettings';
import type { PhotoSource } from '../../../src/services/cameraService';

/**
 * The SPOT tab (SPEC §5, P0-03): a launcher with the camera shutter, the gallery button and the
 * Co-Driver status. Picking a photo opens the Pit Stop review (/capture) at once; EXIF, the AI image
 * and Co-Driver run in the background (useCapture).
 */
export default function SpotScreen() {
  const { t } = useTranslation();
  const capture = useCapture();
  const { settings } = useSettings();
  const quota = useIdentifyQuota();

  const open = async (source: PhotoSource) => {
    if (await capture.pick(source)) router.push(routes.capture);
  };

  return (
    <Screen testID="spot-screen">
      <Stack gap="lg">
        <ScreenHeader eyebrow={t('spot.eyebrow')} title={t('spot.title')} subtitle={t('spot.subtitle')} />
        <Stack gap="md" align="center">
          <ShutterButton onPress={() => void open('camera')} isLoading={capture.isPicking} testID="take-photo-button" />
          <StyledButton
            label={t('spot.gallery')}
            icon="images-outline"
            variant="secondary"
            onPress={() => void open('library')}
            disabled={capture.isPicking}
            accessibilityHint={t('spot.gallery_hint')}
            testID="choose-photo-button"
          />
          <AiStatusChips
            aiEnabled={settings.aiEnabled}
            autoLocation={settings.autoLocation}
            remaining={quota.data?.remaining}
            isOnline={capture.isOnline}
          />
        </Stack>
        <FormError message={capture.pickError} testID="spot-error" />
        <PrivacyNotice title={t('spot.privacy_title')}>{t('spot.privacy_body')}</PrivacyNotice>
      </Stack>
    </Screen>
  );
}
