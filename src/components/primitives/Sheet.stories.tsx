import type { Meta, StoryObj } from '@storybook/react';
import { Sheet } from './Sheet';
import { Text } from './Text';

const meta: Meta<typeof Sheet> = { title: 'Primitives/Sheet', component: Sheet };
export default meta;
type Story = StoryObj<typeof Sheet>;

export const Open: Story = {
  args: {
    visible: true,
    title: 'Auto-fill',
    onClose: () => undefined,
    children: (
      <Text variant="value" tone="text2">
        Auto-fill sends a blurred, downscaled photo to the AI. Nothing is stored there.
      </Text>
    ),
  },
};
