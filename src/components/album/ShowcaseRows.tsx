import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, spacing } from '../../theme';
import type { SpotShowcase } from '../../types/Spot';
import { VanityPlate } from '../garage/VanityPlate';
import { Icon } from '../primitives/Icon';
import { ListRow } from '../primitives/ListRow';
import { Text } from '../primitives/Text';

export interface ShowcaseRowsProps {
  showcase: SpotShowcase;
  testID?: string;
}

/**
 * The verified owner's opt-in showcase on a spot, as plain hairline rows: "Verified owner" with a
 * shield, the shout-out as a quote, and for "vanity" the plate the owner chose to show.
 */
export function ShowcaseRows({ showcase, testID = 'owner-showcase' }: ShowcaseRowsProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View testID={testID}>
      <ListRow
        title={t('spot_detail.showcase_verified')}
        leading={<Icon name="shield" size={20} />}
        trailing={
          showcase.visibility === 'vanity' && showcase.vanityPlate !== undefined ? (
            <VanityPlate plate={showcase.vanityPlate} testID="owner-showcase-plate" />
          ) : undefined
        }
      />
      {showcase.shoutout !== undefined && (
        <View style={styles.quote}>
          <Text
            variant="value"
            accessibilityLabel={t('spot_detail.showcase_quote_label', { shoutout: showcase.shoutout })}
            testID="owner-showcase-shoutout"
          >
            {t('spot_detail.showcase_quote', { shoutout: showcase.shoutout })}
          </Text>
        </View>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  quote: {
    paddingVertical: spacing.smd,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
}));
