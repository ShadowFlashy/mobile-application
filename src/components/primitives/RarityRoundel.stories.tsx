import type { Meta, StoryObj } from '@storybook/react';
import { RarityRoundel } from './RarityRoundel';
import { Row } from './Row';

const meta: Meta<typeof RarityRoundel> = { title: 'Primitives/RarityRoundel', component: RarityRoundel };
export default meta;
type Story = StoryObj<typeof RarityRoundel>;

export const Common: Story = { args: { rarity: 'common' } };
export const Rare: Story = { args: { rarity: 'rare' } };
export const Epic: Story = { args: { rarity: 'epic', showLabel: true } };
export const Legendary: Story = { args: { rarity: 'legendary', showLabel: true } };

/** C, R, E and L side by side, read like tyre compounds. */
export const AllTiers: Story = {
  render: () => (
    <Row gap="lg">
      <RarityRoundel rarity="common" showLabel />
      <RarityRoundel rarity="rare" showLabel />
      <RarityRoundel rarity="epic" showLabel />
      <RarityRoundel rarity="legendary" showLabel />
    </Row>
  ),
};
