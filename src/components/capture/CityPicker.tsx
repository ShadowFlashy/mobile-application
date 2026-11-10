import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { PLACES } from '../../constants/places';
import type { Place } from '../../types/Location';
import { foldText } from '../../utils/carSearch';
import { placeLabel } from '../../utils/geo';
import { Icon } from '../primitives/Icon';
import { InputField } from '../primitives/InputField';
import { ListRow } from '../primitives/ListRow';
import { Sheet } from '../primitives/Sheet';
import { Stack } from '../primitives/Stack';

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
      <Stack gap="md">
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
        <View>
          {results.map((place) => {
            const label = placeLabel(place, i18n.language);
            return (
              <ListRow
                key={place.id}
                title={label}
                value={place.country}
                onPress={() => choose(label)}
                accessibilityLabel={`${label} (${place.country})`}
                testID={`city-option-${place.id}`}
              />
            );
          })}
          {typed.length > 0 && !exactMatch && (
            <ListRow
              title={t('capture.city_use_typed', { city: typed })}
              leading={<Icon name="plus" size={20} />}
              onPress={() => choose(typed)}
              testID="city-use-typed"
            />
          )}
          {value.length > 0 && (
            <ListRow title={t('capture.city_clear')} muted onPress={() => choose('')} testID="city-clear" />
          )}
        </View>
      </Stack>
    </Sheet>
  );
}
