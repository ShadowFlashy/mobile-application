import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PLACES } from '../../constants/places';
import type { Place } from '../../types/Location';
import { foldText } from '../../utils/carSearch';
import { placeLabel } from '../../utils/geo';
import { InputField } from '../primitives/InputField';
import { Sheet } from '../primitives/Sheet';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';
import { Row } from '../primitives/Row';
import { Icon } from '../primitives/Icon';

export interface CityPickerProps {
  visible: boolean;
  onClose: () => void;
  /** The current city label. */
  value: string;
  /** Called with the chosen label ('' = no city). */
  onSelect: (city: string) => void;
  /** Places to search (default: the bundled gazetteer). */
  places?: readonly Place[];
  testID?: string;
}

const MAX_RESULTS = 8;
const MAX_CITY = 60;

/**
 * A bottom sheet to pick the city from the bundled gazetteer (en/nl names, accents folded), or to
 * type any other place. Only this label is ever stored; positions never leave the phone (D-7).
 */
export function CityPicker({
  visible,
  onClose,
  value,
  onSelect,
  places = PLACES,
  testID = 'city-picker',
}: CityPickerProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const folded = foldText(query);
  const typed = query.trim().slice(0, MAX_CITY);

  const results = useMemo(() => {
    if (folded.length === 0) return [];
    return places
      .filter((place) => foldText(place.nameEn).includes(folded) || foldText(place.nameNl).includes(folded))
      .sort((a, b) => {
        const aStarts = foldText(placeLabel(a, i18n.language)).startsWith(folded) ? 0 : 1;
        const bStarts = foldText(placeLabel(b, i18n.language)).startsWith(folded) ? 0 : 1;
        return aStarts - bStarts;
      })
      .slice(0, MAX_RESULTS);
  }, [folded, places, i18n.language]);

  const choose = (city: string) => {
    setQuery('');
    onSelect(city);
    onClose();
  };
  const exactMatch = results.some((place) => foldText(placeLabel(place, i18n.language)) === folded);

  return (
    <Sheet visible={visible} onClose={onClose} title={t('capture.city_sheet_title')} testID={testID}>
      <Stack gap="sm">
        <InputField
          label={t('capture.city_search')}
          value={query}
          onChangeText={setQuery}
          placeholder={value.length > 0 ? value : t('capture.city_placeholder')}
          hint={t('capture.city_hint')}
          autoCapitalize="words"
          maxLength={MAX_CITY}
          testID="city-search"
        />
        {results.map((place) => {
          const label = placeLabel(place, i18n.language);
          return (
            <Surface
              key={place.id}
              variant="flat"
              padding="smd"
              onPress={() => choose(label)}
              accessibilityLabel={`${label} (${place.country})`}
              testID={`city-option-${place.id}`}
            >
              <Row gap="sm" align="center">
                <Icon name="location-outline" tone="muted" size={18} />
                <Text variant="bodyStrong">{label}</Text>
                <Text variant="caption" tone="muted">
                  {place.country}
                </Text>
              </Row>
            </Surface>
          );
        })}
        {typed.length > 0 && !exactMatch && (
          <Surface variant="sunken" padding="smd" onPress={() => choose(typed)} testID="city-use-typed">
            <Text variant="bodyStrong">{t('capture.city_use_typed', { city: typed })}</Text>
          </Surface>
        )}
        {value.length > 0 && (
          <Surface variant="sunken" padding="smd" onPress={() => choose('')} testID="city-clear">
            <Text variant="bodySm" tone="muted">
              {t('capture.city_clear')}
            </Text>
          </Surface>
        )}
      </Stack>
    </Sheet>
  );
}
