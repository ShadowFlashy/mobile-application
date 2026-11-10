import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { COLLECTION_IDS } from '../../types/Collection';
import { ALBUM_PAGE_IDS } from '../../types/Progress';
import { LiveryStripe } from './LiveryStripe';

const meta: Meta<typeof LiveryStripe> = { title: 'Album/LiveryStripe', component: LiveryStripe };
export default meta;
type Story = StoryObj<typeof LiveryStripe>;

export const Supercars: Story = { args: { pageId: 'supercar', label: 'Supercars', height: 'lg', number: 3 } };
export const Small: Story = { args: { pageId: 'jdm', label: 'JDM', height: 'sm' } };
export const Collection: Story = {
  args: { collectionId: 'italian-exotics', label: 'Italian Exotics', height: 'lg', number: 4 },
};

/** Every page and set livery. */
export const AllLiveries: Story = {
  render: () => (
    <View style={styles.column}>
      {ALBUM_PAGE_IDS.map((id, index) => (
        <LiveryStripe key={id} pageId={id} label={id} height="sm" number={index + 1} />
      ))}
      {COLLECTION_IDS.map((id, index) => (
        <LiveryStripe key={id} collectionId={id} label={id} height="sm" number={index + 1} />
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({ column: { gap: 8 } });
