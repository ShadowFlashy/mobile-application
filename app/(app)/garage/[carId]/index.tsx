import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../../../src/components/ConfirmDialog';
import { GarageCarHeader } from '../../../../src/components/garage/GarageCarHeader';
import { VisibilityPicker } from '../../../../src/components/garage/VisibilityPicker';
import { EmptyState } from '../../../../src/components/primitives/EmptyState';
import { InputField } from '../../../../src/components/primitives/InputField';
import { Screen } from '../../../../src/components/primitives/Screen';
import { Section } from '../../../../src/components/primitives/Section';
import { Skeleton } from '../../../../src/components/primitives/Skeleton';
import { Stack } from '../../../../src/components/primitives/Stack';
import { Switch } from '../../../../src/components/primitives/Switch';
import { Text } from '../../../../src/components/primitives/Text';
import { StyledButton } from '../../../../src/components/StyledButton';
import { routes } from '../../../../src/constants/routes';
import { SHOUTOUT_MAX_LENGTH, useOwnerCarSettings } from '../../../../src/hooks/useOwnerCarForm';
import { formatDate } from '../../../../src/utils/formatDate';

/** Car settings: visibility, shout-out, pause pings, verification status and remove. */
export default function GarageCarScreen() {
  const { t, i18n } = useTranslation();
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const backToGarage = () => {
    if (router.canGoBack()) router.back();
    else router.replace(routes.owners);
  };
  const settings = useOwnerCarSettings(carId, { onRemoved: backToGarage });
  const { car } = settings;

  if (settings.isLoading) {
    return (
      <Screen testID="garage-car-screen">
        <Stack gap="md">
          <Skeleton preset="header" />
          <Skeleton preset="panel" />
        </Stack>
      </Screen>
    );
  }

  if (car === undefined) {
    return (
      <Screen testID="garage-car-screen">
        <EmptyState
          icon="car-outline"
          title={settings.loadError ?? t('garage.not_found_title')}
          description={settings.loadError === undefined ? t('garage.not_found_description') : undefined}
          action={
            settings.loadError !== undefined ? (
              <StyledButton label={t('common.try_again')} icon="refresh" onPress={settings.retry} />
            ) : (
              <StyledButton label={t('garage.back_to_garage')} variant="secondary" onPress={backToGarage} />
            )
          }
          testID="garage-car-missing"
        />
      </Screen>
    );
  }

  const isVerified = car.verification === 'verified';

  return (
    <Screen
      testID="garage-car-screen"
      footer={
        settings.isDirty ? (
          <StyledButton
            label={t('garage.save')}
            icon="checkmark"
            onPress={settings.save}
            isLoading={settings.isSaving}
            testID="save-car-settings"
          />
        ) : undefined
      }
    >
      <Stack gap="lg">
        <GarageCarHeader car={car} stats={settings.stats} />

        <Section title={t('garage.verification_section')} testID="garage-verification">
          {isVerified ? (
            <Text variant="body" testID="garage-verified-since">
              {t('garage.verified_since', { date: formatDate(car.verifiedAt ?? car.createdAt, i18n.language) })}
            </Text>
          ) : (
            <Text variant="body" tone="muted" testID="garage-pending-explanation">
              {t('garage.pending_explanation')}
            </Text>
          )}
          <StyledButton
            label={t('garage.verify_info')}
            icon="shield-checkmark-outline"
            variant="ghost"
            onPress={() => router.push(routes.garageVerify(car.id))}
            testID="garage-verify-link"
          />
        </Section>

        <Section title={t('garage.visibility_title')}>
          <VisibilityPicker
            value={settings.visibility}
            onChange={settings.setVisibility}
            needsPlate={settings.needsPlate}
            plate={settings.plate}
            onPlateChange={settings.setPlate}
            plateError={settings.plateError}
            isPending={!isVerified}
          />
          {settings.visibility !== 'hidden' && (
            <InputField
              label={t('garage.shoutout_label')}
              value={settings.shoutout}
              onChangeText={settings.setShoutout}
              placeholder={t('garage.shoutout_placeholder')}
              error={settings.shoutoutError}
              maxLength={SHOUTOUT_MAX_LENGTH}
              testID="owner-shoutout-input"
            />
          )}
        </Section>

        <Section title={t('garage.pings_section')}>
          <Switch
            label={t('garage.pause_label')}
            description={t('garage.pause_description')}
            value={car.pingsPaused}
            onChange={settings.setPingsPaused}
            testID="pause-pings-switch"
          />
        </Section>

        <StyledButton
          label={t('garage.remove')}
          icon="trash-outline"
          variant="danger"
          onPress={settings.removeDialog.open}
          testID="remove-car-button"
        />
      </Stack>

      <ConfirmDialog
        visible={settings.removeDialog.isOpen}
        title={t('garage.remove_title')}
        message={t('garage.remove_message')}
        confirmLabel={t('garage.remove_confirm')}
        destructive
        isLoading={settings.removeDialog.isPending}
        onConfirm={settings.removeDialog.confirm}
        onCancel={settings.removeDialog.cancel}
      />
    </Screen>
  );
}
