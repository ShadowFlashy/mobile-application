import React from 'react';
import type { Preview } from '@storybook/react';
import { View } from 'react-native';
// Components translate their texts (course ch. 20): initialise i18n like the app does.
import '../src/i18n';

const preview: Preview = {
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
