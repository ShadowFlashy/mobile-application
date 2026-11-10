import type { Meta, StoryObj } from '@storybook/react';
import { GarageStatus } from './GarageStatus';

const meta: Meta<typeof GarageStatus> = { title: 'Garage/GarageStatus', component: GarageStatus };
export default meta;
type Story = StoryObj<typeof GarageStatus>;

export const Pending: Story = { args: { status: 'pending' } };
export const Verified: Story = { args: { status: 'verified' } };
export const Paused: Story = { args: { status: 'paused' } };
