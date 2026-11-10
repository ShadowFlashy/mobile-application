import type { ReactNode } from 'react';
import { Icon } from './primitives/Icon';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Surface } from './primitives/Surface';
import { Text } from './primitives/Text';

interface PrivacyNoticeProps {
  /** Already translated title. */
  title: string;
  /** Already translated explanation. */
  children: ReactNode;
  testID?: string;
}

/** Explains a privacy rule right where it matters (GDPR transparency). */
export function PrivacyNotice({ title, children, testID }: PrivacyNoticeProps) {
  return (
    <Surface variant="sunken" padding="md" testID={testID}>
      <Row gap="smd" align="flex-start">
        <Icon name="shield-checkmark" size={22} tone="success" />
        <Stack gap="xxs" flex={1}>
          <Text variant="bodyStrong">{title}</Text>
          <Text variant="bodySm" tone="muted">
            {children}
          </Text>
        </Stack>
      </Row>
    </Surface>
  );
}
