import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { createContext, createElement, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { Appearance, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Rarity } from '../types/CarModel';
import type { PaintColor } from '../types/CarModel';
import type { CollectionId } from '../types/Collection';
import type { AlbumPageId } from '../types/Progress';
import { darkColors, darkRarity, lightColors, lightRarity, type RarityPalette, type ThemeColors } from './colors';
import { elevation, type ElevationToken } from './elevation';
import { finishes, type Finish } from './finishes';
import { instruments, type InstrumentColors } from './instruments';
import { collectionLiveries, liveries, type Livery } from './liveries';
import { paint } from './paint';
import { plate, type PlateColors } from './plate';
import { radii, spacing } from './spacing';
import { FONT_FAMILIES, fontFamily, textVariants, type TextVariant } from './typography';

export type ColorScheme = 'light' | 'dark';

/** Everything a component may style itself with (SPEC §7.8). */
export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
  rarity: RarityPalette;
  instruments: InstrumentColors;
  finishes: Record<Rarity, Finish>;
  liveries: Record<AlbumPageId, Livery>;
  /** Appendix E: one livery per themed collection. */
  collectionLiveries: Record<CollectionId, Livery>;
  paint: Record<PaintColor, string>;
  plate: PlateColors;
  text: Record<TextVariant, TextStyle>;
  spacing: typeof spacing;
  radii: typeof radii;
  elevation: Record<ElevationToken, ViewStyle>;
}

const shared = {
  instruments,
  finishes,
  liveries,
  collectionLiveries,
  paint,
  plate,
  text: textVariants,
  spacing,
  radii,
  elevation,
};

export const lightTheme: Theme = { scheme: 'light', colors: lightColors, rarity: lightRarity, ...shared };
export const darkTheme: Theme = { scheme: 'dark', colors: darkColors, rarity: darkRarity, ...shared };

const SchemeOverrideContext = createContext<ColorScheme | undefined>(undefined);

interface ThemeProviderProps {
  /** Forces a scheme (Storybook, P1 setting). Without it the system scheme is followed. */
  scheme?: ColorScheme;
  children: ReactNode;
}

/** Overrides the colour scheme for everything inside it. */
export function ThemeProvider({ scheme, children }: ThemeProviderProps) {
  return createElement(SchemeOverrideContext.Provider, { value: scheme }, children);
}

function subscribeToScheme(onChange: () => void): () => void {
  const subscription = Appearance.addChangeListener(onChange);
  return () => subscription.remove();
}

function systemScheme(): ColorScheme {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

/** The static web export is pre-rendered without a device, so in light. */
function prerenderedScheme(): ColorScheme {
  return 'light';
}

/**
 * The system light / dark mode. Through useSyncExternalStore, the web build hydrates its pre-rendered
 * (light) HTML first and then switches to dark; a plain useColorScheme starts as dark during
 * hydration, and React keeps the light markup on screen.
 */
function useSystemScheme(): ColorScheme {
  return useSyncExternalStore(subscribeToScheme, systemScheme, prerenderedScheme);
}

/** The active theme: the ThemeProvider override, otherwise the system light / dark mode. */
export function useTheme(): Theme {
  const override = useContext(SchemeOverrideContext);
  const system = useSystemScheme();
  const scheme = override ?? system;
  return scheme === 'dark' ? darkTheme : lightTheme;
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
  const cache: Partial<Record<ColorScheme, T>> = {};
  return function useThemedStyles(): T {
    const theme = useTheme();
    const cached = cache[theme.scheme];
    if (cached !== undefined) return cached;
    const created = StyleSheet.create(factory(theme));
    cache[theme.scheme] = created;
    return created;
  };
}

export interface NavigatorTheme {
  stack: NativeStackNavigationOptions;
  tabs: BottomTabNavigationOptions;
}

/** Builds the navigator options from tokens, so layouts never style the navigator inline. */
export function buildNavigatorTheme(theme: Theme): NavigatorTheme {
  const { colors } = theme;
  return {
    stack: {
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerTitleStyle: {
        fontFamily: fontFamily(FONT_FAMILIES.condensedExtraBoldItalic),
        fontSize: 22,
        color: colors.text,
      },
      headerShadowVisible: false,
      headerBackButtonDisplayMode: 'minimal',
      contentStyle: { backgroundColor: colors.background },
    },
    tabs: {
      headerShown: false,
      sceneStyle: { backgroundColor: colors.background },
    },
  };
}

/** Navigator options for the active scheme (`stack` for Stack, `tabs` for Tabs). */
export function useNavigatorTheme(): NavigatorTheme {
  const theme = useTheme();
  return useMemo(() => buildNavigatorTheme(theme), [theme]);
}
