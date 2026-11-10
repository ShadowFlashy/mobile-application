import type { Meta, StoryObj } from '@storybook/react';
import { OwnerShowcase } from './OwnerShowcase';

const meta: Meta<typeof OwnerShowcase> = { title: 'Garage/OwnerShowcase', component: OwnerShowcase };
export default meta;
type Story = StoryObj<typeof OwnerShowcase>;

export const BadgeWithShoutout: Story = {
  args: { showcase: { visibility: 'badge', shoutout: 'Thanks for the spot! Say hi at Spa.' } },
};
export const BadgeOnly: Story = { args: { showcase: { visibility: 'badge' } } };
export const VanityPlate: Story = {
  args: { showcase: { visibility: 'vanity', shoutout: 'Honk twice!', vanityPlate: 'DEMO-123' } },
};
