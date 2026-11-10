import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { chiron, porsche, sampleSpot } from './albumFixtures';
import { StickerSlot } from './StickerSlot';

const styles = StyleSheet.create({ cell: { width: 180 } });

const meta: Meta<typeof StickerSlot> = {
  title: 'Album/StickerSlot',
  component: StickerSlot,
  decorators: [
    (Story) => (
      <View style={styles.cell}>
        <Story />
      </View>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof StickerSlot>;

export const Locked: Story = { args: { model: porsche, isCollected: false, spotCount: 0, onPress: () => undefined } };
export const Collected: Story = {
  args: {
    model: porsche,
    isCollected: true,
    cover: sampleSpot({ id: 'spot-1', carModelId: porsche.id }),
    spotCount: 1,
    onPress: () => undefined,
  },
};
export const Duplicates: Story = { args: { ...Collected.args, spotCount: 3 } };
export const ChaseLegendary: Story = {
  args: { model: chiron, isCollected: false, spotCount: 0, onPress: () => undefined },
};
export const SmallHighlighted: Story = { args: { ...Locked.args, size: 'sm', isHighlighted: true } };
