import type { ReactNode } from 'react';
import { View } from 'react-native';
import { borders, createThemedStyles, spacing } from '../../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconName;
  /** `onStage` for the always-dark capture and reveal backdrop. Default `default`. */
  tone?: 'default' | 'onStage';
  testID?: string;
}

/** An empty or error state that sells the goal: an icon in a dashed slot, a title and an action. */
export function EmptyState({ title, description, action, icon, tone = 'default', testID }: EmptyStateProps) {
  const styles = useStyles();
  const onStage = tone === 'onStage';
  return (
    <View style={styles.base} testID={testID}>
      {icon !== undefined && (
        <View style={styles.slot}>
          <Icon name={icon} size={36} tone={onStage ? 'onStageMuted' : 'subtle'} />
        </View>
      )}
      <Text variant="title" align="center" tone={onStage ? 'onStage' : 'default'} heading>
        {title}
      </Text>
      {description !== undefined && (
        <Text align="center" tone={onStage ? 'onStageMuted' : 'muted'}>
          {description}
        </Text>
      )}
      {action !== undefined && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  slot: {
    width: 72,
    height: 72,
    marginBottom: spacing.sm,
    borderRadius: radii.sticker,
    borderWidth: borders.strong,
    borderStyle: 'dashed',
    borderColor: colors.slotOutline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: { marginTop: spacing.sm, alignSelf: 'stretch' },
}));
