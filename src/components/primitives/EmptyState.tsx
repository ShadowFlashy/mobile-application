import type { ReactNode } from 'react';
import { View } from 'react-native';
import { createThemedStyles, iconSizes, spacing } from '../../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconName;
  /** `onStage` for the always-dark photo stage. Default `default`. */
  tone?: 'default' | 'onStage';
  testID?: string;
}

/**
 * An empty or error state on the 20 px left edge: a heading (with an optional quiet icon before it),
 * a plain description and a stretched action. Left-aligned like every other block; no boxes.
 */
export function EmptyState({ title, description, action, icon, tone = 'default', testID }: EmptyStateProps) {
  const styles = useStyles();
  const onStage = tone === 'onStage';
  return (
    <View style={styles.base} testID={testID}>
      <View style={styles.heading}>
        {icon !== undefined && <Icon name={icon} size={iconSizes.md} tone={onStage ? 'onStageMuted' : 'text2'} />}
        <View style={styles.title}>
          <Text variant="heading" tone={onStage ? 'onStage' : 'text'} heading>
            {title}
          </Text>
        </View>
      </View>
      {description !== undefined && (
        <Text variant="value" tone={onStage ? 'onStageMuted' : 'text2'}>
          {description}
        </Text>
      )}
      {action !== undefined && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  base: {
    alignItems: 'stretch',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, minWidth: 0 },
  action: { marginTop: spacing.md, alignSelf: 'stretch' },
}));
