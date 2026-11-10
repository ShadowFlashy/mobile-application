import type { Meta, StoryObj } from '@storybook/react';
import { ChallengeRow } from './ChallengeRow';

const meta: Meta<typeof ChallengeRow> = { title: 'Capture/ChallengeRow', component: ChallengeRow };
export default meta;
type Story = StoryObj<typeof ChallengeRow>;

export const Completes: Story = { args: { challenge: 'Spot 1 car in orange', xp: 125 } };
