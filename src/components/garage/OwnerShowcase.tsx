import { useTranslation } from 'react-i18next';
import type { SpotShowcase } from '../../types/Spot';
import { Icon } from '../primitives/Icon';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';
import { VanityPlate } from './VanityPlate';

export interface OwnerShowcaseProps {
  showcase: SpotShowcase;
}

/**
 * The verified owner's opt-in showcase on a spotter's own spot (read live through get_spot_showcase,
 * never copied into the spot): a Verified owner badge, the shout-out and, for "vanity", the plate.
 */
export function OwnerShowcase({ showcase }: OwnerShowcaseProps) {
  const { t } = useTranslation();
  const label =
    showcase.shoutout !== undefined
      ? t('garage.showcase_a11y', { shoutout: showcase.shoutout })
      : t('garage.showcase_a11y_plain');
  return (
    <Surface variant="sunken" radius="lg" padding="md" testID="owner-showcase">
      <Stack gap="sm">
        <Row gap="xs" align="center">
          <Icon name="shield-checkmark" size={18} tone="success" accessibilityLabel={label} />
          <Text variant="label" tone="success">
            {t('garage.showcase_badge')}
          </Text>
        </Row>
        {showcase.shoutout !== undefined && (
          <Text variant="body" testID="owner-showcase-shoutout">
            {`“${showcase.shoutout}”`}
          </Text>
        )}
        {showcase.visibility === 'vanity' && showcase.vanityPlate !== undefined && (
          <VanityPlate plate={showcase.vanityPlate} testID="owner-showcase-plate" />
        )}
      </Stack>
    </Surface>
  );
}
