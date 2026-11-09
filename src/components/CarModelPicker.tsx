import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import type { CarModel } from '../types/CarModel';
import { Card } from './primitives/Card';
import { Icon } from './primitives/Icon';
import { InputField } from './primitives/InputField';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Tag } from './primitives/Tag';
import { Text } from './primitives/Text';
import { RarityBadge } from './RarityBadge';

interface CarModelPickerProps {
  models: CarModel[];
  selectedId?: string;
  /** Called with undefined when the user chooses "not in the sticker book". */
  onSelect: (model?: CarModel) => void;
  isOtherSelected: boolean;
}

const MAX_RESULTS = 6;

function matches(model: CarModel, query: string): boolean {
  const haystack = `${model.make} ${model.model}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .every((word) => haystack.includes(word));
}

/** Search the sticker catalogue, or choose "Other" for cars that are not in the book. */
export function CarModelPicker({ models, selectedId, onSelect, isOtherSelected }: CarModelPickerProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const selected = models.find((model) => model.id === selectedId);
  const trimmedQuery = query.trim();

  const results = useMemo(() => {
    if (trimmedQuery.length === 0) return [];
    return models.filter((model) => matches(model, trimmedQuery)).slice(0, MAX_RESULTS);
  }, [models, trimmedQuery]);

  if (selected !== undefined) {
    return (
      <Card variant="highlight" testID="selected-car-model">
        <Stack padding="md">
          <Row gap="md" justify="space-between">
            <Stack gap="xs" flex={1}>
              <Text size="sm" color={colors.textMuted}>
                {t('picker.sticker_number', { number: selected.stickerNumber })}
              </Text>
              <Text weight="bold">
                {selected.make} {selected.model}
              </Text>
              <RarityBadge rarity={selected.rarity} />
            </Stack>
            <Tag label={t('picker.change')} onPress={() => onSelect(undefined)} testID="change-car-model" />
          </Row>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="sm">
      <InputField
        label={t('picker.label')}
        value={query}
        onChangeText={setQuery}
        placeholder={t('picker.placeholder')}
        hint={isOtherSelected ? t('picker.hint_other') : t('picker.hint')}
        autoCapitalize="words"
        testID="car-model-search"
      />
      {results.map((model) => (
        <Card
          key={model.id}
          onPress={() => {
            setQuery('');
            onSelect(model);
          }}
          accessibilityLabel={t('picker.choose', { car: `${model.make} ${model.model}` })}
          testID={`car-model-option-${model.id}`}
        >
          <Stack padding="md">
            <Row gap="md" justify="space-between">
              <Stack gap="xs" flex={1}>
                <Text weight="bold">
                  {model.make} {model.model}
                </Text>
                <Text size="sm" color={colors.textMuted}>
                  {t('picker.sticker_number', { number: model.stickerNumber })}
                </Text>
              </Stack>
              <Icon name="add-circle-outline" color={colors.accent} />
            </Row>
          </Stack>
        </Card>
      ))}
      {trimmedQuery.length > 0 && results.length === 0 && (
        <Text size="sm" color={colors.textMuted}>
          {t('picker.no_results', { query: trimmedQuery })}
        </Text>
      )}
    </Stack>
  );
}
