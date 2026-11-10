import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../../src/components/primitives/EmptyState';
import { Screen } from '../../../../src/components/primitives/Screen';
import { StyledButton } from '../../../../src/components/StyledButton';
import { routes } from '../../../../src/constants/routes';
import { useOwnerCar } from '../../../../src/hooks/useOwnerCars';

/**
 * P0: explains the beta verification (the Redline team verifies owners by hand, SPEC D-3).
 * P1-14 replaces it with VerificationSteps, VerificationCodeCard (useVerification) and the result.
 */
export default function GarageVerifyScreen() {
  const { t } = useTranslation();
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const { car } = useOwnerCar(carId);
  const isVerified = car?.verification === 'verified';

  const back = () => {
    if (router.canGoBack()) router.back();
    else if (carId !== undefined) router.replace(routes.garageCar(carId));
    else router.replace(routes.owners);
  };

  return (
    <Screen testID="garage-verify-screen">
      <EmptyState
        icon={isVerified ? 'shield-checkmark' : 'shield-half-outline'}
        title={isVerified ? t('verify.verified_title') : t('verify.beta_title')}
        description={isVerified ? t('verify.verified_description') : t('verify.beta_description')}
        action={<StyledButton label={t('verify.back_to_car')} variant="secondary" onPress={back} />}
        testID="verify-beta"
      />
    </Screen>
  );
}
