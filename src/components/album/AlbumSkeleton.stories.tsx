import type { Meta, StoryObj } from '@storybook/react';
import { AlbumSkeleton } from './AlbumSkeleton';

const meta: Meta<typeof AlbumSkeleton> = { title: 'Album/AlbumSkeleton', component: AlbumSkeleton };
export default meta;
type Story = StoryObj<typeof AlbumSkeleton>;

export const Cover: Story = { args: { variant: 'cover' } };
export const Page: Story = { args: { variant: 'page' } };
