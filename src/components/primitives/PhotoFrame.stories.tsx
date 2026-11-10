import type { Meta, StoryObj } from '@storybook/react';
import { PhotoFrame } from './PhotoFrame';
import { Text } from './Text';

const meta: Meta<typeof PhotoFrame> = { title: 'Primitives/PhotoFrame', component: PhotoFrame };
export default meta;
type Story = StoryObj<typeof PhotoFrame>;

/** No photo yet: the black backdrop holds the space, so nothing shifts. */
export const Placeholder: Story = { args: { accessibilityLabel: 'Photo of a Porsche 911 GT3' } };
export const WithOverlay: Story = {
  args: {
    accessibilityLabel: 'Photo',
    aspectRatio: 16 / 10,
    overlay: (
      <Text variant="meta" tone="onStage">
        Auto
      </Text>
    ),
  },
};
export const StickerInner: Story = {
  args: { accessibilityLabel: 'Photo', aspectRatio: 4 / 5, radius: 'stickerInner' },
};
