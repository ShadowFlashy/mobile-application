import type { Meta, StoryObj } from '@storybook/react';
import { Row } from '../primitives/Row';
import { LevelRoundel } from './LevelRoundel';

const meta: Meta<typeof LevelRoundel> = { title: 'Progress/LevelRoundel', component: LevelRoundel };
export default meta;
type Story = StoryObj<typeof LevelRoundel>;

export const Large: Story = { args: { level: 9, size: 'lg' } };
export const Medium: Story = { args: { level: 14, size: 'md' } };
export const Small: Story = { args: { level: 3, size: 'sm' } };
export const AllSizes: Story = {
  render: () => (
    <Row gap="md" align="center">
      <LevelRoundel level={1} size="sm" />
      <LevelRoundel level={27} size="md" />
      <LevelRoundel level={50} size="lg" />
    </Row>
  ),
};
