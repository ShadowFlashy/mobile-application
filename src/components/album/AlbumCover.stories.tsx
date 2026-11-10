import type { Meta, StoryObj } from '@storybook/react';
import type { ChallengeProgress } from '../../types/Progress';
import { buildAlbumCover, buildAlbumPages } from '../../utils/album';
import { AlbumCover } from './AlbumCover';
import { SAMPLE_MODELS, SAMPLE_SPOTS } from './albumFixtures';

const pages = buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS);
const cover = buildAlbumCover(pages, SAMPLE_SPOTS);
const byId = new Map(SAMPLE_MODELS.map((model) => [model.id, model]));

const challenge: ChallengeProgress = {
  challenge: {
    id: '2026-W46-main',
    weekKey: '2026-W46',
    slot: 'main',
    template: 'new_stickers',
    params: {},
    target: 2,
    xp: 125,
  },
  value: 1,
  isComplete: false,
};

const meta: Meta<typeof AlbumCover> = { title: 'Album/AlbumCover', component: AlbumCover };
export default meta;
type Story = StoryObj<typeof AlbumCover>;

export const InProgress: Story = {
  args: {
    cover,
    level: 4,
    challenge,
    weekEndsAt: '2026-11-15T22:59:59.000Z',
    modelOf: (spot) => (spot.carModelId !== undefined ? byId.get(spot.carModelId) : undefined),
  },
};
export const Empty: Story = { args: { cover: { collected: 0, total: 118, ratio: 0, latest: [] } } };
export const NearlyComplete: Story = {
  args: { cover: { collected: 110, total: 118, ratio: 110 / 118, latest: [] }, level: 31 },
};
