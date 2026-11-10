import type { Meta, StoryObj } from '@storybook/react';
import { SAMPLE_CANDIDATES } from './storyData';
import { CandidateChips } from './CandidateChips';

const meta: Meta<typeof CandidateChips> = { title: 'Capture/CandidateChips', component: CandidateChips };
export default meta;
type Story = StoryObj<typeof CandidateChips>;

export const IsItOneOfThese: Story = { args: { candidates: SAMPLE_CANDIDATES, onPick: () => undefined } };
