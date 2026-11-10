import type { Meta, StoryObj } from '@storybook/react';
import { BrandHeader } from '../BrandHeader';
import { InputField } from '../primitives/InputField';
import { StyledButton } from '../StyledButton';
import { AuthLayout } from './AuthLayout';

const meta: Meta<typeof AuthLayout> = { title: 'Brand/AuthLayout', component: AuthLayout };
export default meta;
type Story = StoryObj<typeof AuthLayout>;

export const Login: Story = {
  args: {
    children: (
      <>
        <BrandHeader subtitle="Snap it. We blur it. You collect it." />
        <InputField label="Email" value="" onChangeText={() => undefined} />
        <StyledButton label="Log in" onPress={() => undefined} />
      </>
    ),
    footer: <StyledButton label="No account yet? Create one" variant="ghost" onPress={() => undefined} />,
  },
};
