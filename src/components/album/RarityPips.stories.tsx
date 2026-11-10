import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { RARITIES } from '../../types/CarModel';
import { RarityPips } from './RarityPips';

const meta: Meta<typeof RarityPips> = { title: 'Album/RarityPips', component: RarityPips };
export default meta;
type Story = StoryObj<typeof RarityPips>;

export const Epic: Story = { args: { rarity: 'epic', size: 'md' } };
export const AllRarities: Story = {
  render: () => (
    <View style={styles.column}>
      {RARITIES.map((rarity) => (
        <RarityPips key={rarity} rarity={rarity} size="md" />
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({ column: { gap: 12 } });
