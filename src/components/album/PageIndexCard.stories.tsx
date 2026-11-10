import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { PageIndexCard } from './PageIndexCard';

const styles = StyleSheet.create({ cell: { width: 180 } });

const meta: Meta<typeof PageIndexCard> = {
  title: 'Album/PageIndexCard',
  component: PageIndexCard,
  decorators: [
    (Story) => (
      <View style={styles.cell}>
        <Story />
      </View>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof PageIndexCard>;

const press = () => undefined;

export const InProgress: Story = {
  args: {
    title: 'Supercars',
    number: 3,
    collected: 3,
    total: 6,
    pageId: 'supercar',
    slots: [true, false, true, true, false, false],
    onPress: press,
  },
};
export const OneToGo: Story = {
  args: { ...InProgress.args, collected: 5, slots: [true, true, true, true, true, false] },
};
export const FullPage: Story = {
  args: { ...InProgress.args, collected: 6, slots: [true, true, true, true, true, true] },
};
export const Wildcards: Story = {
  args: {
    title: 'Wildcards',
    number: 9,
    collected: 0,
    total: 0,
    pageId: 'wildcards',
    wildcardCount: 4,
    onPress: press,
  },
};
export const CollectionShelfCard: Story = {
  args: {
    title: 'Italian Exotics',
    description: 'Prancing horses, raging bulls and a trident: pure drama on wheels.',
    number: 4,
    collected: 3,
    total: 12,
    collectionId: 'italian-exotics',
    variant: 'shelf',
    slots: [true, true, true, false, false, false, false, false, false, false, false, false],
    onPress: press,
  },
};
export const CollectionSetComplete: Story = {
  args: {
    ...CollectionShelfCard.args,
    collected: 12,
    slots: Array.from({ length: 12 }, () => true),
  },
};
