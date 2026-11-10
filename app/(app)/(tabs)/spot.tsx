import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FormError } from '../../../src/components/brand/FormError';
import { AiStatusChips } from '../../../src/components/capture/AiStatusChips';
import { Screen, Stack, Text } from '../../../src/components/primitives';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useCapture } from '../../../src/hooks/useCapture';
import { useIdentifyQuota } from '../../../src/hooks/useIdentifyQuota';
import { useSettings } from '../../../src/hooks/useSettings';
import type { PhotoSource } from '../../../src/services/cameraService';

/**
 * The Spot tab (SPEC §5, P0-03): "Take a photo" (the screen's one red action), "Choose from
 * gallery", the auto-fill status as a meta line and one privacy line. Picking a photo opens the New
 * spot review (/capture) at once; EXIF, the AI image and auto-fill run in the background (useCapture).
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
    <Screen title={t('spot.title')} testID="spot-screen">
      <Stack gap="lg">
        <Stack gap="smd">
          <StyledButton
            label={t('spot.shutter_label')}
            icon="camera"
            onPress={() => void open('camera')}
            isLoading={capture.isPicking}
            accessibilityHint={t('spot.shutter_hint')}
            testID="take-photo-button"
          />
          <StyledButton
            label={t('spot.gallery')}
            icon="images"
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
        <Text variant="meta" tone="text2" testID="spot-privacy">
          {t('spot.privacy_body')}
        </Text>
      </Stack>
    </Screen>
  );
}
