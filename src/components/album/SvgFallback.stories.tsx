import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../primitives/Text';
import { SvgFallback } from './SvgFallback';

/** Throws on render, like react-native-svg on a platform without it. */
function BrokenArtwork(): JSX.Element {
  throw new Error('SVG unavailable');
}

const meta: Meta<typeof SvgFallback> = { title: 'Album/SvgFallback', component: SvgFallback };
export default meta;
type Story = StoryObj<typeof SvgFallback>;

export const Working: Story = {
  args: { fallback: <Text>Fallback</Text>, children: <Text>SVG artwork renders</Text> },
};
export const FallsBack: Story = {
  args: { fallback: <Text>Fallback icon shown instead</Text>, children: <BrokenArtwork /> },
};
