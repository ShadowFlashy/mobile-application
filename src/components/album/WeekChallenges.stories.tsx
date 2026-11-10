import type { Meta, StoryObj } from '@storybook/react';
import { WeekChallenges } from './WeekChallenges';
import { SAMPLE_CHALLENGES, SAMPLE_WEEK_ENDS_AT } from './albumFixtures';

const meta: Meta<typeof WeekChallenges> = { title: 'Album/WeekChallenges', component: WeekChallenges };
export default meta;
type Story = StoryObj<typeof WeekChallenges>;

/** 2/3 spots, 0/1 orange car, and the Epic stretch done (it recedes to text-2). */
export const ThisWeek: Story = {
  args: { challenges: SAMPLE_CHALLENGES, endsAt: SAMPLE_WEEK_ENDS_AT, now: new Date('2026-11-10T12:50:00.000Z') },
};
export const WeekOver: Story = {
  args: { challenges: SAMPLE_CHALLENGES, endsAt: SAMPLE_WEEK_ENDS_AT, now: new Date('2026-11-16T10:00:00.000Z') },
};
