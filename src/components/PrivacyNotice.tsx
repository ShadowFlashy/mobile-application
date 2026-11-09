import type { ReactNode } from 'react';
import { useTheme } from '../theme';
import { Card } from './primitives/Card';
import { Icon } from './primitives/Icon';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface PrivacyNoticeProps {
  /** Already translated title. */
  title: string;
  /** Already translated explanation. */
  children: ReactNode;
  testID?: string;
}

/** Explains a privacy rule right where it matters (GDPR transparency, course ch. 23). */
export function PrivacyNotice({ title, children, testID }: PrivacyNoticeProps) {
  const { colors } = useTheme();
  return (
    <Card variant="muted" testID={testID}>
      <Stack padding="md">
        <Row gap="md" align="flex-start">
          <Icon name="shield-checkmark-outline" size={22} color={colors.success} />
          <Stack gap="xs" flex={1}>
            <Text weight="bold">{title}</Text>
            <Text size="sm" color={colors.textMuted}>
              {children}
            </Text>
          </Stack>
        </Row>
      </Stack>
    </Card>
  );
}
