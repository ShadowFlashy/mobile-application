import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { OptionRow } from './OptionRow';

type Language = 'en' | 'nl';

const OPTIONS = [
  { value: 'en', label: 'EN', accessibilityLabel: 'English' },
  { value: 'nl', label: 'NL', accessibilityLabel: 'Nederlands' },
] as const;

function LanguageDemo({ initial }: { initial: Language }) {
  const [value, setValue] = useState<Language>(initial);
  return <OptionRow<Language> label="Language" options={OPTIONS} value={value} onChange={setValue} testID="language" />;
}

const meta: Meta<typeof LanguageDemo> = {
  title: 'Trust/OptionRow',
  component: LanguageDemo,
  args: { initial: 'en' },
};
export default meta;
type Story = StoryObj<typeof LanguageDemo>;

export const English: Story = {};

export const Dutch: Story = { args: { initial: 'nl' } };
