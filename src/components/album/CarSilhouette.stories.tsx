import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { BODY_STYLES } from '../../types/CarModel';
import { Text } from '../primitives/Text';
import { CarSilhouette } from './CarSilhouette';

const meta: Meta<typeof CarSilhouette> = { title: 'Album/CarSilhouette', component: CarSilhouette };
export default meta;
type Story = StoryObj<typeof CarSilhouette>;

export const Coupe: Story = { args: { bodyStyle: 'coupe', size: 160, tone: 'silhouette' } };
export const OnStage: Story = { args: { bodyStyle: 'supercar', size: 160, tone: 'onStage' } };

/** All 10 body styles. */
export const AllBodyStyles: Story = {
  render: () => (
    <View style={styles.grid}>
      {BODY_STYLES.map((bodyStyle) => (
        <View key={bodyStyle} style={styles.cell}>
          <CarSilhouette bodyStyle={bodyStyle} size={120} tone="silhouette" />
          <Text variant="caption">{bodyStyle}</Text>
        </View>
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  cell: { alignItems: 'center', gap: 4 },
});
