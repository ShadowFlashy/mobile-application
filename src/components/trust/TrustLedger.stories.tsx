import type { Meta, StoryObj } from '@storybook/react';
import { TrustLedger } from './TrustLedger';

const meta: Meta<typeof TrustLedger> = {
  title: 'Trust/TrustLedger',
  component: TrustLedger,
  args: { photos: 27, plates: 0, gpsPoints: 0, cities: 6 },
};
export default meta;
type Story = StoryObj<typeof TrustLedger>;

export const Default: Story = {};

export const FirstDay: Story = { args: { photos: 0, cities: 0 } };

export const Loading: Story = { args: { isLoading: true } };
