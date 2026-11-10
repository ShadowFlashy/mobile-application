import type { Meta, StoryObj } from '@storybook/react';
import { ConfidenceMeter } from './ConfidenceMeter';

const meta: Meta<typeof ConfidenceMeter> = { title: 'Capture/ConfidenceMeter', component: ConfidenceMeter };
export default meta;
type Story = StoryObj<typeof ConfidenceMeter>;

export const Sure: Story = { args: { confidence: 0.94 } };
export const Likely: Story = { args: { confidence: 0.7 } };
export const Guess: Story = { args: { confidence: 0.42 } };
