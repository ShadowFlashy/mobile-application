import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { COLLECTION_IDS } from '../../types/Collection';
import { SetCompleteStamp } from './SetCompleteStamp';

const meta: Meta<typeof SetCompleteStamp> = { title: 'Album/SetCompleteStamp', component: SetCompleteStamp };
export default meta;
type Story = StoryObj<typeof SetCompleteStamp>;

export const ItalianExotics: Story = { args: { collectionId: 'italian-exotics' } };
export const Small: Story = { args: { collectionId: 'jdm-legends', size: 'sm' } };

/** The stamp in every set's livery. */
export const EverySet: Story = {
  render: () => (
    <View style={styles.grid}>
      {COLLECTION_IDS.map((id) => (
        <SetCompleteStamp key={id} collectionId={id} />
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({ grid: { gap: 24, alignItems: 'flex-start' } });
