import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, spacing } from '../../theme';
import { Avatar } from '../primitives/Avatar';
import { Text } from '../primitives/Text';

export interface ProfileIdentityProps {
  name: string;
  email?: string;
  /** The app runs on the stored session without a connection: says "Offline · read-only". */
  isOffline?: boolean;
  testID?: string;
}

/**
 * Who is signed in (Profile tab): the initials avatar, the display name and the email in text-2 on
 * one hairline row. While offline, a text-2 "Offline · read-only" sits on the right.
 */
export function ProfileIdentity({ name, email, isOffline = false, testID }: ProfileIdentityProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.row} testID={testID}>
      <Avatar name={name} size="md" />
      <View style={styles.names}>
        <Text variant="bodyL" heading numberOfLines={1} testID="driver-name">
          {name}
        </Text>
        {email !== undefined && email.length > 0 && (
          <Text variant="meta" tone="text2" numberOfLines={1} testID="driver-email">
            {email}
          </Text>
        )}
      </View>
      {isOffline && (
        <Text variant="meta" tone="text2" align="right" testID="offline-session-tag">
          {t('profile.offline_tag')}
        </Text>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingBottom: spacing.md,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  names: { flex: 1, minWidth: 0 },
}));
