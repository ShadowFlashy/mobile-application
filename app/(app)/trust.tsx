import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../src/components/primitives/Screen';
import { Section } from '../../src/components/primitives/Section';
import { Stack } from '../../src/components/primitives/Stack';
import { Switch } from '../../src/components/primitives/Switch';
import { Text } from '../../src/components/primitives/Text';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { DeleteAccountButton } from '../../src/components/trust/DeleteAccountButton';
import { OwnerVisibilityTable } from '../../src/components/trust/OwnerVisibilityTable';
import { SettingRow } from '../../src/components/trust/SettingRow';
import { TrustLedger } from '../../src/components/trust/TrustLedger';
import { routes } from '../../src/constants/routes';
import { useSettings } from '../../src/hooks/useSettings';
import { useDeleteAccount } from '../../src/hooks/useSignOut';
import { useTrustLedger } from '../../src/hooks/useTrustLedger';
import { getErrorMessage } from '../../src/services/serviceError';
import { useToastStore } from '../../src/state/useToastStore';

/**
 * Trust Center (SPEC P0-18, §6.10): the privacy switches, the ledger of what Redline stores, what
 * owners see, the privacy policy and account deletion. Every switch takes effect at once: with
 * Co-Driver off, capture never calls the AI function.
 */
export default function TrustScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const { settings, update } = useSettings();
  const ledger = useTrustLedger();
  const deleteAccount = useDeleteAccount();

  const onDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      showToast(t('profile.account_deleted_toast'), 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'delete_account'), 'error');
    }
  };

  return (
    <Screen testID="trust-screen">
      <Stack gap="lg">
        <ScreenHeader eyebrow={t('trust.eyebrow')} title={t('trust.title')} subtitle={t('trust.subtitle')} />

        <Section title={t('trust.controls_title')}>
          <Stack gap="xs">
            <Switch
              label={t('trust.ai_label')}
              description={t('trust.ai_description')}
              value={settings.aiEnabled}
              onChange={(aiEnabled) => update({ aiEnabled })}
              testID="trust-ai-switch"
            />
            <Switch
              label={t('trust.auto_city_label')}
              description={t('trust.auto_city_description')}
              value={settings.autoLocation}
              onChange={(autoLocation) => update({ autoLocation })}
              testID="trust-auto-city-switch"
            />
            <Switch
              label={t('trust.share_name_label')}
              description={t('trust.share_name_description')}
              value={settings.shareNameDefault}
              onChange={(shareNameDefault) => update({ shareNameDefault })}
              testID="trust-share-name-switch"
            />
          </Stack>
        </Section>

        <Section title={t('trust.ledger_title')}>
          <Stack gap="sm">
            <Text variant="bodySm" tone="muted">
              {t('trust.ledger_subtitle')}
            </Text>
            <TrustLedger
              photos={ledger.photos}
              plates={ledger.plates}
              gpsPoints={ledger.gpsPoints}
              cities={ledger.cities}
              aiCallsLeft={ledger.aiCallsLeft}
              aiDailyLimit={ledger.aiDailyLimit}
              aiEnabled={settings.aiEnabled}
              isLoading={ledger.isLoading}
              testID="trust-ledger"
            />
          </Stack>
        </Section>

        <Section title={t('trust.owners_title')}>
          <Stack gap="sm">
            <Text variant="bodySm" tone="muted">
              {t('trust.owners_subtitle')}
            </Text>
            <OwnerVisibilityTable shareName={settings.shareNameDefault} testID="owner-visibility" />
          </Stack>
        </Section>

        <Section title={t('trust.links_title')}>
          <SettingRow
            icon="document-text-outline"
            label={t('trust.privacy_link')}
            description={t('trust.privacy_link_description')}
            onPress={() => router.push(routes.privacy)}
            testID="trust-privacy-link"
          />
        </Section>

        <Section title={t('trust.danger_title')}>
          <DeleteAccountButton
            onConfirm={onDeleteAccount}
            isDeleting={deleteAccount.isPending}
            testID="trust-delete-account"
          />
        </Section>
      </Stack>
    </Screen>
  );
}
