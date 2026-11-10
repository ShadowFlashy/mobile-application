import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PrivacyNotice } from '../../../src/components/PrivacyNotice';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { SegmentedControl } from '../../../src/components/primitives/SegmentedControl';
import { Stack } from '../../../src/components/primitives/Stack';
import { Row } from '../../../src/components/primitives/Row';
import { Switch } from '../../../src/components/primitives/Switch';
import { Text } from '../../../src/components/primitives/Text';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { StatTile } from '../../../src/components/StatTile';
import { StyledButton } from '../../../src/components/StyledButton';
import { DeleteAccountButton } from '../../../src/components/trust/DeleteAccountButton';
import { DriverCard } from '../../../src/components/trust/DriverCard';
import { SettingRow } from '../../../src/components/trust/SettingRow';
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

/** The "Me" tab (SPEC P0-18): driver card, season stats, settings, privacy links and the account. */
export default function ProfileScreen() {
  const { t } = useTranslation();
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

  const level = snapshot?.level;
  const languageOptions = SUPPORTED_LANGUAGES.map((code) => ({ value: code, label: t(`profile.language_${code}`) }));

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
    <Screen testID="profile-screen">
      <Stack gap="lg">
        <ScreenHeader eyebrow={t('profile.eyebrow')} title={t('profile.title')} />

        <DriverCard
          name={user?.name ?? ''}
          email={user?.email}
          level={
            level === undefined
              ? undefined
              : {
                  level: level.level,
                  title: t(`levels.${level.titleKey}`),
                  xp: level.xp,
                  nextLevelXp: level.nextLevelXp,
                  ratio: level.ratio,
                }
          }
          isOffline={isOfflineSession}
          testID="driver-card"
        />

        {isOfflineSession && (
          <PrivacyNotice title={t('profile.offline_title')} testID="offline-session-notice">
            {t('profile.offline_body')}
          </PrivacyNotice>
        )}

        <Section title={t('profile.stats_title')}>
          <Stack gap="smd">
            <Row gap="smd">
              <Stack flex={1}>
                <StatTile
                  label={t('profile.stat_stickers')}
                  value={`${cover.collected}/${cover.total}`}
                  icon="albums-outline"
                  testID="stat-stickers"
                />
              </Stack>
              <Stack flex={1}>
                <StatTile
                  label={t('profile.stat_spots')}
                  value={String(ledger.photos)}
                  icon="camera-outline"
                  testID="stat-spots"
                />
              </Stack>
            </Row>
            <Row gap="smd">
              <Stack flex={1}>
                <StatTile
                  label={t('profile.stat_cities')}
                  value={String(ledger.cities)}
                  icon="business-outline"
                  testID="stat-cities"
                />
              </Stack>
              <Stack flex={1}>
                <StatTile
                  label={t('profile.stat_owned')}
                  value={String(ownerCars?.length ?? 0)}
                  icon="key-outline"
                  testID="stat-owned"
                />
              </Stack>
            </Row>
          </Stack>
        </Section>

        <Section title={t('profile.settings_title')}>
          <Stack gap="sm">
            <Text variant="label" tone="muted">
              {t('profile.language_title')}
            </Text>
            <SegmentedControl<Language>
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
              testID="haptics-switch"
            />
          </Stack>
        </Section>

        <Section title={t('profile.privacy_title')}>
          <Stack gap="xs">
            <SettingRow
              icon="shield-checkmark-outline"
              label={t('profile.trust_link')}
              description={t('profile.trust_link_description')}
              onPress={() => router.push(routes.trust)}
              testID="trust-link"
            />
            <SettingRow
              icon="document-text-outline"
              label={t('profile.privacy_link')}
              description={t('profile.privacy_link_description')}
              onPress={() => router.push(routes.privacy)}
              testID="privacy-link"
            />
          </Stack>
        </Section>

        <Section title={t('profile.account_title')}>
          <Stack gap="sm">
            <StyledButton
              label={t('profile.logout')}
              icon="log-out-outline"
              variant="secondary"
              onPress={() => void onLogout()}
              isLoading={signOut.isPending}
              testID="logout-button"
            />
            <DeleteAccountButton
              onConfirm={onDeleteAccount}
              isDeleting={deleteAccount.isPending}
              disabled={signOut.isPending}
              testID="delete-account-button"
            />
          </Stack>
        </Section>

        <Text variant="caption" align="center" tone="subtle">
          {t('profile.version', { version: Constants.expoConfig?.version ?? '2.0.0' })}
        </Text>
      </Stack>
    </Screen>
  );
}
