import type { Meta, StoryObj } from '@storybook/react';
import { Row } from './Row';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = { title: 'Primitives/Tag', component: Tag };
export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = { args: { label: 'Leuven' } };
export const WithRemove: Story = { args: { label: 'Removable', onRemove: () => undefined } };
export const Selected: Story = { args: { label: 'JDM', selected: true, onPress: () => undefined } };
export const Accent: Story = { args: { label: 'Chase', tone: 'accent', icon: 'flag' } };
export const Auto: Story = { args: { label: 'Auto', tone: 'auto' } };
export const Group: Story = {
  render: () => (
    <Row gap="sm" wrap>
      <Tag label="Auto" tone="auto" />
      <Tag label="Blue" icon="color-palette-outline" />
      <Tag label="Selected" selected onPress={() => undefined} />
    </Row>
  ),
};
