import type { Meta, StoryObj } from '@storybook/react';
import { buildAlbumPages, buildCollectionPages } from '../../utils/album';
import { AlbumIndex } from './AlbumIndex';
import { SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS } from './albumFixtures';

const meta: Meta<typeof AlbumIndex> = { title: 'Album/AlbumIndex', component: AlbumIndex };
export default meta;
type Story = StoryObj<typeof AlbumIndex>;

const args = {
  pages: buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS),
  collections: buildCollectionPages(SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS),
  onPressPage: () => undefined,
  onPressCollection: () => undefined,
};

export const Pages: Story = { args };
export const Collections: Story = { args: { ...args, initialTab: 'collections' } };
export const WithoutCollections: Story = { args: { ...args, collections: [] } };
