import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AchievementProgress } from '../../types/Progress';
import { Section } from '../primitives/Section';
import { AchievementRow } from './AchievementRow';

export interface AchievementListProps {
  achievements: readonly AchievementProgress[];
  /** True for a tier the user has not seen yet ("New"). */
  isNew?: (achievement: AchievementProgress) => boolean;
  /** Called when a row is opened (e.g. to mark it seen). */
  onOpen?: (achievement: AchievementProgress) => void;
  testID?: string;
}

/**
 * "Achievements": every achievement as a hairline row, with "4 of 15 earned" on the right of the
 * heading. Pressing a row opens its progress towards the next tier and marks it seen.
 */
export function AchievementList({ achievements, isNew, onOpen, testID = 'achievements' }: AchievementListProps) {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | undefined>(undefined);
  const earned = achievements.filter((achievement) => achievement.tier > 0).length;

  return (
    <Section
      title={t('progress.achievements_title')}
      meta={t('progress.achievements_meta', { count: earned, total: achievements.length })}
      testID={testID}
    >
      {achievements.map((achievement) => (
        <AchievementRow
          key={achievement.id}
          achievement={achievement}
          isNew={isNew?.(achievement) ?? false}
          open={openId === achievement.id}
          onPress={() => {
            setOpenId((current) => (current === achievement.id ? undefined : achievement.id));
            onOpen?.(achievement);
          }}
        />
      ))}
    </Section>
  );
}
