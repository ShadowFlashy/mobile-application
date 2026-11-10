import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PrivacyNotice } from '../../../src/components/PrivacyNotice';
import { ListRow } from '../../../src/components/primitives/ListRow';
import { Readout } from '../../../src/components/primitives/Readout';
import { Row } from '../../../src/components/primitives/Row';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { Spinner } from '../../../src/components/primitives/Spinner';
import { Stack } from '../../../src/components/primitives/Stack';
import { Switch } from '../../../src/components/primitives/Switch';
import { Text } from '../../../src/components/primitives/Text';
import { DeleteAccountRow } from '../../../src/components/trust/DeleteAccountRow';
import { OptionRow } from '../../../src/components/trust/OptionRow';
import { ProfileIdentity } from '../../../src/components/trust/ProfileIdentity';
import { routes } from '../../../src/constants/routes';
import { useAlbum } from '../../../src/hooks/useAlbum';
import { useLanguage } from '../../../src/hooks/useLanguage';
import { useOwnerCars } from '../../../src/hooks/useOwnerCars';
import { useProgress } from '../../../src/hooks/useProgress';
import { useSettings } from '../../../src/hooks/useSettings';
import { useDeleteAccount, useSignOut } from '../../../src/hooks/useSignOut';
import { useTrustLedger } from '../../../src/hooks/useTrustLedger';
import { isSupportedLanguage, SUPPORTED_LANGUAGES, type Language } from '../../../src/i18n';
import { getErrorMessage } from '../../../src/services/serviceError';
import { useAuthStore } from '../../../src/state/useAuthStore';
import { useToastStore } from '../../../src/state/useToastStore';

/**
 * The Profile tab (SPEC P0-18): who is signed in, the season in three readouts, the settings,
 * privacy links and the account, all as hairline rows.
 */
export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isOfflineSession = useAuthStore((state) => state.isOfflineSession);
  const showToast = useToastStore((state) => state.show);
  const { snapshot } = useProgress();
  const { cover } = useAlbum();
  const { data: ownerCars } = useOwnerCars();
  const ledger = useTrustLedger();
  const { settings, update } = useSettings();
  const { language, changeLanguage } = useLanguage();
  const signOut = useSignOut();
  const deleteAccount = useDeleteAccount();

  const number = new Intl.NumberFormat(i18n.language);
  const level = snapshot?.level;
  const languageOptions = SUPPORTED_LANGUAGES.map((code) => ({
    value: code,
    label: t(`profile.language_short_${code}`),
    accessibilityLabel: t(`profile.language_${code}`),
  }));

  // No navigation needed: the (app) layout redirects to the login screen once the user is signed out.
  const onLogout = async () => {
    try {
      await signOut.mutateAsync();
    } catch (error) {
      showToast(getErrorMessage(error, 'logout_failed'), 'error');
    }
  };

  // GDPR right to erasure. The shared demo account gets a friendly "cannot be deleted" toast.
  const onDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      showToast(t('profile.account_deleted_toast'), 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'delete_account'), 'error');
    }
  };

  return (
    <Screen title={t('profile.title')} testID="profile-screen">
      <Stack gap="lg">
        <ProfileIdentity
          name={user?.name ?? ''}
          email={user?.email}
          isOffline={isOfflineSession}
          testID="driver-card"
        />

        {isOfflineSession && (
          <PrivacyNotice title={t('profile.offline_title')} testID="offline-session-notice">
            {t('profile.offline_body')}
          </PrivacyNotice>
        )}

        <Row gap="lg" align="flex-start">
          <Stack flex={1}>
            <Readout
              value={number.format(cover.collected)}
              of={number.format(cover.total)}
              meta={t('profile.stat_stickers')}
              accessibilityLabel={t('profile.stat_stickers_a11y', {
                collected: number.format(cover.collected),
                total: number.format(cover.total),
              })}
              testID="stat-stickers"
            />
          </Stack>
          <Stack flex={1}>
            <Readout
              value={number.format(ledger.photos)}
              meta={t('profile.stat_spots')}
              accessibilityLabel={t('profile.stat_spots_a11y', { count: number.format(ledger.photos) })}
              testID="stat-spots"
            />
          </Stack>
          <Stack flex={1}>
            {level === undefined ? (
              <Readout
                unit={t('profile.lvl')}
                value={t('profile.level_unknown')}
                meta={t('profile.xp_loading')}
                testID="stat-level"
              />
            ) : (
              <Readout
                unit={t('profile.lvl')}
                value={number.format(level.level)}
                meta={t('progress.level_meta', {
                  title: t(`levels.${level.titleKey}`),
                  remaining: number.format(Math.max(0, level.nextLevelXp - level.xp)),
                  next: level.level + 1,
                })}
                accessibilityLabel={t('profile.level_a11y', { level: level.level })}
                testID="stat-level"
              />
            )}
          </Stack>
        </Row>

        <Section title={t('profile.stats_title')}>
          <ListRow
            title={t('profile.stat_cities')}
            value={number.format(ledger.cities)}
            kind="detail"
            testID="stat-cities"
          />
          <ListRow
            title={t('profile.stat_owned')}
            value={number.format(ownerCars?.length ?? 0)}
            kind="detail"
            testID="stat-owned"
          />
        </Section>

        <Section title={t('profile.settings_title')}>
          <OptionRow<Language>
            label={t('profile.language_title')}
            options={languageOptions}
            value={language}
            onChange={(next) => {
              if (isSupportedLanguage(next)) changeLanguage(next);
            }}
            testID="language"
          />
          <Switch
            label={t('profile.haptics_label')}
            description={t('profile.haptics_description')}
            value={settings.haptics}
            onChange={(haptics) => update({ haptics })}
            divider
            testID="haptics-switch"
          />
        </Section>

        <Section title={t('profile.privacy_title')}>
          <ListRow
            title={t('profile.trust_link')}
            subtitle={t('profile.trust_link_description')}
            chevron
            accessibilityRole="link"
            accessibilityLabel={t('profile.trust_link')}
            accessibilityHint={t('profile.trust_link_description')}
            onPress={() => router.push(routes.trust)}
            testID="trust-link"
          />
          <ListRow
            title={t('profile.privacy_link')}
            subtitle={t('profile.privacy_link_description')}
            chevron
            accessibilityRole="link"
            accessibilityLabel={t('profile.privacy_link')}
            accessibilityHint={t('profile.privacy_link_description')}
            onPress={() => router.push(routes.privacy)}
            testID="privacy-link"
          />
        </Section>

        <Section title={t('profile.account_title')}>
          <ListRow
            title={t('profile.logout')}
            onPress={() => void onLogout()}
            disabled={signOut.isPending}
            trailing={signOut.isPending ? <Spinner size="small" /> : undefined}
            testID="logout-button"
          />
          <DeleteAccountRow
            onConfirm={onDeleteAccount}
            isDeleting={deleteAccount.isPending}
            disabled={signOut.isPending}
            testID="delete-account-button"
          />
        </Section>

        <Text variant="meta" tone="text2">
          {t('profile.version', { version: Constants.expoConfig?.version ?? '2.1.0' })}
        </Text>
      </Stack>
    </Screen>
  );
}
