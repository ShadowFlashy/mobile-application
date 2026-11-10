import type { Meta, StoryObj } from '@storybook/react';
import { Surface } from './Surface';
import { Text } from './Text';

const meta: Meta<typeof Surface> = { title: 'Primitives/Surface', component: Surface };
export default meta;
type Story = StoryObj<typeof Surface>;

export const Raised: Story = { args: { padding: 'md', children: <Text>Raised card</Text> } };
export const Flat: Story = { args: { variant: 'flat', padding: 'md', children: <Text>Flat card</Text> } };
export const Sunken: Story = { args: { variant: 'sunken', padding: 'md', children: <Text>Album slot well</Text> } };
export const Inverse: Story = {
  args: { variant: 'inverse', padding: 'md', children: <Text tone="inverse">Inverse surface</Text> },
};
export const Stage: Story = {
  args: { variant: 'stage', radius: 'lg', padding: 'lg', children: <Text tone="onStage">Always-dark stage</Text> },
};
export const Pressable: Story = {
  args: {
    padding: 'md',
    radius: 'sticker',
    onPress: () => undefined,
    accessibilityLabel: 'Open',
    children: <Text>Tap me</Text>,
  },
};
