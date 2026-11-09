import Constants from 'expo-constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ConfirmDialog } from '../../../src/components/ConfirmDialog';
import { Avatar } from '../../../src/components/primitives/Avatar';
import { Card } from '../../../src/components/primitives/Card';
import { Row } from '../../../src/components/primitives/Row';
import { Screen } from '../../../src/components/primitives/Screen';
import { Stack } from '../../../src/components/primitives/Stack';
import { Tag } from '../../../src/components/primitives/Tag';
import { Text } from '../../../src/components/primitives/Text';
import { PrivacyNotice } from '../../../src/components/PrivacyNotice';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { StatTile } from '../../../src/components/StatTile';
import { StyledButton } from '../../../src/components/StyledButton';
import { useLanguage } from '../../../src/hooks/useLanguage';
import { useOwnerCars } from '../../../src/hooks/useOwnerCars';
import { useDeleteAccount, useSignOut } from '../../../src/hooks/useSignOut';
import { useStickerBook } from '../../../src/hooks/useStickerBook';
import { SUPPORTED_LANGUAGES } from '../../../src/i18n';
import { getErrorMessage } from '../../../src/services/serviceError';
import { useAuthStore } from '../../../src/state/useAuthStore';
import { useToastStore } from '../../../src/state/useToastStore';
import { useTheme } from '../../../src/theme';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.show);
  const { overallProgress, totalSpots } = useStickerBook();
  const { data: ownerCars } = useOwnerCars();
  const { language, changeLanguage } = useLanguage();
  const signOut = useSignOut();
  const deleteAccount = useDeleteAccount();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // No navigation needed: the (app) layout redirects to the login screen once the user is signed out.
  const onLogout = async () => {
    try {
      await signOut.mutateAsync();
    } catch (error) {
      showToast(getErrorMessage(error, 'logout_failed'), 'error');
    }
  };

  // GDPR right to erasure: the account and all its data are deleted, then the user is signed out.
  const onDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      showToast(t('profile.account_deleted_toast'), 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'delete_account'), 'error');
    } finally {
      // Closed in both cases: a toast is not visible on top of an open dialog.
      setIsDeleteOpen(false);
    }
  };

  const completion = new Intl.NumberFormat(i18n.language, { style: 'percent' }).format(overallProgress.ratio);

  return (
    <Screen testID="profile-screen">
      <Stack gap="lg">
        <ScreenHeader title={t('profile.title')} />
        <Card>
          <Stack padding="md">
            <Row gap="md">
              <Avatar name={user?.name} size="lg" />
              <Stack gap="xs" flex={1}>
                <Text size="xl" weight="bold" testID="profile-name">
                  {user?.name ?? ''}
                </Text>
                <Text color={colors.textMuted} numberOfLines={1}>
                  {user?.email ?? ''}
                </Text>
              </Stack>
            </Row>
          </Stack>
        </Card>

        <Row gap="md">
          <View style={styles.tile}>
            <StatTile
              label={t('profile.stat_stickers')}
              value={`${overallProgress.collected}/${overallProgress.total}`}
              icon="albums-outline"
              testID="stat-stickers"
            />
          </View>
          <View style={styles.tile}>
            <StatTile
              label={t('profile.stat_spots')}
              value={String(totalSpots)}
              icon="camera-outline"
              testID="stat-spots"
            />
          </View>
        </Row>
        <Row gap="md">
          <View style={styles.tile}>
            <StatTile
              label={t('profile.stat_completion')}
              value={completion}
              icon="trophy-outline"
              testID="stat-completion"
            />
          </View>
          <View style={styles.tile}>
            <StatTile
              label={t('profile.stat_owned')}
              value={String(ownerCars?.length ?? 0)}
              icon="key-outline"
              testID="stat-owned"
            />
          </View>
        </Row>

        <Stack gap="sm">
          <Text size="lg" weight="bold" heading>
            {t('profile.language_title')}
          </Text>
          <Row gap="sm" wrap>
            {SUPPORTED_LANGUAGES.map((code) => (
              <Tag
                key={code}
                label={t(`profile.language_${code}`)}
                selected={language === code}
                onPress={() => changeLanguage(code)}
                testID={`language-${code}`}
              />
            ))}
          </Row>
        </Stack>

        <Stack gap="sm">
          <Text size="lg" weight="bold" heading>
            {t('profile.privacy_title')}
          </Text>
          <PrivacyNotice title={t('profile.privacy_blur_title')}>{t('profile.privacy_blur_body')}</PrivacyNotice>
          <PrivacyNotice title={t('profile.privacy_typed_title')}>{t('profile.privacy_typed_body')}</PrivacyNotice>
          <PrivacyNotice title={t('profile.privacy_choice_title')}>{t('profile.privacy_choice_body')}</PrivacyNotice>
        </Stack>

        <StyledButton
          label={t('profile.logout')}
          icon="log-out-outline"
          variant="secondary"
          onPress={() => void onLogout()}
          isLoading={signOut.isPending}
          testID="logout-button"
        />
        <StyledButton
          label={t('profile.delete_account')}
          icon="trash-outline"
          variant="ghost"
          onPress={() => setIsDeleteOpen(true)}
          disabled={signOut.isPending}
          accessibilityHint={t('profile.delete_account_hint')}
          testID="delete-account-button"
        />
        <Text size="sm" align="center" color={colors.textSubtle}>
          {t('profile.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
        </Text>
      </Stack>

      <ConfirmDialog
        visible={isDeleteOpen}
        title={t('profile.delete_title')}
        message={t('profile.delete_message')}
        confirmLabel={t('profile.delete_account')}
        destructive
        isLoading={deleteAccount.isPending}
        onConfirm={() => void onDeleteAccount()}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1 },
});
