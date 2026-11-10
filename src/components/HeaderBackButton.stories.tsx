import type { Meta, StoryObj } from '@storybook/react';
import { HeaderBackButton } from './HeaderBackButton';

const meta: Meta<typeof HeaderBackButton> = { title: 'Components/HeaderBackButton', component: HeaderBackButton };
export default meta;
type Story = StoryObj<typeof HeaderBackButton>;

/** The stack header's back button ("Back" / "Terug"). */
export const Default: Story = { args: { onPress: () => undefined } };
