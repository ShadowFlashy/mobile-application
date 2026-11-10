import type { Meta, StoryObj } from '@storybook/react';
import { TrustLedger } from './TrustLedger';

const meta: Meta<typeof TrustLedger> = {
  title: 'Trust/TrustLedger',
  component: TrustLedger,
  args: { photos: 27, plates: 0, gpsPoints: 0, cities: 6, aiCallsLeft: 12, aiDailyLimit: 15, aiEnabled: true },
};
export default meta;
type Story = StoryObj<typeof TrustLedger>;

export const Default: Story = {};

export const CoDriverOff: Story = { args: { aiEnabled: false } };

export const Offline: Story = { args: { aiCallsLeft: undefined, aiDailyLimit: undefined } };

export const FirstDay: Story = { args: { photos: 0, cities: 0, aiCallsLeft: 15 } };

export const Loading: Story = { args: { isLoading: true } };
