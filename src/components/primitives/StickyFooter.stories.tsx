import type { Meta, StoryObj } from '@storybook/react';
import { StyledButton } from '../StyledButton';
import { StickyFooter } from './StickyFooter';

const meta: Meta<typeof StickyFooter> = { title: 'Primitives/StickyFooter', component: StickyFooter };
export default meta;
type Story = StoryObj<typeof StickyFooter>;

export const CompactDisabled: Story = {
  args: {
    reason: 'Check the plates first',
    action: <StyledButton label="Add to album" disabled onPress={() => undefined} />,
  },
};
export const CompactReady: Story = {
  args: {
    reason: '#31 · +125 XP',
    reasonTone: 'text',
    action: <StyledButton label="Add to album" onPress={() => undefined} />,
  },
};
export const FullWidth: Story = {
  args: { children: <StyledButton label="Add a car" onPress={() => undefined} /> },
};
