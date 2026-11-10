import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = { title: 'Primitives/Badge', component: Badge };
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { label: 'Pending' } };
export const Success: Story = { args: { label: 'Verified', tone: 'success' } };
export const Warning: Story = { args: { label: 'Paused', tone: 'warning' } };
export const Danger: Story = { args: { label: 'Failed', tone: 'danger' } };
export const Signal: Story = { args: { label: 'New', tone: 'signal' } };
export const LegacyVariant: Story = { args: { label: 'Error', variant: 'error' } };
