import type { Meta, StoryObj } from '@storybook/react';
import { StyledButton } from '../StyledButton';
import { Section } from './Section';
import { Text } from './Text';

const meta: Meta<typeof Section> = { title: 'Primitives/Section', component: Section };
export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = { args: { title: 'Latest spots', children: <Text>Section content</Text> } };
export const WithAction: Story = {
  args: {
    title: 'Collections',
    action: <StyledButton label="See all" variant="ghost" onPress={() => undefined} />,
    children: <Text>Section content</Text>,
  },
};
