import type { Meta, StoryObj } from '@storybook/react';
import { Nav } from './Nav';
import { NavItem } from './NavItem';

const meta: Meta<typeof Nav> = { title: 'Primitives/Nav', component: Nav };
export default meta;
type Story = StoryObj<typeof Nav>;

/** A's tab bar: Album · Stats · the red Spot key · Garage (with a badge) · Profile. */
export const Default: Story = {
  args: {
    children: (
      <>
        <NavItem label="Album" icon="album" onPress={() => {}} active />
        <NavItem label="Stats" icon="stats" onPress={() => {}} />
        <NavItem label="Spot" icon="camera" variant="key" onPress={() => {}} />
        <NavItem label="Garage" icon="garage" badgeCount={1} onPress={() => {}} />
        <NavItem label="Profile" icon="profile" onPress={() => {}} />
      </>
    ),
  },
};
