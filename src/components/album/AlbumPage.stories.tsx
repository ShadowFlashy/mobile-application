import type { Meta, StoryObj } from '@storybook/react';
import { buildAlbumPages, buildCollectionPages } from '../../utils/album';
import { AlbumPage } from './AlbumPage';
import { SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS, mx5, porsche } from './albumFixtures';

const pages = buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS);
const sets = buildCollectionPages(SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS);
const sports = pages.find((page) => page.id === 'sports') ?? pages[0];
const supercars = pages.find((page) => page.id === 'supercar') ?? pages[0];
const wildcards = pages.find((page) => page.id === 'wildcards') ?? pages[0];
const jdmSet = sets.find((page) => page.collectionId === 'jdm-legends') ?? sets[0];
const italianSet = sets.find((page) => page.collectionId === 'italian-exotics') ?? sets[0];

const meta: Meta<typeof AlbumPage> = { title: 'Album/AlbumPage', component: AlbumPage };
export default meta;
type Story = StoryObj<typeof AlbumPage>;

export const FullPage: Story = { args: { page: sports } };
export const LockedPage: Story = { args: { page: supercars } };
export const Wildcards: Story = { args: { page: wildcards } };
export const CollectionInProgress: Story = { args: { page: italianSet } };
export const CollectionSetComplete: Story = { args: { page: jdmSet } };
export const CompactForReveal: Story = { args: { page: sports, compact: true, highlightModelId: mx5.id } };
export const Highlighted: Story = { args: { page: sports, highlightModelId: porsche.id } };
