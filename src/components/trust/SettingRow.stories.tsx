import type { Meta, StoryObj } from '@storybook/react';
import { SettingRow } from './SettingRow';

const meta: Meta<typeof SettingRow> = {
  title: 'Trust/SettingRow',
  component: SettingRow,
  args: { icon: 'shield-checkmark-outline', label: 'Trust Center' },
};
export default meta;
type Story = StoryObj<typeof SettingRow>;

export const Link: Story = {
  args: { description: 'Co-Driver, auto-city and what Redline stores', onPress: () => undefined },
};

export const WithValue: Story = {
  args: { icon: 'language-outline', label: 'Language', value: 'Nederlands', onPress: () => undefined },
};

export const InformationOnly: Story = {
  args: { icon: 'information-circle-outline', label: 'Version', value: '2.0.0' },
};
