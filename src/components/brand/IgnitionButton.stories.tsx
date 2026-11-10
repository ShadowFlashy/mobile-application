import type { Meta, StoryObj } from '@storybook/react';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { IgnitionButton } from './IgnitionButton';

const meta: Meta<typeof IgnitionButton> = { title: 'Brand/IgnitionButton', component: IgnitionButton };
export default meta;
type Story = StoryObj<typeof IgnitionButton>;

export const Idle: Story = {
  args: { label: 'SPOT', onPress: () => undefined },
  decorators: [
    (Story) => (
      <Stack padding="lg">
        <Row>
          <Story />
        </Row>
      </Stack>
    ),
  ],
};
export const Active: Story = { ...Idle, args: { label: 'SPOT', active: true, onPress: () => undefined } };
