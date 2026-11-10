import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { createContext, createElement, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { Appearance, StyleSheet, type TextStyle } from 'react-native';
import type { Rarity } from '../types/CarModel';
import type { PaintColor } from '../types/CarModel';
import { darkColors, lightColors, type ThemeColors } from './colors';
import { paint } from './paint';
import { plate, type PlateColors } from './plate';
import { roundels, type RoundelStyle } from './rarity';
import { lines, radii, rowHeights, spacing, touchTarget } from './spacing';
import { useReducedMotion } from './motion';
import { textVariants, type TextVariant } from './typography';

export type ColorScheme = 'light' | 'dark';

/** Everything a component may style itself with (direction A, see A-FOUNDATION.md). */
export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
  /** Rarity roundel styles (token names), resolved against `colors` by RarityRoundel. */
  roundels: Record<Rarity, RoundelStyle>;
  paint: Record<PaintColor, string>;
  plate: PlateColors;
  text: Record<TextVariant, TextStyle>;
  spacing: typeof spacing;
  radii: typeof radii;
  lines: typeof lines;
  rowHeights: typeof rowHeights;
  touchTarget: typeof touchTarget;
}

function buildTheme(scheme: ColorScheme, colors: ThemeColors): Theme {
  return {
    scheme,
    colors,
    roundels,
    paint,
    plate,
    text: textVariants,
    spacing,
    radii,
    lines,
    rowHeights,
    touchTarget,
  };
}

export const lightTheme: Theme = buildTheme('light', lightColors);
export const darkTheme: Theme = buildTheme('dark', darkColors);

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

/**
 * Builds the navigator options from tokens, so layouts never style the navigator inline. With
 * reduced motion, stack pushes do not slide.
 */
export function buildNavigatorTheme(theme: Theme, reduced = false): NavigatorTheme {
  const { colors } = theme;
  return {
    stack: {
      // A flat bar on the screen background, without a title: every screen shows its own large
      // condensed title in the content, so the bar keeps only the back button. No shadow, no fill.
      headerStyle: { backgroundColor: colors.bg },
      headerTintColor: colors.text,
      headerTitle: '',
      headerShadowVisible: false,
      animation: reduced ? 'none' : 'default',
      headerBackButtonDisplayMode: 'minimal',
      contentStyle: { backgroundColor: colors.bg },
    },
    tabs: {
      headerShown: false,
      sceneStyle: { backgroundColor: colors.bg },
    },
  };
}

/** Navigator options for the active scheme (`stack` for Stack, `tabs` for Tabs). */
export function useNavigatorTheme(): NavigatorTheme {
  const theme = useTheme();
  const reduced = useReducedMotion();
  return useMemo(() => buildNavigatorTheme(theme, reduced), [theme, reduced]);
}
