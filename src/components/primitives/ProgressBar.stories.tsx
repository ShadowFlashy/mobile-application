import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = { title: 'Primitives/ProgressBar', component: ProgressBar };
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Empty: Story = { args: { progress: 0, label: 'Collection progress' } };
export const Halfway: Story = { args: { progress: 0.5, label: 'Collection progress' } };
export const Complete: Story = { args: { progress: 1, label: 'Collection progress', color: '#15803D' } };
