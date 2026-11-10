import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import type { CaptureForm } from '../../types/Capture';
import type { CarModel } from '../../types/CarModel';
import type { ConfidenceTier, Provenance } from '../../types/Identification';
import { bestMatch } from '../../utils/carSearch';
import { hasCar, type CarCandidate, type CarChoice } from '../../utils/captureForm';
import { CarModelPicker } from '../CarModelPicker';
import { Icon } from '../primitives/Icon';
import { InputField } from '../primitives/InputField';
import { Section } from '../primitives/Section';
import { Skeleton } from '../primitives/Skeleton';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { StyledButton } from '../StyledButton';
import { CandidateChips } from './CandidateChips';

export interface IdentityCardProps {
  form: Pick<CaptureForm, 'carModelId' | 'make' | 'model' | 'generation' | 'yearFrom' | 'yearTo'>;
  models: readonly CarModel[];
  /** Who filled the car in (undefined = nobody yet). */
  provenance?: Provenance;
  /** Auto-fill's tier and confidence, when it identified the car. */
  tier?: ConfidenceTier;
  confidence?: number;
  /** "Is it one of these?" rows (guess tier). */
  candidates?: readonly CarCandidate[];
  /** Auto-fill is still analysing: a placeholder bar where the car will appear. */
  isAnalysing?: boolean;
  /** Auto-fill's English fun fact; shown only when the UI language is English. */
  funFact?: string;
  onChooseCar: (choice: CarChoice) => void;
  /** More rows of the "Car" section, under the car (the sticker and challenge rows). */
  children?: ReactNode;
  testID?: string;
}

/** "94% match": the figure in Barlow Condensed, the word in text-2, on one baseline. */
function MatchMeta({ confidence, testID }: { confidence: number; testID: string }) {
  const { t } = useTranslation();
  const percent = Math.round(Math.min(1, Math.max(0, confidence)) * 100);
  const figure = t('co_driver.confidence_value', { percent });
  const word = t('co_driver.match');
  return (
    <Text variant="num" accessibilityLabel={`${figure} ${word}`} testID={testID}>
      {figure}
      <Text variant="meta" tone="text2">
        {` ${word}`}
      </Text>
    </Text>
  );
}

/**
 * A's "Car" section of the New spot review (SPEC P0-05): the heading with "94% match" (or who filled
 * it in), the car row with its generation and years and a "Change" action, a "Check the model" row
 * when auto-fill is only likely, "Is it one of these?" rows when it is a guess, and the catalogue
 * search. Free text appears only after "Not in the album", and a typed name that clearly is a
 * sticker suggests that sticker.
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
  children,
  testID = 'identity-card',
}: IdentityCardProps) {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const [isTyping, setIsTyping] = useState(false);
  const selected = models.find((model) => model.id === form.carModelId);
  const carChosen = hasCar(form);
  const aiConfidence = provenance === 'ai' && tier !== undefined ? confidence : undefined;
  const shownConfidence = carChosen ? aiConfidence : tier === 'guess' ? confidence : undefined;
  const years =
    form.yearFrom === undefined
      ? undefined
      : form.yearTo !== undefined && form.yearTo !== form.yearFrom
        ? t('capture.years_range', { from: form.yearFrom, to: form.yearTo })
        : t('capture.years_since', { from: form.yearFrom });
  const carMeta = [
    form.generation.length > 0 ? t('capture.generation', { generation: form.generation }) : undefined,
    years,
  ]
    .filter((part): part is string => part !== undefined)
    .join(' · ');

  const section = (content: ReactNode) => (
    <Section
      title={t('capture.section_car')}
      meta={
        shownConfidence === undefined && provenance !== undefined ? t(`capture.provenance_${provenance}`) : undefined
      }
      action={
        shownConfidence !== undefined ? (
          <MatchMeta confidence={shownConfidence} testID={`${testID}-confidence`} />
        ) : undefined
      }
      testID={testID}
    >
      {content}
      {children}
    </Section>
  );

  // 1. Typing a car that is not in the album.
  if (isTyping) {
    const suggestion = bestMatch(models, `${form.make} ${form.model}`);
    return section(
      <>
        <Stack gap="md">
          <View style={styles.top} />
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
        </Stack>
        {suggestion !== undefined && (
          <View style={styles.row} testID="alias-suggestion">
            <View style={styles.flex}>
              <Text variant="body">
                {t('capture.alias_suggestion', {
                  number: suggestion.stickerNumber,
                  car: `${suggestion.make} ${suggestion.model}`,
                })}
              </Text>
            </View>
            <StyledButton
              label={t('capture.use_sticker')}
              variant="text"
              onPress={() => {
                setIsTyping(false);
                onChooseCar({ kind: 'model', model: suggestion });
              }}
              testID="use-alias-sticker"
            />
          </View>
        )}
        <View style={styles.row}>
          <StyledButton
            label={t('capture.search_album')}
            variant="text"
            icon="search"
            onPress={() => {
              setIsTyping(false);
              onChooseCar({ kind: 'text', make: '', model: '' });
            }}
            testID="back-to-search"
          />
        </View>
      </>,
    );
  }

  // 2. A car is chosen (a sticker, or a wildcard name from auto-fill or typed).
  if (carChosen) {
    return section(
      <>
        <View style={[styles.row, styles.tall]}>
          <View style={styles.flex}>
            <Text variant="bodyL" numberOfLines={2} testID="identity-car-name">
              {selected !== undefined ? `${selected.make} ${selected.model}` : `${form.make} ${form.model}`}
            </Text>
            {carMeta.length > 0 && (
              <Text variant="meta" tone="text2" numberOfLines={1}>
                {carMeta}
              </Text>
            )}
          </View>
          <StyledButton
            label={t('common.change')}
            variant="text"
            accessibilityHint={t('capture.change_car')}
            onPress={() => onChooseCar({ kind: 'text', make: '', model: '' })}
            testID="change-car"
          />
        </View>
        {aiConfidence !== undefined && tier === 'likely' && (
          <View style={styles.row} testID="check-model-hint">
            <Icon name="alert" size={20} />
            <View style={styles.flex}>
              <Text variant="body">{t('capture.check_model')}</Text>
            </View>
          </View>
        )}
        {funFact !== undefined && funFact.length > 0 && i18n.language.startsWith('en') && (
          <View style={[styles.row, styles.paragraph]} testID="fun-fact">
            <View style={styles.flex}>
              <Text variant="value">{funFact}</Text>
              <Text variant="meta" tone="text2">
                {t('co_driver.fun_fact_label')}
              </Text>
            </View>
          </View>
        )}
      </>,
    );
  }

  // 3. No car yet: analysing, auto-fill's guesses, or the search.
  return section(
    <Stack gap="md">
      {isAnalysing ? (
        <View style={[styles.row, styles.tall]} testID={`${testID}-analysing`}>
          <View style={styles.flex}>
            <Skeleton height={20} width="60%" />
          </View>
        </View>
      ) : (
        tier === 'guess' &&
        candidates.length > 0 && (
          <View testID="guess-candidates">
            <View style={styles.row}>
              <Text variant="body">{t('capture.is_it_one_of')}</Text>
            </View>
            <CandidateChips
              candidates={candidates}
              onPick={(candidate) =>
                candidate.carModel !== undefined
                  ? onChooseCar({ kind: 'model', model: candidate.carModel })
                  : onChooseCar({ kind: 'text', make: candidate.make, model: candidate.modelName })
              }
            />
          </View>
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
    </Stack>,
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  top: { height: spacing.xs },
  row: {
    minHeight: rowHeights.default,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.xs,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  tall: { minHeight: rowHeights.tall },
  paragraph: { paddingVertical: spacing.smd },
  flex: { flex: 1, minWidth: 0 },
}));
