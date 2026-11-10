import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../primitives/Stack';
import { SAMPLE_WEEK_ENDS_AT, sampleChallenges } from './fixtures';
import { PitBoard } from './PitBoard';

const meta: Meta<typeof PitBoard> = { title: 'Progress/PitBoard', component: PitBoard };
export default meta;
type Story = StoryObj<typeof PitBoard>;

const [warmup, main, stretch] = sampleChallenges;

export const Done: Story = { args: { challenge: warmup, endsAt: SAMPLE_WEEK_ENDS_AT } };
export const CollectionChallenge: Story = { args: { challenge: main, endsAt: SAMPLE_WEEK_ENDS_AT } };
export const Stretch: Story = { args: { challenge: stretch, endsAt: SAMPLE_WEEK_ENDS_AT } };
export const Compact: Story = { args: { challenge: main, endsAt: SAMPLE_WEEK_ENDS_AT, compact: true } };
export const ThisWeek: Story = {
  render: () => (
    <Stack gap="smd">
      {sampleChallenges.map((challenge) => (
        <PitBoard key={challenge.challenge.id} challenge={challenge} endsAt={SAMPLE_WEEK_ENDS_AT} />
      ))}
    </Stack>
  ),
};
