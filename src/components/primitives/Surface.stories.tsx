import type { Meta, StoryObj } from '@storybook/react';
import { Surface } from './Surface';
import { Text } from './Text';

const meta: Meta<typeof Surface> = { title: 'Primitives/Surface', component: Surface };
export default meta;
type Story = StoryObj<typeof Surface>;

export const Flat: Story = { args: { padding: 'md', children: <Text>Flat: grouping only, no fill</Text> } };
export const Raise: Story = {
  args: { variant: 'raise', padding: 'md', children: <Text>Raise: the one filled block</Text> },
};
export const Stage: Story = {
  args: { variant: 'stage', padding: 'lg', children: <Text tone="onStage">Always-dark photo stage</Text> },
};
export const Pressable: Story = {
  args: {
    variant: 'raise',
    padding: 'md',
    onPress: () => undefined,
    accessibilityLabel: 'Open',
    children: <Text>Tap me</Text>,
  },
};
