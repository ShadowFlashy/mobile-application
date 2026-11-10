import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import type { TrustLedgerData } from '../../utils/trustLedger';
import { Skeleton } from '../primitives/Skeleton';
import { Text } from '../primitives/Text';
import { TableRow } from './TableRow';

export type TrustLedgerProps = Pick<TrustLedgerData, 'photos' | 'plates' | 'gpsPoints' | 'cities'> & {
  isLoading?: boolean;
  testID?: string;
};

interface LedgerItem {
  id: string;
  label: string;
  value: string;
  hint: string;
  /** Licence plates and GPS points: always 0, so they never wait for the spots to load. */
  guaranteed: boolean;
}

/**
 * "What Redline stores" (SPEC P0-18) as a hairline table: blurred photos and cities counted from the
 * user's own spots, and licence plates and GPS points, which are always 0 with "Never stored" in
 * words. Each row is read as one sentence ("Licence plates: 0, Never stored").
 */
export function TrustLedger({ photos, plates, gpsPoints, cities, isLoading = false, testID }: TrustLedgerProps) {
  const { t, i18n } = useTranslation();
  const number = new Intl.NumberFormat(i18n.language);

  const items: LedgerItem[] = [
    {
      id: 'photos',
      label: t('trust.ledger_photos'),
      value: number.format(photos),
      hint: t('trust.ledger_photos_hint'),
      guaranteed: false,
    },
    {
      id: 'plates',
      label: t('trust.ledger_plates'),
      value: number.format(plates),
      hint: t('trust.ledger_never'),
      guaranteed: true,
    },
    {
      id: 'gps',
      label: t('trust.ledger_gps'),
      value: number.format(gpsPoints),
      hint: t('trust.ledger_never'),
      guaranteed: true,
    },
    {
      id: 'cities',
      label: t('trust.ledger_cities'),
      value: number.format(cities),
      hint: t('trust.ledger_cities_hint'),
      guaranteed: false,
    },
  ];

  return (
    <View testID={testID}>
      {items.map((item) => (
        <TableRow
          key={item.id}
          label={item.label}
          hint={item.hint}
          accessibilityLabel={t('trust.ledger_item_a11y', { label: item.label, value: `${item.value}, ${item.hint}` })}
          value={
            isLoading && !item.guaranteed ? (
              <Skeleton width={32} height={20} />
            ) : (
              <Text variant="num" align="right" testID={`ledger-${item.id}-value`}>
                {item.value}
              </Text>
            )
          }
          testID={`ledger-${item.id}`}
        />
      ))}
    </View>
  );
}
