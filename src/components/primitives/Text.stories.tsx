import type { Meta, StoryObj } from '@storybook/react';
import { TEXT_TONES, TEXT_VARIANTS } from '../../theme';
import { Stack } from './Stack';
import { Text } from './Text';

const meta: Meta<typeof Text> = { title: 'Primitives/Text', component: Text };
export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = { args: { children: 'Snap it. We blur it. You collect it.' } };
export const Hero: Story = { args: { children: 'Redline', variant: 'hero' } };
export const Label: Story = { args: { children: 'Co-Driver', variant: 'label', tone: 'muted' } };
export const Numbers: Story = { args: { children: '1,240 XP', variant: 'number' } };

/** Every variant of the LIVERY type scale. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap="sm">
      {TEXT_VARIANTS.map((variant) => (
        <Text key={variant} variant={variant}>
          {variant} · Porsche 911 GT3 #07
        </Text>
      ))}
    </Stack>
  ),
};

/** Every tone (the on-stage tones are meant for the dark stage backdrop). */
export const AllTones: Story = {
  render: () => (
    <Stack gap="xs">
      {TEXT_TONES.map((tone) => (
        <Text key={tone} tone={tone} variant="bodyStrong">
          {tone}
        </Text>
      ))}
    </Stack>
  ),
};

/** v1 props still compile: size and weight map onto variants. */
export const LegacySizeWeight: Story = { args: { children: 'Legacy xl bold', size: 'xl', weight: 'bold' } };
