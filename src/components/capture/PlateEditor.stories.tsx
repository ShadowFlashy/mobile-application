import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { PlateRegion } from '../../types/Spot';
import { PlateEditor } from './PlateEditor';
import { PlateShield } from './PlateShield';
import { SAMPLE_PHOTO, SAMPLE_SUGGESTION } from './storyData';

const meta: Meta<typeof PlateEditor> = { title: 'Capture/PlateEditor', component: PlateEditor };
export default meta;
type Story = StoryObj<typeof PlateEditor>;

/** Tap the dashed suggestion, drag a box to move it, drag its corner to resize, or draw your own. */
function Interactive({ withSuggestion }: { withSuggestion: boolean }) {
  const [regions, setRegions] = useState<PlateRegion[]>([]);
  const [accepted, setAccepted] = useState<number[]>([]);
  const suggestions = withSuggestion ? [SAMPLE_SUGGESTION] : [];
  return (
    <PlateEditor
      photo={SAMPLE_PHOTO}
      regions={regions}
      suggestions={suggestions}
      acceptedSuggestions={accepted}
      onAddRegion={(region) => setRegions((current) => [...current, region])}
      onUpdateRegion={(index, region) =>
        setRegions((current) => current.map((item, itemIndex) => (itemIndex === index ? region : item)))
      }
      onRemoveRegion={(index) => setRegions((current) => current.filter((_item, itemIndex) => itemIndex !== index))}
      onAcceptSuggestion={(index) => {
        const suggestion = suggestions[index];
        if (suggestion === undefined) return;
        setAccepted((current) => [...current, index]);
        setRegions((current) => [...current, suggestion]);
      }}
      overlay={<PlateShield count={regions.length} />}
    />
  );
}

export const CoDriverSuggestion: Story = { render: () => <Interactive withSuggestion /> };
export const DrawYourOwn: Story = { render: () => <Interactive withSuggestion={false} /> };
