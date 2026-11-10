import type { Meta, StoryObj } from '@storybook/react';
import type { Spot } from '../../types/Spot';
import { buildAlbumCover, buildAlbumPages, buildCollectionPages } from '../../utils/album';
import { LatestCatches } from './LatestCatches';
import { SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS } from './albumFixtures';

const cover = buildAlbumCover(buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS), SAMPLE_SPOTS);
const modelOf = (spot: Spot) => SAMPLE_MODELS.find((model) => model.id === spot.carModelId);
const countOf = (modelId: string) => SAMPLE_SPOTS.filter((spot) => spot.carModelId === modelId).length;

const meta: Meta<typeof LatestCatches> = { title: 'Album/LatestCatches', component: LatestCatches };
export default meta;
type Story = StoryObj<typeof LatestCatches>;

export const TimingTower: Story = {
  args: {
    spots: cover.latest,
    modelOf,
    countOf,
    collections: buildCollectionPages(SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS),
    onPressSpot: () => undefined,
  },
};
