import type { Meta, StoryObj } from '@storybook/react';
import { SAMPLE_MODELS } from './storyData';
import { StickerMatchRow } from './StickerMatchRow';

const meta: Meta<typeof StickerMatchRow> = { title: 'Capture/StickerMatchRow', component: StickerMatchRow };
export default meta;
type Story = StoryObj<typeof StickerMatchRow>;

export const Sticker: Story = { args: { model: SAMPLE_MODELS[4], isWildcard: false, provenance: 'ai' } };
export const Wildcard: Story = { args: { isWildcard: true } };
export const NotChosen: Story = { args: { isWildcard: false } };
