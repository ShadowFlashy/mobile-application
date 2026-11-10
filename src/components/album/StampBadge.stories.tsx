import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { STAMP_KINDS } from '../../types/Progress';
import { StampBadge } from './StampBadge';

const meta: Meta<typeof StampBadge> = { title: 'Album/StampBadge', component: StampBadge };
export default meta;
type Story = StoryObj<typeof StampBadge>;

export const New: Story = { args: { kind: 'new' } };
export const Count: Story = { args: { kind: 'count', count: 3 } };
export const AllStamps: Story = {
  render: () => (
    <View style={styles.row}>
      {STAMP_KINDS.map((kind) => (
        <StampBadge key={kind} kind={kind} count={kind === 'count' ? 4 : undefined} />
      ))}
      {STAMP_KINDS.map((kind) => (
        <StampBadge key={`${kind}-sm`} kind={kind} count={kind === 'count' ? 4 : undefined} size="sm" />
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 } });
