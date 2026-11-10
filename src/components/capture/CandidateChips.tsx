import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import type { CarCandidate } from '../../utils/captureForm';
import { ListRow } from '../primitives/ListRow';

export interface CandidateChipsProps {
  candidates: readonly CarCandidate[];
  onPick: (candidate: CarCandidate) => void;
  testID?: string;
}

/**
 * Auto-fill's "Is it one of these?" guesses as hairline rows (SPEC P0-05, §6.2): catalogue stickers
 * by name, cars outside the album marked as such, each with its match as a number.
 */
export function CandidateChips({ candidates, onPick, testID = 'candidate-chips' }: CandidateChipsProps) {
  const { t } = useTranslation();
  if (candidates.length === 0) return null;
  return (
    <View testID={testID}>
      {candidates.map((candidate, index) => {
        const car = `${candidate.make} ${candidate.modelName}`;
        const percent = Math.round(Math.min(1, Math.max(0, candidate.confidence)) * 100);
        const match = t('co_driver.confidence_value', { percent });
        const isSticker = candidate.carModel !== undefined;
        return (
          <ListRow
            key={candidate.key}
            title={car}
            subtitle={isSticker ? undefined : t('picker.not_in_album')}
            value={match}
            onPress={() => onPick(candidate)}
            accessibilityLabel={`${isSticker ? car : t('capture.candidate_free', { car })}, ${t('co_driver.match_label', { percent })}`}
            testID={candidate.carModel !== undefined ? `candidate-${candidate.carModel.id}` : `candidate-text-${index}`}
          />
        );
      })}
    </View>
  );
}
