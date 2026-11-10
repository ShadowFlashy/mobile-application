import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SightingDetail } from '../../../src/components/garage/SightingDetail';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Screen } from '../../../src/components/primitives/Screen';
import { Skeleton } from '../../../src/components/primitives/Skeleton';
import { Stack } from '../../../src/components/primitives/Stack';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useOpenSighting } from '../../../src/hooks/usePings';
import { getErrorMessage } from '../../../src/services/serviceError';

/** One sighting snapshot (blurred photo, car, city, hour window). Opening it marks it read. */
export default function SightingScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sighting, isLoading, isError, error, refetch } = useOpenSighting(id);

  const backToGarage = () => {
    if (router.canGoBack()) router.back();
    else router.replace(routes.owners);
  };

  if (isLoading) {
    return (
      <Screen testID="sighting-screen">
        <Stack gap="md">
          <Skeleton preset="photo" />
          <Skeleton preset="board" />
        </Stack>
      </Screen>
    );
  }

  if (sighting === undefined) {
    return (
      <Screen testID="sighting-screen">
        <EmptyState
          icon="eye-off-outline"
          title={isError ? getErrorMessage(error, 'load_sightings') : t('sightings.not_found_title')}
          description={isError ? undefined : t('sightings.not_found_description')}
          action={
            isError ? (
              <StyledButton label={t('common.try_again')} icon="refresh" onPress={() => void refetch()} />
            ) : (
              <StyledButton label={t('garage.back_to_garage')} variant="secondary" onPress={backToGarage} />
            )
          }
          testID="sighting-missing"
        />
      </Screen>
    );
  }

  return (
    <Screen testID="sighting-screen">
      <SightingDetail sighting={sighting} />
    </Screen>
  );
}
