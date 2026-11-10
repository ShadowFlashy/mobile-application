import type { Meta, StoryObj } from '@storybook/react';
import { PressableScale } from './PressableScale';
import { Surface } from './Surface';
import { Text } from './Text';

const meta: Meta<typeof PressableScale> = { title: 'Primitives/PressableScale', component: PressableScale };
export default meta;
type Story = StoryObj<typeof PressableScale>;

const card = (
  <Surface padding="md">
    <Text>Press and hold</Text>
  </Surface>
);

export const Default: Story = { args: { onPress: () => undefined, accessibilityLabel: 'Press me', children: card } };
export const Strong: Story = {
  args: { onPress: () => undefined, accessibilityLabel: 'Press me', children: card, scaleTo: 0.94, haptic: 'tap' },
};
export const Disabled: Story = {
  args: { onPress: () => undefined, accessibilityLabel: 'Press me', children: card, disabled: true },
};
