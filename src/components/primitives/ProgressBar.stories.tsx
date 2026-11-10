import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = { title: 'Primitives/ProgressBar', component: ProgressBar };
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Empty: Story = { args: { progress: 0, label: 'Hypercars' } };
export const Season: Story = { args: { progress: 10 / 118, label: 'Season 1' } };
export const Halfway: Story = { args: { progress: 0.5, label: 'Level 8' } };
export const PageTable: Story = { args: { progress: 2 / 17, label: 'Sports', width: 96 } };
