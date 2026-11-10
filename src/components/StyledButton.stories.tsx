import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './primitives/Stack';
import { StyledButton } from './StyledButton';

const meta: Meta<typeof StyledButton> = { title: 'Components/StyledButton', component: StyledButton };
export default meta;
type Story = StoryObj<typeof StyledButton>;

export const Primary: Story = { args: { label: 'Log in', onPress: () => undefined } };
export const Secondary: Story = {
  args: { label: 'Gallery', variant: 'secondary', icon: 'images-outline', onPress: () => undefined },
};
export const Danger: Story = { args: { label: 'Delete spot', variant: 'danger', onPress: () => undefined } };
export const Ghost: Story = { args: { label: 'Fill it in myself', variant: 'ghost', onPress: () => undefined } };
export const Ignition: Story = {
  args: { label: 'Collect', variant: 'ignition', icon: 'flag', onPress: () => undefined },
};
export const Loading: Story = { args: { label: 'Saving', isLoading: true, onPress: () => undefined } };
export const Disabled: Story = {
  args: { label: 'Collect', variant: 'ignition', disabled: true, onPress: () => undefined },
};
export const AllVariants: Story = {
  render: () => (
    <Stack gap="sm">
      <StyledButton label="Primary" onPress={() => undefined} />
      <StyledButton label="Secondary" variant="secondary" onPress={() => undefined} />
      <StyledButton label="Danger" variant="danger" onPress={() => undefined} />
      <StyledButton label="Ghost" variant="ghost" onPress={() => undefined} />
      <StyledButton label="Ignition" variant="ignition" onPress={() => undefined} />
    </Stack>
  ),
};
