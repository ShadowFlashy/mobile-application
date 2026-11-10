import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './primitives/Stack';
import { StyledButton } from './StyledButton';

const meta: Meta<typeof StyledButton> = { title: 'Components/StyledButton', component: StyledButton };
export default meta;
type Story = StoryObj<typeof StyledButton>;

export const Primary: Story = { args: { label: 'Add to album', onPress: () => undefined } };
export const Secondary: Story = { args: { label: 'Choose a photo', variant: 'secondary', onPress: () => undefined } };
export const TextAction: Story = { args: { label: 'See all', variant: 'text', onPress: () => undefined } };
export const Destructive: Story = {
  args: { label: 'Delete spot', variant: 'destructive', onPress: () => undefined },
};
export const Loading: Story = { args: { label: 'Saving', isLoading: true, onPress: () => undefined } };
export const Disabled: Story = { args: { label: 'Add to album', disabled: true, onPress: () => undefined } };
export const AllVariants: Story = {
  render: () => (
    <Stack gap="sm">
      <StyledButton label="Add to album" onPress={() => undefined} />
      <StyledButton label="Add to album" disabled onPress={() => undefined} />
      <StyledButton label="Choose a photo" variant="secondary" onPress={() => undefined} />
      <StyledButton label="See all" variant="text" onPress={() => undefined} />
      <StyledButton label="Delete spot" variant="destructive" onPress={() => undefined} />
    </Stack>
  ),
};
