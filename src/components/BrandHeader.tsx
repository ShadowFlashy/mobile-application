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

/** The rev-counter mark next to the "Redline" wordmark, with a plain tagline (login and register). */
export function BrandHeader({ subtitle, size = 'lg', testID }: BrandHeaderProps) {
  return (
    <Stack gap="sm" testID={testID}>
      <Row gap="smd" align="center">
        <BrandMark size={size === 'lg' ? 40 : 32} testID="brand-mark" />
        <Wordmark size={size} testID="brand-wordmark" />
      </Row>
      <Text variant="value" tone="text2">
        {subtitle}
      </Text>
    </Stack>
  );
}
