import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { borders, createThemedStyles, spacing, touchTarget, type TextTone } from '../../theme';
import type { TrustLedgerData } from '../../utils/trustLedger';
import { Icon, type IconName } from '../primitives/Icon';
import { Skeleton } from '../primitives/Skeleton';
import { Text } from '../primitives/Text';

export interface TrustLedgerProps extends TrustLedgerData {
  /** Co-Driver switched on in the Trust Center; off shows "Co-Driver is off" instead of a count. */
  aiEnabled: boolean;
  isLoading?: boolean;
  testID?: string;
}

interface Gauge {
  id: string;
  icon: IconName;
  label: string;
  value: string;
  hint: string;
  /** The "never stored" gauges carry a shield, so the zero is not told by colour alone. */
  guarded: boolean;
  tone: TextTone;
}

/**
 * "What Redline stores" (SPEC P0-18): counters like a dash cluster. Licence plates and GPS points
 * are always 0 with a "Never stored" shield; photos and cities are counted from the user's spots;
 * the last row shows the Co-Driver scans left today.
 */
export function TrustLedger({
  photos,
  plates,
  gpsPoints,
  cities,
  aiCallsLeft,
  aiDailyLimit,
  aiEnabled,
  isLoading = false,
  testID,
}: TrustLedgerProps) {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const number = new Intl.NumberFormat(i18n.language);

  const gauges: Gauge[] = [
    {
      id: 'photos',
      icon: 'images-outline',
      label: t('trust.ledger_photos'),
      value: number.format(photos),
      hint: t('trust.ledger_photos_hint'),
      guarded: false,
      tone: 'default',
    },
    {
      id: 'plates',
      icon: 'shield-checkmark',
      label: t('trust.ledger_plates'),
      value: number.format(plates),
      hint: t('trust.ledger_never'),
      guarded: true,
      tone: 'success',
    },
    {
      id: 'gps',
      icon: 'shield-checkmark',
      label: t('trust.ledger_gps'),
      value: number.format(gpsPoints),
      hint: t('trust.ledger_never'),
      guarded: true,
      tone: 'success',
    },
    {
      id: 'cities',
      icon: 'business-outline',
      label: t('trust.ledger_cities'),
      value: number.format(cities),
      hint: t('trust.ledger_cities_hint'),
      guarded: false,
      tone: 'default',
    },
  ];

  let aiValue = t('trust.ledger_ai_unknown');
  if (!aiEnabled) aiValue = t('trust.ledger_ai_off');
  else if (aiCallsLeft !== undefined && aiDailyLimit !== undefined) {
    aiValue = t('trust.ledger_ai_value', { left: number.format(aiCallsLeft), limit: number.format(aiDailyLimit) });
  }

  return (
    <View style={styles.ledger} testID={testID}>
      <View style={styles.grid}>
        {gauges.map((gauge) => (
          <View
            key={gauge.id}
            style={[styles.gauge, gauge.guarded && styles.guarded]}
            accessible
            accessibilityLabel={t('trust.ledger_item_a11y', {
              label: gauge.label,
              value: `${gauge.value}, ${gauge.hint}`,
            })}
            testID={`ledger-${gauge.id}`}
          >
            <View style={styles.gaugeHeader}>
              <Icon name={gauge.icon} size={18} tone={gauge.tone} />
              <Text variant="label" tone={gauge.guarded ? 'default' : 'muted'} numberOfLines={1}>
                {gauge.label}
              </Text>
            </View>
            {isLoading && !gauge.guarded ? (
              <Skeleton width={48} height={32} />
            ) : (
              <Text variant="number" tone={gauge.guarded ? 'success' : 'default'} testID={`ledger-${gauge.id}-value`}>
                {gauge.value}
              </Text>
            )}
            <Text variant="caption" tone={gauge.guarded ? 'success' : 'muted'}>
              {gauge.hint}
            </Text>
          </View>
        ))}
      </View>
      <View
        style={styles.aiRow}
        accessible
        accessibilityLabel={t('trust.ledger_item_a11y', { label: t('trust.ledger_ai'), value: aiValue })}
        testID="ledger-ai"
      >
        <Icon name="sparkles-outline" size={18} tone="default" />
        <Text variant="bodySm" tone="muted">
          {t('trust.ledger_ai')}
        </Text>
        <View style={styles.aiValue}>
          <Text variant="numberSm" align="right" testID="ledger-ai-value">
            {aiValue}
          </Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  ledger: { gap: spacing.smd },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.smd },
  gauge: {
    flexGrow: 1,
    flexBasis: '40%',
    minWidth: 140,
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: borders.hairline,
    borderColor: colors.border,
  },
  guarded: { backgroundColor: colors.successSoft, borderColor: colors.successSoft },
  gaugeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSunken,
  },
  aiValue: { flex: 1 },
}));
