import { useTheme } from '../theme';
import { Card } from './primitives/Card';
import { Icon, type IconName } from './primitives/Icon';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface StatTileProps {
  /** Already translated description of the number, e.g. "Cars spotted". */
  label: string;
  /** Already formatted value, e.g. "12/40" or "30%". */
  value: string;
  icon: IconName;
  testID?: string;
}

/** One key number on the profile screen. */
export function StatTile({ label, value, icon, testID }: StatTileProps) {
  const { colors } = useTheme();
  return (
    <Card testID={testID}>
      <Stack gap="xs" padding="md" align="flex-start">
        <Icon name={icon} size={22} color={colors.accent} />
        <Text size="xl" weight="bold">
          {value}
        </Text>
        <Text size="sm" color={colors.textMuted}>
          {label}
        </Text>
      </Stack>
    </Card>
  );
}
