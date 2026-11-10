import React, { type ReactNode } from 'react';
import type { Preview } from '@storybook/react';
import { View, StyleSheet } from 'react-native';
// Components translate their texts: initialise i18n like the app does.
import '../src/i18n';
// LIVERY fonts under the registered family names (SPEC §7.12).
import './fonts.css';
import { createThemedStyles, spacing, ThemeProvider } from '../src/theme';

const usePanelStyles = createThemedStyles(({ colors }) => ({
  panel: { flex: 1, minWidth: 320, padding: spacing.md, backgroundColor: colors.background },
}));

/** One scheme's half of the canvas, on that scheme's own background. */
function SchemePanel({ children }: { children: ReactNode }) {
  const styles = usePanelStyles();
  return <View style={styles.panel}>{children}</View>;
}

/** Every story renders twice, side by side: Paddock Paper (light) and Night Session (dark). */
function LightAndDark({ children }: { children: ReactNode }) {
  return (
    <View style={layout.row}>
      {(['light', 'dark'] as const).map((scheme) => (
        <ThemeProvider key={scheme} scheme={scheme}>
          <SchemePanel>{children}</SchemePanel>
        </ThemeProvider>
      ))}
    </View>
  );
}

const layout = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch' },
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <LightAndDark>
        <Story />
      </LightAndDark>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
