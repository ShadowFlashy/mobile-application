import type { Meta, StoryObj } from '@storybook/react';
import { sampleStreak } from './fixtures';
import { StreakCounter } from './StreakCounter';

const meta: Meta<typeof StreakCounter> = { title: 'Progress/StreakCounter', component: StreakCounter };
export default meta;
type Story = StoryObj<typeof StreakCounter>;

export const AtRisk: Story = { args: { streak: sampleStreak } };
export const ThisWeekDone: Story = {
  args: {
    streak: { current: 7, best: 9, atRisk: false, lastWeeks: [false, true, true, true, true, true, true, true] },
  },
};
export const NoStreak: Story = {
  args: {
    streak: { current: 0, best: 2, atRisk: false, lastWeeks: [true, true, false, false, false, false, false, false] },
  },
};
