import { StyleSheet, useColorScheme } from 'react-native';
import { darkColors, darkRarity, lightColors, lightRarity, type RarityPalette, type ThemeColors } from './colors';

export interface Theme {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  rarity: RarityPalette;
}

const lightTheme: Theme = { scheme: 'light', colors: lightColors, rarity: lightRarity };
const darkTheme: Theme = { scheme: 'dark', colors: darkColors, rarity: darkRarity };

/** The active theme, following the system light / dark mode setting. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}

/**
 * Creates a hook that returns a StyleSheet for the active theme. The sheet is built once per
 * colour scheme, so themed components are as cheap as a static StyleSheet.create.
 *
 * @example
 * const useStyles = createThemedStyles(({ colors }) => ({ title: { color: colors.text } }));
 * function Title() { const styles = useStyles(); ... }
 */
export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T): () => T {
  const cache: Partial<Record<Theme['scheme'], T>> = {};
  return function useThemedStyles(): T {
    const theme = useTheme();
    const cached = cache[theme.scheme];
    if (cached !== undefined) return cached;
    const created = StyleSheet.create(factory(theme));
    cache[theme.scheme] = created;
    return created;
  };
}
