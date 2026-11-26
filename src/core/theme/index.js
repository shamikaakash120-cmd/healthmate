/**
 * @layer Core (Theme)
 * @responsibility Unified design system exports and reactive useTheme hook.
 */
import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import { darkColors, lightColors } from './colors';
import { METRICS } from './metrics';
import { SHADOWS, getElevatedShadow, getShadow } from './shadows';
import { RADIUS, SPACING, TOUCH_TARGET } from './spacing';
import { TYPOGRAPHY } from './typography';

// Re-export all individual modules for granular imports
export * from './colors';
export * from './metrics';
export * from './shadows';
export * from './spacing';
export * from './typography';

/**
 * Default static light color tokens export for static style definitions.
 */
export const COLORS = lightColors;

/**
 * Zustand store managing user theme mode preference ('system' | 'light' | 'dark').
 */
export const useThemeStore = create((set) => ({
  themeMode: 'system',
  /**
   * Updates theme mode override.
   * @param {'system'|'light'|'dark'} mode New theme preference.
   * @returns {void}
   */
  setThemeMode: (mode) => set({ themeMode: mode }),
}));

/**
 * React hook providing the active theme tokens, responsive to system scheme and user override.
 * @returns {{
 *   isDark: boolean,
 *   themeMode: 'system'|'light'|'dark',
 *   setThemeMode: (mode: 'system'|'light'|'dark') => void,
 *   colors: typeof lightColors,
 *   typography: typeof TYPOGRAPHY,
 *   spacing: typeof SPACING,
 *   radius: typeof RADIUS,
 *   shadow: typeof SHADOWS.soft,
 *   metrics: typeof METRICS
 * }} Active theme context and tokens.
 */
export function useTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return {
    isDark,
    themeMode,
    setThemeMode,
    colors,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    radius: RADIUS,
    touchTarget: TOUCH_TARGET,
    shadow: getShadow(isDark),
    elevatedShadow: getElevatedShadow(isDark),
    metrics: METRICS,
  };
}

/**
 * Returns static theme configuration tokens.
 * @returns {object} Application theme tokens snapshot.
 */
export function getThemeTokens() {
  return {
    colors: lightColors,
    darkColors,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    radius: RADIUS,
    touchTarget: TOUCH_TARGET,
    shadow: SHADOWS.soft,
    elevatedShadow: SHADOWS.elevated,
    metrics: METRICS,
  };
}
