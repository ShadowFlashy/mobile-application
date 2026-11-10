import type { Meta, StoryObj } from '@storybook/react';
import { buildCollectionPages } from '../../utils/album';
import { CollectionShelf } from './CollectionShelf';
import { SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS } from './albumFixtures';

const meta: Meta<typeof CollectionShelf> = { title: 'Album/CollectionShelf', component: CollectionShelf };
export default meta;
type Story = StoryObj<typeof CollectionShelf>;

export const ThreeSets: Story = {
  args: {
    collections: buildCollectionPages(SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS),
    onPressCollection: () => undefined,
  },
};
