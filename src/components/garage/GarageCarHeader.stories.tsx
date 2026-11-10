import type { Meta, StoryObj } from '@storybook/react';
import { GarageCarHeader } from './GarageCarHeader';
import { pausedCar, pendingCar, verifiedCar, verifiedStats } from './garageFixtures';

const meta: Meta<typeof GarageCarHeader> = { title: 'Garage/GarageCarHeader', component: GarageCarHeader };
export default meta;
type Story = StoryObj<typeof GarageCarHeader>;

export const Pending: Story = { args: { car: pendingCar } };
export const VerifiedVanity: Story = { args: { car: verifiedCar, stats: verifiedStats } };
export const Paused: Story = { args: { car: pausedCar } };
