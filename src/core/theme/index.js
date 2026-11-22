/**
 * @layer Core (Theme)
 * @responsibility Design tokens, palette constants, typography, and spacing scales.
 */

export const COLORS = {
  background: '#F7F5F0',
  surface: '#FFFFFF',
  primary: '#2A9D8F',
  textPrimary: '#1F2D3D',
  textSecondary: '#6B7A8C',
  error: '#D9534F',
  steps: '#4CAF7D',
  calories: '#E76F6F',
  water: '#4A90D9',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  card: 20,
};

/**
 * Returns theme configuration tokens.
 * @returns {object} Application theme tokens.
 */
export function getThemeTokens() {
  return { COLORS, SPACING, RADIUS };
}
