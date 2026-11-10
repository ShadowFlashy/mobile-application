import type { Meta, StoryObj } from '@storybook/react';
import { RarityRoundel } from './RarityRoundel';
import { Row } from './Row';
import { Text } from './Text';

const meta: Meta<typeof Row> = { title: 'Primitives/Row', component: Row };
export default meta;
type Story = StoryObj<typeof Row>;

/** Without a title: a horizontal layout of its children. */
export const Layout: Story = {
  render: () => (
    <Row gap="md" justify="space-between">
      <Text>Left</Text>
      <Text>Right</Text>
    </Row>
  ),
};

/** With a title: A's hairline list row (same props as ListRow). */
export const ListMode: Story = {
  render: () => (
    <Row
      title="#31 New sticker"
      subtitle="06 JDM · Japanese JDM Legends"
      trailing={<RarityRoundel rarity="epic" showLabel />}
    />
  ),
};
