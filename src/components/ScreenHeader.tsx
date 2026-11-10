import type { ReactNode } from 'react';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface ScreenHeaderProps {
  /** Already translated title. */
  title: string;
  subtitle?: string;
  /** Small uppercase line above the title, e.g. "Season 1". */
  eyebrow?: string;
  /** Optional action shown next to the title, e.g. a button. */
  right?: ReactNode;
}

/** The title block at the top of every tab screen, in racing-livery display type. */
export function ScreenHeader({ title, subtitle, eyebrow, right }: ScreenHeaderProps) {
  return (
    <Row justify="space-between" align="flex-start" gap="md">
      <Stack gap="xxs" flex={1}>
        {eyebrow !== undefined && (
          <Text variant="label" tone="accent">
            {eyebrow}
          </Text>
        )}
        <Text variant="display" heading testID="screen-title">
          {title}
        </Text>
        {subtitle !== undefined && <Text tone="muted">{subtitle}</Text>}
      </Stack>
      {right}
    </Row>
  );
}
