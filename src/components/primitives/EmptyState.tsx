import { View, StyleSheet } from 'react-native';
import { spacing, useTheme } from '../../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: IconName;
  testID?: string;
}

export function EmptyState({ title, description, action, icon, testID }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.base} testID={testID}>
      {icon !== undefined && <Icon name={icon} size={40} color={colors.textSubtle} />}
      <Text size="lg" weight="bold" align="center">
        {title}
      </Text>
      {description !== undefined && (
        <Text align="center" color={colors.textMuted}>
          {description}
        </Text>
      )}
      {action !== undefined && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  action: { marginTop: spacing.sm, alignSelf: 'stretch' },
});
