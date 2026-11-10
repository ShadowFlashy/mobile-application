import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Icon, type IconName } from '../primitives/Icon';
import { Text } from '../primitives/Text';
import { TableHeader, TableRow } from './TableRow';

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
 * "What owners see" (SPEC P0-18) as a hairline table: every piece of a spot with whether a verified
 * owner's sighting shows it. Each status is an eye icon plus a word, never colour alone; hidden
 * items recede to text-2.
 */
export function OwnerVisibilityTable({ shareName, testID }: OwnerVisibilityTableProps) {
  const { t } = useTranslation();

  const status = (visibility: Visibility): { shown: boolean; label: string; icon: IconName } => {
    if (visibility === 'shown') return { shown: true, label: t('trust.owners_shown'), icon: 'eye' };
    if (visibility === 'opt_in') {
      return shareName
        ? { shown: true, label: t('trust.owners_opt_in_on'), icon: 'eye' }
        : { shown: false, label: t('trust.owners_opt_in_off'), icon: 'eye-off' };
    }
    return { shown: false, label: t('trust.owners_never'), icon: 'eye-off' };
  };

  return (
    <View accessibilityRole="list" testID={testID}>
      <TableHeader left={t('trust.owners_column_data')} right={t('trust.owners_column_owner')} />
      {ROWS.map((row) => {
        const label = t(ROW_LABELS[row.key]);
        const cell = status(row.visibility);
        const tone = cell.shown ? 'text' : 'text2';
        return (
          <TableRow
            key={row.key}
            label={label}
            accessibilityLabel={t('trust.owners_row_a11y', { label, status: cell.label })}
            value={
              <>
                <Icon name={cell.icon} size={16} tone={tone} />
                <Text variant="value" tone={tone} testID={`owner-visibility-${row.key}-status`}>
                  {cell.label}
                </Text>
              </>
            }
            testID={`owner-visibility-${row.key}`}
          />
        );
      })}
    </View>
  );
}
