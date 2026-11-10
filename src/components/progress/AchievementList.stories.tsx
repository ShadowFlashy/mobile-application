import type { Meta, StoryObj } from '@storybook/react';
import { AchievementList } from './AchievementList';
import { AchievementRow } from './AchievementRow';
import { sampleAchievements } from './fixtures';

const meta: Meta<typeof AchievementList> = { title: 'Progress/AchievementList', component: AchievementList };
export default meta;
type Story = StoryObj<typeof AchievementList>;

const [gold, , silver, locked, , secret] = sampleAchievements;

export const List: Story = {
  args: { achievements: sampleAchievements, isNew: (achievement) => achievement.id === 'collector' },
};
export const NothingEarned: Story = {
  args: {
    achievements: sampleAchievements.map((achievement) => ({ ...achievement, tier: 0, value: 0, unlockedAt: {} })),
  },
};
export const GoldRow: Story = { render: () => <>{gold !== undefined && <AchievementRow achievement={gold} />}</> };
export const SilverOpen: Story = {
  render: () => <>{silver !== undefined && <AchievementRow achievement={silver} isNew open />}</>,
};
export const LockedRow: Story = {
  render: () => <>{locked !== undefined && <AchievementRow achievement={locked} />}</>,
};
export const SecretRow: Story = {
  render: () => <>{secret !== undefined && <AchievementRow achievement={secret} />}</>,
};
