import type { Meta, StoryObj } from '@storybook/react';
import { SAMPLE_WEEK_ENDS_AT, sampleChallenges } from './fixtures';
import { ChallengeList } from './ChallengeList';
import { ChallengeRow } from './ChallengeRow';

const meta: Meta<typeof ChallengeRow> = { title: 'Progress/ChallengeRow', component: ChallengeRow };
export default meta;
type Story = StoryObj<typeof ChallengeRow>;

const [warmup, main, stretch] = sampleChallenges;

export const Done: Story = { args: { challenge: warmup } };
export const InProgress: Story = { args: { challenge: main } };
export const NotStarted: Story = { args: { challenge: stretch } };
export const ThisWeek: Story = {
  render: () => <ChallengeList challenges={sampleChallenges} endsAt={SAMPLE_WEEK_ENDS_AT} />,
};
