import type { Meta, StoryObj } from '@storybook/react';
import { GarageStatusChip } from './GarageStatusChip';

const meta: Meta<typeof GarageStatusChip> = { title: 'Garage/GarageStatusChip', component: GarageStatusChip };
export default meta;
type Story = StoryObj<typeof GarageStatusChip>;

export const Pending: Story = { args: { status: 'pending' } };
export const Verified: Story = { args: { status: 'verified' } };
export const Paused: Story = { args: { status: 'paused' } };
