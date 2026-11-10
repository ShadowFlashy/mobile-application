import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { borders, createThemedStyles, spacing, touchTarget } from '../../theme';
import { Icon, type IconName } from '../primitives/Icon';
import { Text } from '../primitives/Text';

export interface OwnerVisibilityTableProps {
  /** The "Share my name with owners" setting: decides the username row. */
  shareName: boolean;
  testID?: string;
}

type RowKey =
  'car' | 'city' | 'hour' | 'photo' | 'name' | 'exact_time' | 'place' | 'notes' | 'plate' | 'other_spots' | 'account';
type Visibility = 'shown' | 'opt_in' | 'never';

/** What a verified owner's sighting contains (SPEC D-8, §12.1 c): a snapshot, never the spot row. */
const ROWS: readonly { key: RowKey; visibility: Visibility }[] = [
  { key: 'car', visibility: 'shown' },
  { key: 'city', visibility: 'shown' },
  { key: 'hour', visibility: 'shown' },
  { key: 'photo', visibility: 'shown' },
  { key: 'name', visibility: 'opt_in' },
  { key: 'exact_time', visibility: 'never' },
  { key: 'place', visibility: 'never' },
  { key: 'notes', visibility: 'never' },
  { key: 'plate', visibility: 'never' },
  { key: 'other_spots', visibility: 'never' },
  { key: 'account', visibility: 'never' },
];

const ROW_LABELS = {
  car: 'trust.owners_row_car',
  city: 'trust.owners_row_city',
  hour: 'trust.owners_row_hour',
  photo: 'trust.owners_row_photo',
  name: 'trust.owners_row_name',
  exact_time: 'trust.owners_row_exact_time',
  place: 'trust.owners_row_place',
  notes: 'trust.owners_row_notes',
  plate: 'trust.owners_row_plate',
  other_spots: 'trust.owners_row_other_spots',
  account: 'trust.owners_row_account',
} as const;

/**
 * "What owners see" (SPEC P0-18): every piece of a spot with whether a verified owner's sighting
 * shows it. Each status has an icon and a word, so it is never told by colour alone.
 */
export function OwnerVisibilityTable({ shareName, testID }: OwnerVisibilityTableProps) {
  const { t } = useTranslation();
  const styles = useStyles();

  const status = (visibility: Visibility): { shown: boolean; label: string; icon: IconName } => {
    if (visibility === 'shown') return { shown: true, label: t('trust.owners_shown'), icon: 'eye-outline' };
    if (visibility === 'opt_in') {
      return shareName
        ? { shown: true, label: t('trust.owners_opt_in_on'), icon: 'eye-outline' }
        : { shown: false, label: t('trust.owners_opt_in_off'), icon: 'eye-off-outline' };
    }
    return { shown: false, label: t('trust.owners_never'), icon: 'eye-off-outline' };
  };

  return (
    <View style={styles.table} accessibilityRole="list" testID={testID}>
      <View style={[styles.row, styles.headerRow]} importantForAccessibility="no-hide-descendants">
        <Text variant="label" tone="muted">
          {t('trust.owners_column_data')}
        </Text>
        <Text variant="label" tone="muted" align="right">
          {t('trust.owners_column_owner')}
        </Text>
      </View>
      {ROWS.map((row, index) => {
        const label = t(ROW_LABELS[row.key]);
        const cell = status(row.visibility);
        return (
          <View
            key={row.key}
            style={[styles.row, index > 0 && styles.divided]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={t('trust.owners_row_a11y', { label, status: cell.label })}
            testID={`owner-visibility-${row.key}`}
          >
            <View style={styles.labelCell}>
              <Text variant="bodySm">{label}</Text>
            </View>
            <View style={styles.statusCell}>
              <Icon name={cell.icon} size={16} tone={cell.shown ? 'default' : 'success'} />
              <Text
                variant="label"
                tone={cell.shown ? 'default' : 'success'}
                testID={`owner-visibility-${row.key}-status`}
              >
                {cell.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  table: {
    borderRadius: radii.md,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: touchTarget - spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerRow: { backgroundColor: colors.surfaceMuted, minHeight: 36 },
  divided: { borderTopWidth: borders.hairline, borderTopColor: colors.border },
  labelCell: { flex: 1 },
  statusCell: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
}));
