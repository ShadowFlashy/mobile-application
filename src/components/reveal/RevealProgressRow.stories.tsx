import type { Meta, StoryObj } from '@storybook/react';
import { RevealProgressRow } from './RevealProgressRow';

const meta: Meta<typeof RevealProgressRow> = {
  title: 'Reveal/RevealProgressRow',
  component: RevealProgressRow,
  args: { target: { kind: 'page', pageId: 'supercar' }, number: 3, collected: 4, total: 6 },
};
export default meta;
type Story = StoryObj<typeof RevealProgressRow>;

export const PageProgress: Story = {};
export const FullPage: Story = { args: { collected: 6, total: 6, justCompleted: true } };
export const SetProgress: Story = {
  args: { target: { kind: 'set', collectionId: 'italian-exotics' }, collected: 3, total: 12 },
};
export const SetComplete: Story = {
  args: { target: { kind: 'set', collectionId: 'italian-exotics' }, collected: 12, total: 12, justCompleted: true },
};
export const Wildcards: Story = { args: { target: { kind: 'page', pageId: 'wildcards' }, collected: 3, total: 0 } };
