import { Icon, type IconName } from './primitives/Icon';
import { Stack } from './primitives/Stack';
import { Surface } from './primitives/Surface';
import { Text } from './primitives/Text';

interface StatTileProps {
  /** Already translated description of the number, e.g. "Cars spotted". */
  label: string;
  /** Already formatted value, e.g. "12/40" or "30%". */
  value: string;
  icon: IconName;
  /** `number` (default) for counts; `headline` for words such as a city name, which may be long. */
  valueVariant?: 'number' | 'headline';
  testID?: string;
}

/** One key number (e.g. on the profile screen), in instrument-style condensed numerals. */
export function StatTile({ label, value, icon, valueVariant = 'number', testID }: StatTileProps) {
  return (
    <Surface variant="raised" padding="md" testID={testID}>
      <Stack gap="xs" align="flex-start">
        <Icon name={icon} size={22} tone="accent" />
        <Text variant={valueVariant} numberOfLines={valueVariant === 'headline' ? 2 : 1}>
          {value}
        </Text>
        <Text variant="label" tone="muted">
          {label}
        </Text>
      </Stack>
    </Surface>
  );
}
