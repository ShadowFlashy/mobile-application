import type { Meta, StoryObj } from '@storybook/react';
import { AchievementCabinet } from './AchievementCabinet';
import { sampleAchievements } from './fixtures';

const meta: Meta<typeof AchievementCabinet> = { title: 'Progress/AchievementCabinet', component: AchievementCabinet };
export default meta;
type Story = StoryObj<typeof AchievementCabinet>;

export const Cabinet: Story = {
  args: { achievements: sampleAchievements, isNew: (achievement) => achievement.id === 'collector' },
};
export const Empty: Story = {
  args: {
    achievements: sampleAchievements.map((achievement) => ({ ...achievement, tier: 0, value: 0, unlockedAt: {} })),
  },
};
