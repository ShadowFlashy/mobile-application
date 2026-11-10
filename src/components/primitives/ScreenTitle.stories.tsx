import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';
import { ScreenTitle } from './ScreenTitle';

const meta: Meta<typeof ScreenTitle> = { title: 'Primitives/ScreenTitle', component: ScreenTitle };
export default meta;
type Story = StoryObj<typeof ScreenTitle>;

export const WithMeta: Story = { args: { title: 'Album', meta: '2-week streak' } };
export const WithClose: Story = {
  args: { title: 'New spot', action: <IconButton icon="close" label="Close" onPress={() => undefined} /> },
};
