import type { Meta, StoryObj } from '@storybook/react';
import { GarageCarCard } from './GarageCarCard';
import { pausedCar, pendingCar, verifiedCar, verifiedStats } from './garageFixtures';

const meta: Meta<typeof GarageCarCard> = {
  title: 'Garage/GarageCarCard',
  component: GarageCarCard,
  args: { onPress: () => undefined },
};
export default meta;
type Story = StoryObj<typeof GarageCarCard>;

/** A new car: no pings, no stats, with the beta verification explanation. */
export const Pending: Story = { args: { car: pendingCar } };
/** Verified with a vanity plate, 7 sightings of which 2 are new. */
export const Verified: Story = { args: { car: verifiedCar, stats: verifiedStats } };
export const Paused: Story = {
  args: { car: pausedCar, stats: { ...verifiedStats, ownerCarId: pausedCar.id, unread: 0 } },
};
export const VerifiedNotSpotted: Story = {
  args: { car: { ...verifiedCar, visibility: 'hidden', plateDisplay: undefined } },
};
