import type { Meta, StoryObj } from '@storybook/react';
import { Section } from '../primitives/Section';
import { Text } from '../primitives/Text';
import { SectionText } from './SectionText';

const meta: Meta<typeof SectionText> = { title: 'Album/SectionText', component: SectionText };
export default meta;
type Story = StoryObj<typeof SectionText>;

export const UnderASection: Story = {
  render: () => (
    <Section title="Background">
      <SectionText>
        <Text variant="value">The fuel-injected targa from Magnum, P.I.</Text>
        <Text variant="value" tone="text2">
          A second paragraph in text-2.
        </Text>
      </SectionText>
    </Section>
  ),
};
