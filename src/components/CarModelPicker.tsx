import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CarModel } from '../types/CarModel';
import { searchCatalogue } from '../utils/carSearch';
import { Icon } from './primitives/Icon';
import { InputField } from './primitives/InputField';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Surface } from './primitives/Surface';
import { Tag } from './primitives/Tag';
import { Text } from './primitives/Text';
import { RarityBadge } from './RarityBadge';

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
 * Search the sticker catalogue with everyday spellings (carSearch: accents, nicknames, aliases).
 * Free text is never offered before "Not in the album" (SPEC P0-07).
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
      <Surface variant="raised" padding="md" testID="selected-car-model">
        <Row gap="md" justify="space-between" align="center">
          <Stack gap="xs" flex={1}>
            <Text variant="stickerNo" tone="muted">
              {t('picker.sticker_number', { number: selected.stickerNumber })}
            </Text>
            <Text variant="bodyStrong">
              {selected.make} {selected.model}
            </Text>
            <RarityBadge rarity={selected.rarity} />
          </Stack>
          <Tag label={t('picker.change')} onPress={() => onSelect(undefined)} testID="change-car-model" />
        </Row>
      </Surface>
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
      {results.map((model) => (
        <Surface
          key={model.id}
          variant="flat"
          padding="smd"
          onPress={() => {
            setQuery('');
            onSelect(model);
          }}
          accessibilityLabel={t('picker.choose', { car: `${model.make} ${model.model}` })}
          testID={`car-model-option-${model.id}`}
        >
          <Row gap="md" justify="space-between" align="center">
            <Stack gap="xxs" flex={1}>
              <Text variant="bodyStrong">
                {model.make} {model.model}
              </Text>
              <Text variant="caption" tone="muted">
                {t('picker.sticker_number', { number: model.stickerNumber })}
              </Text>
            </Stack>
            <Icon name="add-circle-outline" tone="accent" />
          </Row>
        </Surface>
      ))}
      {trimmedQuery.length > 0 && results.length === 0 && (
        <Text variant="bodySm" tone="muted" testID="car-model-no-results">
          {t('picker.no_results', { query: trimmedQuery })}
        </Text>
      )}
      {onChooseOther !== undefined && !isOtherSelected && (
        <Surface
          variant="sunken"
          padding="smd"
          onPress={onChooseOther}
          accessibilityLabel={`${t('picker.not_in_album')}. ${t('picker.not_in_album_hint')}`}
          testID="not-in-album-button"
        >
          <Row gap="sm" align="center">
            <Icon name="help-circle-outline" tone="muted" />
            <Stack gap="xxs" flex={1}>
              <Text variant="bodyStrong">{t('picker.not_in_album')}</Text>
              <Text variant="caption" tone="muted">
                {t('picker.not_in_album_hint')}
              </Text>
            </Stack>
          </Row>
        </Surface>
      )}
    </Stack>
  );
}
