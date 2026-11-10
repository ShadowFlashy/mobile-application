import type { Meta, StoryObj } from '@storybook/react';
import { CarThumb } from './CarThumb';
import { SAMPLE_PHOTO_URL } from './albumFixtures';

const meta: Meta<typeof CarThumb> = { title: 'Album/CarThumb', component: CarThumb };
export default meta;
type Story = StoryObj<typeof CarThumb>;

export const Photo: Story = { args: { uri: SAMPLE_PHOTO_URL, bodyStyle: 'coupe' } };
export const Silhouette: Story = { args: { bodyStyle: 'hatchback' } };
