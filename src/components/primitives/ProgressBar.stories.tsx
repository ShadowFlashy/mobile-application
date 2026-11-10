import type { Meta, StoryObj } from '@storybook/react';
import { liveries } from '../../theme';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = { title: 'Primitives/ProgressBar', component: ProgressBar };
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Empty: Story = { args: { progress: 0, label: 'Collection progress' } };
export const Halfway: Story = { args: { progress: 0.5, label: 'Collection progress' } };
export const Success: Story = { args: { progress: 1, label: 'Collection progress', tone: 'success' } };
export const Livery: Story = {
  args: { progress: 0.66, label: 'JDM page', tone: 'livery', liveryColor: liveries.jdm.base },
};
