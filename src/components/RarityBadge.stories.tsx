import type { Meta, StoryObj } from '@storybook/react';
import { RARITIES } from '../types/CarModel';
import { RarityBadge } from './RarityBadge';

const meta: Meta<typeof RarityBadge> = {
  title: 'Components/RarityBadge',
  component: RarityBadge,
  argTypes: { rarity: { control: 'select', options: RARITIES } },
};
export default meta;
type Story = StoryObj<typeof RarityBadge>;

export const Common: Story = { args: { rarity: 'common' } };
export const Rare: Story = { args: { rarity: 'rare' } };
export const Epic: Story = { args: { rarity: 'epic' } };
export const Legendary: Story = { args: { rarity: 'legendary' } };
