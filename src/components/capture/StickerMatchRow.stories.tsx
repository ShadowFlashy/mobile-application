import type { Meta, StoryObj } from '@storybook/react';
import { SAMPLE_MODELS } from './storyData';
import { StickerMatchRow } from './StickerMatchRow';

const meta: Meta<typeof StickerMatchRow> = { title: 'Capture/StickerMatchRow', component: StickerMatchRow };
export default meta;
type Story = StoryObj<typeof StickerMatchRow>;

export const NewSticker: Story = {
  args: { model: SAMPLE_MODELS[4], isWildcard: false, kind: 'new', setIds: ['italian-exotics'] },
};
export const SpottedAgain: Story = {
  args: { model: SAMPLE_MODELS[0], isWildcard: false, kind: 'duplicate', count: 3 },
};
export const Loading: Story = { args: { model: SAMPLE_MODELS[1], isWildcard: false } };
export const Wildcard: Story = { args: { isWildcard: true } };
export const NotChosen: Story = { args: { isWildcard: false } };
