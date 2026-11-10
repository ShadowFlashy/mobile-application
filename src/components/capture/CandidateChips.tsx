import { useTranslation } from 'react-i18next';
import type { CarCandidate } from '../../utils/captureForm';
import { Row } from '../primitives/Row';
import { Tag } from '../primitives/Tag';

export interface CandidateChipsProps {
  candidates: readonly CarCandidate[];
  onPick: (candidate: CarCandidate) => void;
  testID?: string;
}

/**
 * Co-Driver's "Is it one of these?" guesses as chips (SPEC P0-05, §6.2): catalogue stickers by name,
 * cars outside the album marked as such, each with its confidence as a number (never colour alone).
 */
export function CandidateChips({ candidates, onPick, testID = 'candidate-chips' }: CandidateChipsProps) {
  const { t } = useTranslation();
  if (candidates.length === 0) return null;
  return (
    <Row gap="xs" wrap testID={testID}>
      {candidates.map((candidate, index) => {
        const car = `${candidate.make} ${candidate.modelName}`;
        const percent = Math.round(Math.min(1, Math.max(0, candidate.confidence)) * 100);
        const name = candidate.carModel !== undefined ? car : t('capture.candidate_free', { car });
        return (
          <Tag
            key={candidate.key}
            label={`${name} · ${t('co_driver.confidence_value', { percent })}`}
            icon={candidate.carModel !== undefined ? 'albums-outline' : 'help-circle-outline'}
            onPress={() => onPick(candidate)}
            testID={candidate.carModel !== undefined ? `candidate-${candidate.carModel.id}` : `candidate-text-${index}`}
          />
        );
      })}
    </Row>
  );
}
