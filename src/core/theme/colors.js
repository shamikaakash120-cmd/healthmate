/**
 * @layer Core (Theme)
 * @responsibility Palette definitions and color tokens for light and dark themes.
 */

/**
 * Light theme color palette tokens.
 * Grounded in calm warm tones with soft teal and natural metric colors.
 */
export const lightColors = {
  background: '#F7F5F0',    // Calm warm off-white
  surface: '#FFFFFF',       // Clean white card surface
  surfaceAlt: '#EFECE6',    // Subtle tinted surface for inputs & chips
  primary: '#2A9D8F',       // Soft teal - calming & grounded
  primaryText: '#FFFFFF',   // White text on primary buttons
  text: '#1F2D3D',          // Deep slate text - sharp yet gentle
  textMuted: '#6B7A8C',     // Muted slate for secondary labels & hints
  border: '#E2DFD8',        // Delicate warm border
  overlay: 'rgba(15, 23, 32, 0.45)', // Modal backdrop scrim
  shadow: '#1F2D3D',        // Soft card elevation shadow color
  error: '#D9534F',         // Soft warm red - helpful, not punishing
  errorBg: '#FDF2F2',       // Error notification soft background tint
  success: '#4CAF7D',       // Soft herbal green
  successBg: '#EDF7F1',     // Success badge background tint

  // Metric color tokens
  steps: '#4CAF7D',         // Soft green for walking/steps
  stepsTint: '#EDF7F1',     // Steps card background tint
  calories: '#E76F6F',      // Soft coral red for calories burned
  caloriesTint: '#FDF1F1',  // Calories card background tint
  water: '#4A90D9',         // Soft oceanic blue for hydration
  waterTint: '#EDF4FC',     // Water card background tint
};

/**
 * Dark theme color palette tokens.
 * Deep slate background with softened, accessible hues to reduce eye strain.
 */
export const darkColors = {
  background: '#151C24',    // Deep slate background
  surface: '#222D3B',       // Elevated dark slate surface
  surfaceAlt: '#2B3848',    // Lighter dark slate for inputs & inner wells
  primary: '#3EB4A5',       // Lightened soft teal for dark contrast
  primaryText: '#0F1A1C',   // High-contrast deep slate text on lightened dark-mode accents
  text: '#F3F5F7',          // Crisp light slate for primary readability
  textMuted: '#94A3B8',     // Muted slate for captions & metadata
  border: '#2F3E50',        // Subtle dark slate border
  overlay: 'rgba(6, 10, 15, 0.65)', // Darker modal backdrop scrim in dark mode
  shadow: '#000000',        // Dark mode elevation shadow color
  error: '#F08080',         // Soft light coral red
  errorBg: '#382426',       // Dark tinted error container
  success: '#5ECB91',       // Lightened herbal green
  successBg: '#1D3327',     // Dark tinted success container

  // Metric color tokens
  steps: '#5ECB91',         // Lightened green for dark backgrounds
  stepsTint: '#1E3A2B',     // Dark steps card background tint
  calories: '#EF7E7E',      // Lightened coral for dark backgrounds
  caloriesTint: '#3C2426',  // Dark calories card background tint
  water: '#5EA1E6',         // Lightened blue for dark backgrounds
  waterTint: '#1F3147',     // Dark water card background tint
};

/**
 * Returns color tokens for the specified theme mode.
 * @param {boolean} [isDark=false] Whether dark mode is active.
 * @returns {typeof lightColors} Palette object matching active mode.
 */
export function getColors(isDark = false) {
  return isDark ? darkColors : lightColors;
}
