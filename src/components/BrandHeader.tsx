import { BrandMark } from './brand/BrandMark';
import { Wordmark } from './brand/Wordmark';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface BrandHeaderProps {
  /** Already translated tagline under the wordmark. */
  subtitle: string;
  /** `md` for compact headers. Default `lg`. */
  size?: 'md' | 'lg';
  testID?: string;
}

/** The BrandMark sticker next to the REDLINE wordmark, with a tagline (login and register). */
export function BrandHeader({ subtitle, size = 'lg', testID }: BrandHeaderProps) {
  return (
    <Stack gap="smd" testID={testID}>
      <Row gap="smd" align="center">
        <BrandMark size={size === 'lg' ? 56 : 44} testID="brand-mark" />
        <Wordmark size={size} testID="brand-wordmark" />
      </Row>
      <Text variant="bodyStrong" tone="muted">
        {subtitle}
      </Text>
    </Stack>
  );
}
