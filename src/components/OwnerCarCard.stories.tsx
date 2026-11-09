import type { Meta, StoryObj } from '@storybook/react';
import type { OwnerCar } from '../types/OwnerCar';
import { OwnerCarCard } from './OwnerCarCard';

const CAR: OwnerCar = {
  id: 'car-1',
  make: 'Porsche',
  model: '911 GT3',
  nickname: 'Blue Lightning',
  plateHint: '34',
  showPlate: false,
  createdAt: '2026-10-01T10:00:00.000Z',
};

const meta: Meta<typeof OwnerCarCard> = {
  title: 'Components/OwnerCarCard',
  component: OwnerCarCard,
  args: { onTogglePlate: () => {}, onRemove: () => {} },
};
export default meta;
type Story = StoryObj<typeof OwnerCarCard>;

export const NotSpottedYet: Story = { args: { car: CAR, spotCount: 0 } };

export const SpottedOnce: Story = { args: { car: { ...CAR, nickname: undefined }, spotCount: 1 } };

export const VanityPlateShown: Story = {
  args: { car: { ...CAR, showPlate: true, plateDisplay: 'GT3-RS' }, spotCount: 4 },
};
