import type { Meta, StoryObj } from '@storybook/react';
import { StyledButton } from '../StyledButton';
import { ListRow } from './ListRow';
import { Section } from './Section';
import { Stack } from './Stack';
import { Text } from './Text';

const meta: Meta<typeof Section> = { title: 'Primitives/Section', component: Section };
export default meta;
type Story = StoryObj<typeof Section>;

export const WithMeta: Story = {
  args: {
    title: 'This week',
    meta: 'Ends in 5d 10h',
    children: (
      <Stack>
        <ListRow title="Log 3 spots" pitch="compact" />
        <ListRow title="Spot 1 car in orange" pitch="compact" />
      </Stack>
    ),
  },
};
export const WithAction: Story = {
  args: {
    title: 'Latest',
    action: <StyledButton label="See all" variant="text" onPress={() => undefined} />,
    children: <ListRow title="Ferrari 308 GTSi" subtitle="Italian Exotics" />,
  },
};
export const NoDivider: Story = {
  args: { title: 'Notes', divider: false, children: <Text variant="value">Spotted outside the station.</Text> },
};
