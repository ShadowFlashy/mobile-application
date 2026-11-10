import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ListRow } from '../../src/components/primitives/ListRow';
import { Screen } from '../../src/components/primitives/Screen';
import { Section } from '../../src/components/primitives/Section';
import { Stack } from '../../src/components/primitives/Stack';
import { Switch } from '../../src/components/primitives/Switch';
import { Text } from '../../src/components/primitives/Text';
import { AutofillQuota } from '../../src/components/trust/AutofillQuota';
import { DeleteAccountRow } from '../../src/components/trust/DeleteAccountRow';
import { OwnerVisibilityTable } from '../../src/components/trust/OwnerVisibilityTable';
import { TrustLedger } from '../../src/components/trust/TrustLedger';
import { routes } from '../../src/constants/routes';
import { useSettings } from '../../src/hooks/useSettings';
import { useDeleteAccount } from '../../src/hooks/useSignOut';
import { useTrustLedger } from '../../src/hooks/useTrustLedger';
import { getErrorMessage } from '../../src/services/serviceError';
import { useToastStore } from '../../src/state/useToastStore';

/**
 * Trust Center, titled "Privacy and auto-fill" (SPEC P0-18, §6.10): the privacy switches, the
 * Auto-fills left today, what Redline stores, what owners see, the privacy policy and account
 * deletion. Every switch takes effect at once: with Auto-fill off, capture never calls the AI function.
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
    <Screen title={t('trust.title')} testID="trust-screen">
      <Stack gap="lg">
        <Section title={t('trust.controls_title')} meta={t('trust.controls_meta')}>
          <Switch
            label={t('trust.ai_label')}
            description={t('trust.ai_description')}
            value={settings.aiEnabled}
            onChange={(aiEnabled) => update({ aiEnabled })}
            divider
            testID="trust-ai-switch"
          />
          <Switch
            label={t('trust.auto_city_label')}
            description={t('trust.auto_city_description')}
            value={settings.autoLocation}
            onChange={(autoLocation) => update({ autoLocation })}
            divider
            testID="trust-auto-city-switch"
          />
          <Switch
            label={t('trust.share_name_label')}
            description={t('trust.share_name_description')}
            value={settings.shareNameDefault}
            onChange={(shareNameDefault) => update({ shareNameDefault })}
            divider
            testID="trust-share-name-switch"
          />
        </Section>

        <Section title={t('trust.quota_title')}>
          <AutofillQuota
            aiEnabled={settings.aiEnabled}
            left={ledger.aiCallsLeft}
            limit={ledger.aiDailyLimit}
            testID="ledger-ai"
          />
        </Section>

        <Section title={t('trust.ledger_title')} meta={t('trust.ledger_subtitle')}>
          <TrustLedger
            photos={ledger.photos}
            plates={ledger.plates}
            gpsPoints={ledger.gpsPoints}
            cities={ledger.cities}
            isLoading={ledger.isLoading}
            testID="trust-ledger"
          />
        </Section>

        <Section title={t('trust.owners_title')} divider={false}>
          <Stack gap="smd">
            <Text variant="meta" tone="text2">
              {t('trust.owners_subtitle')}
            </Text>
            <OwnerVisibilityTable shareName={settings.shareNameDefault} testID="owner-visibility" />
          </Stack>
        </Section>

        <Section title={t('trust.danger_title')}>
          <ListRow
            title={t('trust.privacy_link')}
            subtitle={t('trust.privacy_link_description')}
            chevron
            accessibilityRole="link"
            accessibilityLabel={t('trust.privacy_link')}
            accessibilityHint={t('trust.privacy_link_description')}
            onPress={() => router.push(routes.privacy)}
            testID="trust-privacy-link"
          />
          <DeleteAccountRow
            onConfirm={onDeleteAccount}
            isDeleting={deleteAccount.isPending}
            testID="trust-delete-account"
          />
        </Section>
      </Stack>
    </Screen>
  );
}
