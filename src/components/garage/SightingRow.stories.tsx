import type { Meta, StoryObj } from '@storybook/react';
import { anonymousSighting, readSighting, unreadSighting } from './garageFixtures';
import { SightingRow } from './SightingRow';

const meta: Meta<typeof SightingRow> = {
  title: 'Garage/SightingRow',
  component: SightingRow,
  args: { onPress: () => undefined },
};
export default meta;
type Story = StoryObj<typeof SightingRow>;

export const Unread: Story = { args: { sighting: unreadSighting } };
/** The spotter opted in to share their name. */
export const ReadWithSpotterName: Story = { args: { sighting: readSighting } };
/** No city was shared (manual spot without a city). */
export const NoCity: Story = { args: { sighting: anonymousSighting } };
