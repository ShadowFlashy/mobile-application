import type { Meta, StoryObj } from '@storybook/react';
import { anonymousSighting, readSighting, unreadSighting } from './garageFixtures';
import { SightingCard } from './SightingCard';

const meta: Meta<typeof SightingCard> = {
  title: 'Garage/SightingCard',
  component: SightingCard,
  args: { onPress: () => undefined },
};
export default meta;
type Story = StoryObj<typeof SightingCard>;

export const Unread: Story = { args: { sighting: unreadSighting } };
/** The spotter opted in to share their name. */
export const ReadWithSpotterName: Story = { args: { sighting: readSighting } };
/** No city was shared (manual spot without a city). */
export const NoCity: Story = { args: { sighting: anonymousSighting } };
