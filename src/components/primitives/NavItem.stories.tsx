import type { Meta, StoryObj } from '@storybook/react';
import { NavItem } from './NavItem';

const meta: Meta<typeof NavItem> = { title: 'Primitives/NavItem', component: NavItem };
export default meta;
type Story = StoryObj<typeof NavItem>;

export const Default: Story = { args: { label: 'Stats', icon: 'stats', onPress: () => {} } };
export const Active: Story = { args: { label: 'Album', icon: 'album', onPress: () => {}, active: true } };
export const WithBadge: Story = { args: { label: 'Garage', icon: 'garage', badgeCount: 1, onPress: () => {} } };
export const SpotKey: Story = { args: { label: 'Spot', icon: 'camera', variant: 'key', onPress: () => {} } };
