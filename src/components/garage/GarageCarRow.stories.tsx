import type { Meta, StoryObj } from '@storybook/react';
import { GarageCarRow } from './GarageCarRow';
import { pausedCar, pendingCar, verifiedCar, verifiedStats } from './garageFixtures';

const meta: Meta<typeof GarageCarRow> = {
  title: 'Garage/GarageCarRow',
  component: GarageCarRow,
  args: { onPress: () => undefined },
};
export default meta;
type Story = StoryObj<typeof GarageCarRow>;

/** A new car: waiting for verification, no counters, with the beta explanation. */
export const Pending: Story = { args: { car: pendingCar } };
/** Verified with a vanity plate, 7 sightings of which 2 are new. */
export const Verified: Story = { args: { car: verifiedCar, stats: verifiedStats } };
export const Paused: Story = {
  args: { car: pausedCar, stats: { ...verifiedStats, ownerCarId: pausedCar.id, unread: 0 } },
};
export const VerifiedNotSpotted: Story = {
  args: { car: { ...verifiedCar, visibility: 'hidden', plateDisplay: undefined } },
};
