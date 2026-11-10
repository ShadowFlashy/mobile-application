import type { Meta, StoryObj } from '@storybook/react';
import { buildAlbumPages } from '../../utils/album';
import { AlbumContents } from './AlbumContents';
import { SAMPLE_MODELS, SAMPLE_SPOTS } from './albumFixtures';

const meta: Meta<typeof AlbumContents> = { title: 'Album/AlbumContents', component: AlbumContents };
export default meta;
type Story = StoryObj<typeof AlbumContents>;

export const NinePages: Story = {
  args: { pages: buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS), onPressPage: () => undefined },
};
export const EmptyAlbum: Story = {
  args: { pages: buildAlbumPages(SAMPLE_MODELS, []), onPressPage: () => undefined },
};
