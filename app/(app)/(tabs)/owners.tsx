import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../../src/components/ConfirmDialog';
import { OwnerCarCard } from '../../../src/components/OwnerCarCard';
import { PingItem } from '../../../src/components/PingItem';
import { Card } from '../../../src/components/primitives/Card';
import { Checkbox } from '../../../src/components/primitives/Checkbox';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { InputField } from '../../../src/components/primitives/InputField';
import { Row } from '../../../src/components/primitives/Row';
import { Screen } from '../../../src/components/primitives/Screen';
import { Spinner } from '../../../src/components/primitives/Spinner';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { PrivacyNotice } from '../../../src/components/PrivacyNotice';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useOwnerCarForm } from '../../../src/hooks/useOwnerCarForm';
import { useOwnerCars } from '../../../src/hooks/useOwnerCars';
import { useMarkPingsRead, usePings, useUnreadPingCount } from '../../../src/hooks/usePings';
import { getErrorMessage } from '../../../src/services/serviceError';
import { useToastStore } from '../../../src/state/useToastStore';
import { useTheme } from '../../../src/theme';
import type { ValidationKey } from '../../../src/utils/validation';

export default function OwnerPortalScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const showToast = useToastStore((state) => state.show);
  const ownerCars = useOwnerCars();
  const pingsQuery = usePings();
  const unreadCount = useUnreadPingCount();
  const markPingsRead = useMarkPingsRead();
  const { form, removeDialog, plateDialog } = useOwnerCarForm();

  const cars = ownerCars.data ?? [];
  const pings = pingsQuery.data ?? [];

  let loadError: string | undefined;
  if (ownerCars.isError) loadError = getErrorMessage(ownerCars.error, 'load_owner_cars');
  else if (pingsQuery.isError) loadError = getErrorMessage(pingsQuery.error, 'load_pings');

  const retry = () => {
    void ownerCars.refetch();
    void pingsQuery.refetch();
  };

  const markAllRead = () =>
    markPingsRead.mutate(undefined, {
      onError: (error) => showToast(getErrorMessage(error, 'update_pings'), 'error'),
    });

  const fieldError = (key?: ValidationKey) => (key === undefined ? undefined : t(`validation.${key}`));

  return (
    <Screen testID="owners-screen">
      <Stack gap="lg">
        <ScreenHeader title={t('owners.title')} subtitle={t('owners.subtitle')} />

        {loadError !== undefined && (
          <Stack gap="sm">
            <Text color={colors.danger} testID="owners-error">
              {loadError}
            </Text>
            <StyledButton label={t('common.try_again')} icon="refresh" variant="secondary" onPress={retry} />
          </Stack>
        )}

        <Stack gap="sm">
          <Row justify="space-between" gap="sm" wrap>
            <Text size="lg" weight="bold" heading>
              {unreadCount > 0 ? t('owners.pings_heading_unread', { count: unreadCount }) : t('owners.pings_heading')}
            </Text>
            {unreadCount > 0 && (
              <StyledButton
                label={t('owners.mark_all_read')}
                variant="ghost"
                onPress={markAllRead}
                testID="mark-read-button"
              />
            )}
          </Row>
          {pingsQuery.isLoading && <Spinner />}
          {pingsQuery.data?.length === 0 && (
            <Card variant="muted">
              <EmptyState
                icon="notifications-outline"
                title={t('owners.no_pings_title')}
                description={t('owners.no_pings_description')}
                testID="no-pings"
              />
            </Card>
          )}
          {pings.map((ping) => (
            <PingItem key={ping.id} ping={ping} onPress={() => router.push(routes.spotDetail(ping.spotId))} />
          ))}
        </Stack>

        <Stack gap="sm">
          <Text size="lg" weight="bold" heading>
            {t('owners.my_cars')}
          </Text>
          {ownerCars.isLoading && <Spinner />}
          {cars.map((car) => (
            <OwnerCarCard
              key={car.id}
              car={car}
              spotCount={pings.filter((ping) => ping.ownerCarId === car.id).length}
              onTogglePlate={() => plateDialog.open(car)}
              onRemove={() => removeDialog.open(car)}
            />
          ))}

          {form.isOpen ? (
            <Card>
              <Stack gap="md" padding="md">
                <Text size="lg" weight="bold" heading>
                  {t('owners.register_title')}
                </Text>
                <InputField
                  label={t('owners.make_label')}
                  value={form.values.make}
                  onChangeText={(value) => form.updateField('make', value)}
                  placeholder={t('owners.make_placeholder')}
                  autoCapitalize="words"
                  error={fieldError(form.errors.make)}
                  maxLength={40}
                  testID="owner-make-input"
                />
                <InputField
                  label={t('owners.model_label')}
                  value={form.values.model}
                  onChangeText={(value) => form.updateField('model', value)}
                  placeholder={t('owners.model_placeholder')}
                  autoCapitalize="words"
                  error={fieldError(form.errors.model)}
                  maxLength={60}
                  testID="owner-model-input"
                />
                <InputField
                  label={t('owners.nickname_label')}
                  value={form.values.nickname}
                  onChangeText={(value) => form.updateField('nickname', value)}
                  placeholder={t('owners.nickname_placeholder')}
                  autoCapitalize="words"
                  error={fieldError(form.errors.nickname)}
                  maxLength={40}
                  testID="owner-nickname-input"
                />
                <InputField
                  label={t('owners.plate_label')}
                  value={form.values.plate}
                  onChangeText={(value) => form.updateField('plate', value)}
                  placeholder={t('owners.plate_placeholder')}
                  autoCapitalize="characters"
                  error={fieldError(form.errors.plate)}
                  maxLength={20}
                  testID="owner-plate-input"
                />
                <Checkbox
                  label={t('owners.show_plate_checkbox')}
                  checked={form.showPlate}
                  onChange={form.setShowPlate}
                  testID="owner-show-plate-checkbox"
                />
                <PrivacyNotice title={t('owners.plate_privacy_title')}>{t('owners.plate_privacy_body')}</PrivacyNotice>
                <StyledButton
                  label={t('owners.register_submit')}
                  onPress={form.submit}
                  isLoading={form.isPending}
                  testID="register-car-button"
                />
                <StyledButton label={t('common.cancel')} variant="ghost" onPress={form.close} />
              </Stack>
            </Card>
          ) : (
            <StyledButton
              label={t('owners.register_open')}
              icon="add-circle-outline"
              variant={cars.length === 0 ? 'primary' : 'secondary'}
              onPress={form.open}
              testID="open-register-car"
            />
          )}
        </Stack>
      </Stack>

      <ConfirmDialog
        visible={removeDialog.isOpen}
        title={t('owners.remove_title')}
        message={t('owners.remove_message')}
        confirmLabel={t('owners.remove_confirm')}
        destructive
        isLoading={removeDialog.isPending}
        onConfirm={removeDialog.confirm}
        onCancel={removeDialog.cancel}
      />

      <ConfirmDialog
        visible={plateDialog.isOpen}
        title={plateDialog.willShow ? t('owners.show_plate_title') : t('owners.hide_plate_title')}
        message={plateDialog.willShow ? t('owners.show_plate_message') : t('owners.hide_plate_message')}
        confirmLabel={plateDialog.willShow ? t('owners.show_plate_confirm') : t('owners.hide_plate_confirm')}
        isLoading={plateDialog.isPending}
        onConfirm={plateDialog.confirm}
        onCancel={plateDialog.cancel}
      >
        {plateDialog.willShow && (
          <InputField
            label={t('owners.confirm_plate_label')}
            value={plateDialog.plate}
            onChangeText={plateDialog.changePlate}
            autoCapitalize="characters"
            maxLength={20}
            error={plateDialog.error}
            testID="toggle-plate-input"
          />
        )}
        {!plateDialog.willShow && plateDialog.error !== undefined && (
          <Text color={colors.danger}>{plateDialog.error}</Text>
        )}
      </ConfirmDialog>
    </Screen>
  );
}
