import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { NoteRow } from '../../../../src/components/garage/NoteRow';
import { VerificationSteps } from '../../../../src/components/garage/VerificationSteps';
import { Screen } from '../../../../src/components/primitives/Screen';
import { Section } from '../../../../src/components/primitives/Section';
import { Stack } from '../../../../src/components/primitives/Stack';
import { StyledButton } from '../../../../src/components/StyledButton';
import { routes } from '../../../../src/constants/routes';
import { useOwnerCar } from '../../../../src/hooks/useOwnerCars';

/**
 * P0: explains the beta verification (the Redline team verifies owners by hand, SPEC D-3) as three
 * numbered steps with their progress. P1-14 adds VerificationCodeCard (useVerification) here.
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
    <Screen
      title={t('verify.title')}
      meta={isVerified ? t('garage.status_verified') : t('garage.status_pending')}
      testID="garage-verify-screen"
    >
      <Stack gap="lg" testID="verify-beta">
        <Section title={isVerified ? t('verify.verified_title') : t('verify.beta_title')}>
          <NoteRow
            text={isVerified ? t('verify.verified_description') : t('verify.beta_description')}
            divider={false}
          />
        </Section>
        <VerificationSteps
          title={t('verify.steps_title')}
          steps={[
            { key: 'add', title: t('verify.step_add_title'), body: t('verify.step_add_body'), state: 'done' },
            {
              key: 'check',
              title: t('verify.step_check_title'),
              body: t('verify.step_check_body'),
              state: isVerified ? 'done' : 'current',
            },
            {
              key: 'pings',
              title: t('verify.step_pings_title'),
              body: t('verify.step_pings_body'),
              state: isVerified ? 'done' : 'todo',
            },
          ]}
        />
        <StyledButton label={t('verify.back_to_car')} variant="secondary" onPress={back} testID="verify-back" />
      </Stack>
    </Screen>
  );
}
