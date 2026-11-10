import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';
import { Screen } from './Screen';
import { Text } from './Text';

const meta: Meta<typeof Screen> = { title: 'Primitives/Screen', component: Screen };
export default meta;
type Story = StoryObj<typeof Screen>;

export const WithHeader: Story = {
  args: { title: 'Album', meta: '2-week streak', children: <Text>Screen content on the 20 px edge</Text> },
};
export const WithClose: Story = {
  args: {
    title: 'New spot',
    headerAction: <IconButton icon="close" label="Close" onPress={() => undefined} />,
    children: <Text>Review the photo</Text>,
  },
};
export const NonScrollable: Story = {
  args: { children: <Text>Fixed screen</Text>, scrollable: false },
};
