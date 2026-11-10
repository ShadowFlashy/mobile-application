import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import { Readout } from '../primitives/Readout';
import { Text } from '../primitives/Text';

export interface AutofillQuotaProps {
  /** The Auto-fill switch in the Privacy and auto-fill screen; off shows "Auto-fill is off" instead of a count. */
  aiEnabled: boolean;
  /** Auto-fills left today; undefined while unknown (offline, loading). */
  left?: number;
  /** The daily limit; undefined while unknown. */
  limit?: number;
  testID?: string;
}

/**
 * The Auto-fills left today as A's readout ("12/15", a meta line and a 2 px line). When Auto-fill is
 * off or the quota is unknown, a plain sentence replaces the figure, never a wrong number.
 * `testID-value` is the figure or the sentence.
 */
export function AutofillQuota({ aiEnabled, left, limit, testID = 'ledger-ai' }: AutofillQuotaProps) {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const number = new Intl.NumberFormat(i18n.language);
  const label = t('trust.ledger_ai');

  if (aiEnabled && left !== undefined && limit !== undefined) {
    const value = t('trust.ledger_ai_value', { left: number.format(left), limit: number.format(limit) });
    return (
      <View style={styles.block}>
        <Readout
          value={number.format(left)}
          of={number.format(limit)}
          meta={label}
          progress={limit > 0 ? left / limit : 0}
          progressLabel={label}
          accessibilityLabel={t('trust.ledger_item_a11y', { label, value })}
          testID={testID}
        />
      </View>
    );
  }

  const sentence = aiEnabled ? t('trust.ledger_ai_unknown') : t('trust.ledger_ai_off');
  return (
    <View style={[styles.block, styles.plain]} testID={testID}>
      <Text
        variant="bodyL"
        accessibilityLabel={t('trust.ledger_item_a11y', { label, value: sentence })}
        testID={`${testID}-value`}
      >
        {sentence}
      </Text>
      {aiEnabled && (
        <Text variant="meta" tone="text2" decorative>
          {label}
        </Text>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  block: { paddingTop: spacing.smd },
  plain: { gap: spacing.xs },
}));
