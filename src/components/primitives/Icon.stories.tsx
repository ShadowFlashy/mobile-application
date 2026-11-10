import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { A_ICON_NAMES } from './icons';
import { Row } from './Row';
import { Stack } from './Stack';
import { Text } from './Text';

const meta: Meta<typeof Icon> = { title: 'Primitives/Icon', component: Icon };
export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = { args: { name: 'camera' } };
export const Secondary: Story = { args: { name: 'chevron-right', tone: 'text2', size: 20 } };
export const Labelled: Story = { args: { name: 'alert', accessibilityLabel: 'Error' } };

/** Every icon of direction A's set: 24 grid, 1.75 stroke, round caps and joins. */
export const Gallery: Story = {
  render: () => (
    <Row gap="md" wrap>
      {A_ICON_NAMES.map((name) => (
        <Stack key={name} gap="xs" align="center">
          <Icon name={name} />
          <Text variant="meta" tone="text2">
            {name}
          </Text>
        </Stack>
      ))}
    </Row>
  ),
};
