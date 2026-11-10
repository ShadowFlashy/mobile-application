import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CaptureForm } from '../../types/Capture';
import type { CarModel } from '../../types/CarModel';
import type { ConfidenceTier, Provenance } from '../../types/Identification';
import { bestMatch } from '../../utils/carSearch';
import { hasCar, type CarCandidate, type CarChoice } from '../../utils/captureForm';
import { CarModelPicker } from '../CarModelPicker';
import { Icon } from '../primitives/Icon';
import { InputField } from '../primitives/InputField';
import { Row } from '../primitives/Row';
import { Skeleton } from '../primitives/Skeleton';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Tag } from '../primitives/Tag';
import { Text } from '../primitives/Text';
import { StyledButton } from '../StyledButton';
import { CandidateChips } from './CandidateChips';
import { ConfidenceMeter } from './ConfidenceMeter';
import { ProvenanceTag } from './ProvenanceTag';

export interface IdentityCardProps {
  form: Pick<CaptureForm, 'carModelId' | 'make' | 'model' | 'generation' | 'yearFrom' | 'yearTo'>;
  models: readonly CarModel[];
  /** Who filled the car in (undefined = nobody yet). */
  provenance?: Provenance;
  /** Co-Driver's tier and confidence, when it identified the car. */
  tier?: ConfidenceTier;
  confidence?: number;
  /** "Is it one of these?" chips (guess tier). */
  candidates?: readonly CarCandidate[];
  /** Co-Driver is still analysing: a shimmer where the car will appear. */
  isAnalysing?: boolean;
  /** Co-Driver's English fun fact; shown only when the UI language is English. */
  funFact?: string;
  onChooseCar: (choice: CarChoice) => void;
  testID?: string;
}

/**
 * The car on this photo (SPEC P0-05): Co-Driver's answer with its confidence and provenance, a
 * "Check the model" hint when it is only likely, "Is it one of these?" with candidates when it is
 * a guess, and the catalogue search. Free text appears only after "Not in the album", and a typed
 * name that clearly is a sticker suggests that sticker.
 */
export function IdentityCard({
  form,
  models,
  provenance,
  tier,
  confidence,
  candidates = [],
  isAnalysing = false,
  funFact,
  onChooseCar,
  testID = 'identity-card',
}: IdentityCardProps) {
  const { t, i18n } = useTranslation();
  const [isTyping, setIsTyping] = useState(false);
  const selected = models.find((model) => model.id === form.carModelId);
  const aiConfidence = provenance === 'ai' && tier !== undefined ? confidence : undefined;
  const years =
    form.yearFrom === undefined
      ? undefined
      : form.yearTo !== undefined && form.yearTo !== form.yearFrom
        ? t('capture.years_range', { from: form.yearFrom, to: form.yearTo })
        : t('capture.years_since', { from: form.yearFrom });

  const header = (
    <Row gap="sm" justify="space-between" align="center" wrap>
      <Text variant="label" tone="muted">
        {t('capture.section_car')}
      </Text>
      {provenance !== undefined && <ProvenanceTag provenance={provenance} />}
    </Row>
  );

  // 1. Typing a car that is not in the album.
  if (isTyping) {
    const suggestion = bestMatch(models, `${form.make} ${form.model}`);
    return (
      <Surface variant="raised" padding="md" testID={testID}>
        <Stack gap="md">
          {header}
          <InputField
            label={t('capture.make_label')}
            value={form.make}
            onChangeText={(make) => onChooseCar({ kind: 'text', make, model: form.model })}
            placeholder={t('capture.make_placeholder')}
            autoCapitalize="words"
            maxLength={40}
            testID="make-input"
          />
          <InputField
            label={t('capture.model_label')}
            value={form.model}
            onChangeText={(model) => onChooseCar({ kind: 'text', make: form.make, model })}
            placeholder={t('capture.model_placeholder')}
            autoCapitalize="words"
            maxLength={60}
            testID="model-input"
          />
          {suggestion !== undefined && (
            <Surface variant="sunken" padding="smd" testID="alias-suggestion">
              <Stack gap="sm">
                <Text variant="bodySm">
                  {t('capture.alias_suggestion', {
                    number: suggestion.stickerNumber,
                    car: `${suggestion.make} ${suggestion.model}`,
                  })}
                </Text>
                <StyledButton
                  label={t('capture.use_sticker')}
                  variant="secondary"
                  icon="albums-outline"
                  onPress={() => {
                    setIsTyping(false);
                    onChooseCar({ kind: 'model', model: suggestion });
                  }}
                  testID="use-alias-sticker"
                />
              </Stack>
            </Surface>
          )}
          <StyledButton
            label={t('capture.change_car')}
            variant="ghost"
            onPress={() => {
              setIsTyping(false);
              onChooseCar({ kind: 'text', make: '', model: '' });
            }}
            testID="back-to-search"
          />
        </Stack>
      </Surface>
    );
  }

  // 2. A car is chosen (a sticker, or a wildcard name from Co-Driver).
  if (hasCar(form)) {
    return (
      <Surface variant="raised" padding="md" testID={testID}>
        <Stack gap="smd">
          {header}
          <Text variant="title" testID="identity-car-name">
            {selected !== undefined ? `${selected.make} ${selected.model}` : `${form.make} ${form.model}`}
          </Text>
          {(form.generation.length > 0 || years !== undefined) && (
            <Row gap="xs" wrap>
              {form.generation.length > 0 && <Tag label={t('capture.generation', { generation: form.generation })} />}
              {years !== undefined && <Tag label={years} />}
            </Row>
          )}
          {aiConfidence !== undefined && <ConfidenceMeter confidence={aiConfidence} testID={`${testID}-confidence`} />}
          {aiConfidence !== undefined && tier === 'likely' && (
            <Row gap="xs" align="center" testID="check-model-hint">
              <Icon name="alert-circle-outline" tone="warning" size={18} />
              <Text variant="bodyStrong" tone="warning">
                {t('capture.check_model')}
              </Text>
            </Row>
          )}
          {funFact !== undefined && funFact.length > 0 && i18n.language.startsWith('en') && (
            <Surface variant="sunken" padding="smd" testID="fun-fact">
              <Stack gap="xxs">
                <Text variant="caption" tone="muted">
                  {t('co_driver.fun_fact_label')}
                </Text>
                <Text variant="bodySm">{funFact}</Text>
              </Stack>
            </Surface>
          )}
          <StyledButton
            label={t('capture.change_car')}
            variant="ghost"
            icon="swap-horizontal"
            onPress={() => onChooseCar({ kind: 'text', make: '', model: '' })}
            testID="change-car"
          />
        </Stack>
      </Surface>
    );
  }

  // 3. No car yet: analysing, Co-Driver's guesses, or the search.
  return (
    <Surface variant="raised" padding="md" testID={testID}>
      <Stack gap="md">
        {header}
        {isAnalysing ? (
          <Stack gap="xs" testID={`${testID}-analysing`}>
            <Skeleton height={28} width="70%" />
            <Text variant="caption" tone="muted">
              {t('co_driver.analysing')}
            </Text>
          </Stack>
        ) : (
          tier === 'guess' &&
          candidates.length > 0 && (
            <Stack gap="sm" testID="guess-candidates">
              <Text variant="headline">{t('capture.is_it_one_of')}</Text>
              {confidence !== undefined && <ConfidenceMeter confidence={confidence} testID={`${testID}-confidence`} />}
              <CandidateChips
                candidates={candidates}
                onPick={(candidate) =>
                  candidate.carModel !== undefined
                    ? onChooseCar({ kind: 'model', model: candidate.carModel })
                    : onChooseCar({ kind: 'text', make: candidate.make, model: candidate.modelName })
                }
              />
            </Stack>
          )
        )}
        <CarModelPicker
          models={models}
          selectedId={undefined}
          onSelect={(model) => {
            if (model !== undefined) onChooseCar({ kind: 'model', model });
          }}
          isOtherSelected={false}
          onChooseOther={() => setIsTyping(true)}
          label={t('capture.car_missing')}
        />
      </Stack>
    </Surface>
  );
}
