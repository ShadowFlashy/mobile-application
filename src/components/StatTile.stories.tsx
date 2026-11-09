import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { StatTile } from './StatTile';

const styles = StyleSheet.create({
  // The profile screen shows two tiles per row.
  tile: { width: 170 },
});

const meta: Meta<typeof StatTile> = {
  title: 'Components/StatTile',
  component: StatTile,
  decorators: [
    (Story) => (
      <View style={styles.tile}>
        <Story />
      </View>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof StatTile>;

export const StickersCollected: Story = {
  args: { label: 'Stickers collected', value: '12/40', icon: 'albums-outline', testID: 'stat-stickers' },
};
export const CarsSpotted: Story = {
  args: { label: 'Cars spotted', value: '27', icon: 'camera-outline', testID: 'stat-spots' },
};
export const BookCompleted: Story = {
  args: { label: 'Book completed', value: '30%', icon: 'trophy-outline', testID: 'stat-completion' },
};
