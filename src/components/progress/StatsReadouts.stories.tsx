import type { Meta, StoryObj } from '@storybook/react';
import { levelForXp } from '../../utils/progression';
import { sampleLevel, sampleStreak } from './fixtures';
import { LevelReadout } from './LevelReadout';
import { StatsReadouts } from './StatsReadouts';
import { StreakReadout } from './StreakReadout';

const meta: Meta<typeof StatsReadouts> = {
  title: 'Progress/StatsReadouts',
  component: StatsReadouts,
  args: { level: sampleLevel, stickers: { collected: 10, total: 118 }, spots: 14, streak: sampleStreak },
};
export default meta;
type Story = StoryObj<typeof StatsReadouts>;

export const MidSeason: Story = {};
export const Rookie: Story = {
  args: {
    level: levelForXp(0),
    stickers: { collected: 0, total: 118 },
    spots: 0,
    streak: { current: 0, best: 0, atRisk: false, lastWeeks: [false, false, false, false, false, false, false, false] },
  },
};
export const Level: Story = { render: () => <LevelReadout level={levelForXp(3015)} /> };
export const StreakThisWeek: Story = {
  render: () => (
    <StreakReadout
      streak={{ current: 7, best: 9, atRisk: false, lastWeeks: [false, true, true, true, true, true, true, true] }}
    />
  ),
};
