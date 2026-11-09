import type { Meta, StoryObj } from '@storybook/react';
import { CollectionProgress } from './CollectionProgress';

const meta: Meta<typeof CollectionProgress> = { title: 'Components/CollectionProgress', component: CollectionProgress };
export default meta;
type Story = StoryObj<typeof CollectionProgress>;

export const NotStarted: Story = { args: { label: 'All stickers', collected: 0, total: 40 } };
export const InProgress: Story = { args: { label: 'All stickers', collected: 12, total: 40 } };
export const CategoryComplete: Story = { args: { label: 'Hypercars', collected: 5, total: 5 } };
