import type { Meta, StoryObj } from '@storybook/react';
import { A_TEXT_VARIANTS, TEXT_TONES } from '../../theme';
import { Stack } from './Stack';
import { Text } from './Text';

const meta: Meta<typeof Text> = { title: 'Primitives/Text', component: Text };
export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = { args: { children: 'Photograph the cars you spot.' } };
export const Hero: Story = { args: { children: '10', variant: 'hero' } };
export const Title: Story = { args: { children: 'Album', variant: 'title', heading: true } };
export const Meta2: Story = {
  name: 'Meta',
  args: { children: 'Stickers · 8% of Season 1', variant: 'meta', tone: 'text2' },
};
export const Numbers: Story = { args: { children: '+125 XP', variant: 'numS', tone: 'text2' } };

/** Every variant of direction A's type scale. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap="sm">
      {A_TEXT_VARIANTS.map((variant) => (
        <Text key={variant} variant={variant}>
          {variant} · Porsche 911 GT3 #07
        </Text>
      ))}
    </Stack>
  ),
};

/** Every tone (the on-stage tones are meant for the always-dark photo stage). */
export const AllTones: Story = {
  render: () => (
    <Stack gap="xs">
      {TEXT_TONES.map((tone) => (
        <Text key={tone} tone={tone} variant="body">
          {tone}
        </Text>
      ))}
    </Stack>
  ),
};

/** v1 props still compile: size and weight map onto A variants. */
export const LegacySizeWeight: Story = { args: { children: 'Legacy xl bold', size: 'xl', weight: 'bold' } };
