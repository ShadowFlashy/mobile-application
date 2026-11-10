import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CarModel } from '../types/CarModel';
import { searchCatalogue } from '../utils/carSearch';
import { Icon } from './primitives/Icon';
import { InputField } from './primitives/InputField';
import { ListRow } from './primitives/ListRow';
import { RarityRoundel } from './primitives/RarityRoundel';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';
import { StyledButton } from './StyledButton';

interface CarModelPickerProps {
  models: readonly CarModel[];
  selectedId?: string;
  /** Called with undefined when the user clears the choice ("Change"). */
  onSelect: (model?: CarModel) => void;
  /** True when the car is saved outside the album (free text is shown by the parent). */
  isOtherSelected: boolean;
  /** Shows a "Not in the album" action; the parent then shows free-text make and model fields. */
  onChooseOther?: () => void;
  /** Search box label (default "Which car is it?"). */
  label?: string;
  testID?: string;
}

const MAX_RESULTS = 6;

/**
 * Search the sticker catalogue with everyday spellings (carSearch: accents, nicknames, aliases), as
 * a search field over hairline rows. Free text is never offered before "Not in the album".
 */
export function CarModelPicker({
  models,
  selectedId,
  onSelect,
  isOtherSelected,
  onChooseOther,
  label,
  testID = 'car-model-picker',
}: CarModelPickerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const selected = models.find((model) => model.id === selectedId);
  const trimmedQuery = query.trim();

  const results = useMemo(
    () => (trimmedQuery.length === 0 ? [] : searchCatalogue(models, trimmedQuery, MAX_RESULTS)),
    [models, trimmedQuery],
  );

  if (selected !== undefined) {
    return (
      <ListRow
        title={`${selected.make} ${selected.model}`}
        subtitle={t('picker.sticker_number', { number: selected.stickerNumber })}
        kind="primary"
        trailing={
          <Row gap="md" align="center">
            <RarityRoundel rarity={selected.rarity} showLabel />
            <StyledButton
              label={t('picker.change')}
              variant="text"
              onPress={() => onSelect(undefined)}
              testID="change-car-model"
            />
          </Row>
        }
        testID="selected-car-model"
      />
    );
  }

  return (
    <Stack gap="sm" testID={testID}>
      <InputField
        label={label ?? t('picker.label')}
        value={query}
        onChangeText={setQuery}
        placeholder={t('picker.placeholder')}
        hint={isOtherSelected ? t('picker.hint_other') : t('picker.hint')}
        autoCapitalize="none"
        testID="car-model-search"
      />
      {results.length > 0 && (
        <Stack>
          {results.map((model) => (
            <ListRow
              key={model.id}
              title={`${model.make} ${model.model}`}
              subtitle={t('picker.sticker_number', { number: model.stickerNumber })}
              trailing={<Icon name="plus" size={20} tone="text" />}
              onPress={() => {
                setQuery('');
                onSelect(model);
              }}
              accessibilityLabel={t('picker.choose', { car: `${model.make} ${model.model}` })}
              testID={`car-model-option-${model.id}`}
            />
          ))}
        </Stack>
      )}
      {trimmedQuery.length > 0 && results.length === 0 && (
        <Text variant="meta" tone="text2" testID="car-model-no-results">
          {t('picker.no_results', { query: trimmedQuery })}
        </Text>
      )}
      {onChooseOther !== undefined && !isOtherSelected && (
        <ListRow
          title={t('picker.not_in_album')}
          subtitle={t('picker.not_in_album_hint')}
          leading={<Icon name="help" size={20} tone="text2" />}
          chevron
          onPress={onChooseOther}
          accessibilityLabel={`${t('picker.not_in_album')}. ${t('picker.not_in_album_hint')}`}
          testID="not-in-album-button"
        />
      )}
    </Stack>
  );
}
