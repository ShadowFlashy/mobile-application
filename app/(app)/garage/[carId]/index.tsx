import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../../../src/components/ConfirmDialog';
import { GarageCarHeader } from '../../../../src/components/garage/GarageCarHeader';
import { NoteRow } from '../../../../src/components/garage/NoteRow';
import { SightingRow } from '../../../../src/components/garage/SightingRow';
import { VanityPlate } from '../../../../src/components/garage/VanityPlate';
import { VisibilityPicker } from '../../../../src/components/garage/VisibilityPicker';
import { EmptyState } from '../../../../src/components/primitives/EmptyState';
import { InputField } from '../../../../src/components/primitives/InputField';
import { ListRow } from '../../../../src/components/primitives/ListRow';
import { Screen } from '../../../../src/components/primitives/Screen';
import { Section } from '../../../../src/components/primitives/Section';
import { Skeleton } from '../../../../src/components/primitives/Skeleton';
import { Stack } from '../../../../src/components/primitives/Stack';
import { Switch } from '../../../../src/components/primitives/Switch';
import { StyledButton } from '../../../../src/components/StyledButton';
import { routes } from '../../../../src/constants/routes';
import { SHOUTOUT_MAX_LENGTH, useOwnerCarSettings } from '../../../../src/hooks/useOwnerCarForm';
import { useSightings } from '../../../../src/hooks/usePings';
import { formatDate } from '../../../../src/utils/formatDate';
import { maskPlateHint } from '../../../../src/utils/plate';

/** Sightings of this car shown on its settings screen; the full feed is on the Garage tab. */
const CAR_SIGHTINGS_SHOWN = 5;

/** Car settings: the car, verification, what spotters see, its sightings, pause pings and remove. */
export default function GarageCarScreen() {
  const { t, i18n } = useTranslation();
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const backToGarage = () => {
    if (router.canGoBack()) router.back();
    else router.replace(routes.owners);
  };
  const settings = useOwnerCarSettings(carId, { onRemoved: backToGarage });
  const feed = useSightings();
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
          icon="car"
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
  const carSightings = feed.sightings
    .filter((sighting) => sighting.ownerCarId === car.id)
    .slice(0, CAR_SIGHTINGS_SHOWN);

  return (
    <Screen
      testID="garage-car-screen"
      footer={
        settings.isDirty ? (
          <StyledButton
            label={t('garage.save')}
            onPress={settings.save}
            isLoading={settings.isSaving}
            testID="save-car-settings"
          />
        ) : undefined
      }
    >
      <Stack gap="lg">
        <GarageCarHeader car={car} stats={settings.stats} />

        <Section title={t('garage.car_section')} testID="garage-car-details">
          <ListRow
            kind="detail"
            title={t('garage.nickname_row')}
            value={car.nickname ?? t('garage.stat_none')}
            testID="garage-car-nickname"
          />
          {car.visibility === 'vanity' && car.plateDisplay !== undefined ? (
            <ListRow
              kind="detail"
              title={t('garage.plate_row')}
              trailing={<VanityPlate plate={car.plateDisplay} testID="garage-car-header-plate" />}
            />
          ) : (
            <ListRow kind="detail" title={t('garage.plate_row')} value={maskPlateHint(car.plateHint)} />
          )}
        </Section>

        <Section title={t('garage.verification_section')} testID="garage-verification">
          {isVerified ? (
            <NoteRow
              tone="text"
              text={t('garage.verified_since', { date: formatDate(car.verifiedAt ?? car.createdAt, i18n.language) })}
              testID="garage-verified-since"
            />
          ) : (
            <NoteRow text={t('garage.pending_explanation')} testID="garage-pending-explanation" />
          )}
          <ListRow
            title={t('garage.verify_info')}
            chevron
            onPress={() => router.push(routes.garageVerify(car.id))}
            testID="garage-verify-link"
          />
        </Section>

        <Section title={t('garage.visibility_title')}>
          <Stack gap="md">
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
          </Stack>
        </Section>

        {isVerified && (
          <Section
            title={t('garage.sightings_section')}
            meta={
              settings.stats?.lastCity !== undefined
                ? t('garage.last_seen', { city: settings.stats.lastCity })
                : undefined
            }
            testID="garage-car-sightings"
          >
            {carSightings.length === 0 ? (
              <NoteRow text={t('garage.no_car_sightings')} testID="garage-car-no-sightings" />
            ) : (
              carSightings.map((sighting) => (
                <SightingRow
                  key={sighting.id}
                  sighting={sighting}
                  onPress={() => router.push(routes.sighting(sighting.id))}
                />
              ))
            )}
          </Section>
        )}

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
          icon="trash"
          variant="text"
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
