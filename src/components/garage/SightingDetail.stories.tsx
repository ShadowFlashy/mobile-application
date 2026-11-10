import type { Meta, StoryObj } from '@storybook/react';
import { anonymousSighting, readSighting, unreadSighting } from './garageFixtures';
import { SightingDetail } from './SightingDetail';

const meta: Meta<typeof SightingDetail> = { title: 'Garage/SightingDetail', component: SightingDetail };
export default meta;
type Story = StoryObj<typeof SightingDetail>;

export const AnonymousSpotter: Story = { args: { sighting: unreadSighting } };
export const SpotterSharedName: Story = { args: { sighting: readSighting } };
export const NoCity: Story = { args: { sighting: anonymousSighting } };
