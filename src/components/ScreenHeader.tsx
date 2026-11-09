import type { ReactNode } from 'react';
import { useTheme } from '../theme';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface ScreenHeaderProps {
  /** Already translated title. */
  title: string;
  subtitle?: string;
  /** Optional action shown next to the title, e.g. a button. */
  right?: ReactNode;
}

/** Consistent title block at the top of every tab screen (course ch. 3: consistency, hierarchy). */
export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  const { colors } = useTheme();
  return (
    <Row justify="space-between" align="flex-start" gap="md">
      <Stack gap="xs" flex={1}>
        <Text size="xxl" weight="bold" heading testID="screen-title">
          {title}
        </Text>
        {subtitle !== undefined && <Text color={colors.textMuted}>{subtitle}</Text>}
      </Stack>
      {right}
    </Row>
  );
}
