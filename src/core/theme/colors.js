/**
 * @layer Core (Theme)
 * @responsibility Palette definitions and color tokens for light and dark themes.
 */

/**
 * Light theme color palette tokens.
 * Grounded in calm warm tones with soft teal and natural metric colors.
 */
export const lightColors = {
  background: '#F7F5F0',
  surface: '#FFFFFF',
  surfaceAlt: '#EFECE6',
  primary: '#2A9D8F',
  primaryText: '#FFFFFF',
  text: '#1F2D3D',
  textMuted: '#6B7A8C',
  border: '#E2DFD8',
  overlay: 'rgba(15, 23, 32, 0.45)',
  shadow: '#1F2D3D',
  error: '#D9534F',
  errorBg: '#FDF2F2',
  success: '#4CAF7D',
  successBg: '#EDF7F1',

  steps: '#4CAF7D',
  stepsTint: '#EDF7F1',
  calories: '#E76F6F',
  caloriesTint: '#FDF1F1',
  water: '#4A90D9',
  waterTint: '#EDF4FC',
};

/**
 * Dark theme color palette tokens.
 * Deep slate background with softened, accessible hues to reduce eye strain.
 */
export const darkColors = {
  background: '#151C24',
  surface: '#222D3B',
  surfaceAlt: '#2B3848',
  primary: '#3EB4A5',
  primaryText: '#0F1A1C', // Deep slate keeps >=4.5:1 contrast on lightened dark-mode teal
  text: '#F3F5F7',
  textMuted: '#94A3B8',
  border: '#2F3E50',
  overlay: 'rgba(6, 10, 15, 0.65)',
  shadow: '#000000',
  error: '#F08080',
  errorBg: '#382426',
  success: '#5ECB91',
  successBg: '#1D3327',

  steps: '#5ECB91',
  stepsTint: '#1E3A2B',
  calories: '#EF7E7E',
  caloriesTint: '#3C2426',
  water: '#5EA1E6',
  waterTint: '#1F3147',
};

/**
 * Returns color tokens for the specified theme mode.
 * @param {boolean} [isDark=false] Whether dark mode is active.
 * @returns {typeof lightColors} Palette object matching active mode.
 */
export function getColors(isDark = false) {
  return isDark ? darkColors : lightColors;
}
