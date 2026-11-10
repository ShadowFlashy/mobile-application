import type { Meta, StoryObj } from '@storybook/react';
import { DriverCard } from './DriverCard';

const meta: Meta<typeof DriverCard> = {
  title: 'Trust/DriverCard',
  component: DriverCard,
  args: { name: 'tester', email: 'tester@redline.test', testID: 'driver-card' },
};
export default meta;
type Story = StoryObj<typeof DriverCard>;

export const Rookie: Story = {
  args: { level: { level: 1, title: 'Learner', xp: 40, nextLevelXp: 100, ratio: 0.4 } },
};

export const KerbsideScout: Story = {
  args: { level: { level: 5, title: 'Kerbside Scout', xp: 1240, nextLevelXp: 1500, ratio: 0.48 } },
};

export const NearlyShiftUp: Story = {
  args: { level: { level: 9, title: 'Car-park Hunter', xp: 4420, nextLevelXp: 4500, ratio: 0.98 } },
};

export const OfflineReadOnly: Story = {
  args: { level: { level: 3, title: 'Kerbside Scout', xp: 320, nextLevelXp: 600, ratio: 0.07 }, isOffline: true },
};

export const Loading: Story = { args: { level: undefined } };
