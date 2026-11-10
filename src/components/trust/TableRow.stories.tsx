import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Text } from '../primitives/Text';
import { TableHeader, TableRow } from './TableRow';

function TableDemo() {
  return (
    <View>
      <TableHeader left="Data" right="Owner sees" />
      <TableRow label="City" value={<Text variant="value">Shown</Text>} />
      <TableRow
        label="Licence plates"
        hint="Never stored"
        value={<Text variant="num">0</Text>}
        accessibilityLabel="Licence plates: 0, Never stored"
      />
    </View>
  );
}

const meta: Meta<typeof TableDemo> = {
  title: 'Trust/TableRow',
  component: TableDemo,
};
export default meta;
type Story = StoryObj<typeof TableDemo>;

export const Table: Story = {};
