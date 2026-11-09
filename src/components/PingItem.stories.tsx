import type { Meta, StoryObj } from '@storybook/react';
import type { SpotPing } from '../types/OwnerCar';
import { PingItem } from './PingItem';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

function ago(milliseconds: number): string {
  return new Date(Date.now() - milliseconds).toISOString();
}

const PING: SpotPing = {
  id: 'ping-1',
  spotId: 'spot-1',
  ownerCarId: 'car-1',
  carMake: 'Porsche',
  carModel: '911 GT3',
  locationLabel: 'Leuven',
  spottedAt: ago(5 * MINUTE),
  createdAt: ago(5 * MINUTE),
  isRead: false,
};

const meta: Meta<typeof PingItem> = {
  title: 'Components/PingItem',
  component: PingItem,
  args: { onPress: () => {} },
};
export default meta;
type Story = StoryObj<typeof PingItem>;

export const Unread: Story = { args: { ping: PING } };

export const Read: Story = { args: { ping: { ...PING, isRead: true, spottedAt: ago(3 * DAY) } } };

export const WithNickname: Story = { args: { ping: { ...PING, carNickname: 'Blue Lightning' } } };

export const WithoutLocation: Story = {
  args: { ping: { ...PING, locationLabel: undefined, spottedAt: ago(2 * DAY) } },
};
