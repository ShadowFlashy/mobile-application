import type { Meta, StoryObj } from '@storybook/react';
import { StyledButton } from '../StyledButton';
import { StickyFooter } from './StickyFooter';

const meta: Meta<typeof StickyFooter> = { title: 'Primitives/StickyFooter', component: StickyFooter };
export default meta;
type Story = StoryObj<typeof StickyFooter>;

export const Default: Story = {
  args: { children: <StyledButton label="Collect" variant="ignition" onPress={() => undefined} /> },
};
