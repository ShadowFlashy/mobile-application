import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { buildAlbumPages } from '../../utils/album';
import { AlbumPager } from './AlbumPager';
import { SAMPLE_MODELS, SAMPLE_SPOTS } from './albumFixtures';

const styles = StyleSheet.create({ frame: { width: 360, height: 640 } });

const meta: Meta<typeof AlbumPager> = {
  title: 'Album/AlbumPager',
  component: AlbumPager,
  decorators: [
    (Story) => (
      <View style={styles.frame}>
        <Story />
      </View>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AlbumPager>;

export const OpenedAtSports: Story = {
  args: { pages: buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS), initialPageId: 'sports' },
};
export const OpenedAtWildcards: Story = {
  args: { pages: buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS), initialPageId: 'wildcards' },
};
