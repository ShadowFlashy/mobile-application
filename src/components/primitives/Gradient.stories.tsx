import type { Meta, StoryObj } from '@storybook/react';
import { darkColors, finishes } from '../../theme';
import { Gradient } from './Gradient';
import { Stack } from './Stack';
import { Text } from './Text';

const meta: Meta<typeof Gradient> = { title: 'Primitives/Gradient', component: Gradient };
export default meta;
type Story = StoryObj<typeof Gradient>;

const label = (text: string) => (
  <Stack padding="lg">
    <Text variant="title">{text}</Text>
  </Stack>
);

export const Chrome: Story = { args: { colors: finishes.rare.edge, direction: 'diagonal', children: label('Chrome') } };
export const Holo: Story = { args: { colors: finishes.epic.edge, direction: 'horizontal', children: label('Holo') } };
export const Gold: Story = {
  args: { colors: finishes.legendary.edge, direction: 'diagonal', children: label('Gold') },
};
export const Scrim: Story = {
  args: { colors: [darkColors.scrimTop, darkColors.scrimBottom], children: label('Photo scrim') },
};
