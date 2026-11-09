import type { Meta, StoryObj } from '@storybook/react';
import { CAR_CATEGORIES } from '../types/CarModel';
import { CategoryFilter } from './CategoryFilter';

const meta: Meta<typeof CategoryFilter> = {
  title: 'Components/CategoryFilter',
  component: CategoryFilter,
  argTypes: { selected: { control: 'select', options: CAR_CATEGORIES } },
};
export default meta;
type Story = StoryObj<typeof CategoryFilter>;

export const AllSelected: Story = { args: { onSelect: () => {} } };
export const SupercarsSelected: Story = { args: { selected: 'supercar', onSelect: () => {} } };
export const JdmSelected: Story = { args: { selected: 'jdm', onSelect: () => {} } };
