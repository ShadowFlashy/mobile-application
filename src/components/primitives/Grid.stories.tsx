import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';
import { Surface } from './Surface';
import { Text } from './Text';

const meta: Meta<typeof Grid> = { title: 'Primitives/Grid', component: Grid };
export default meta;
type Story = StoryObj<typeof Grid>;

const CARS = ['Porsche 911 GT3', 'Mazda MX-5', 'Ferrari 308 GTSi', 'BMW M3', 'Fiat 500'];

function Cars({ columns }: { columns: 2 | 3 }) {
  return (
    <Grid
      data={CARS}
      columns={columns}
      keyExtractor={(car) => car}
      renderItem={({ item }) => (
        <Surface padding="md" radius="sticker">
          <Text variant="bodyStrong">{item}</Text>
        </Surface>
      )}
      header={<Text variant="title">Sports</Text>}
    />
  );
}

export const TwoColumns: Story = { render: () => <Cars columns={2} /> };
export const ThreeColumns: Story = { render: () => <Cars columns={3} /> };
