/**
 * @layer Core (Theme)
 * @responsibility Soft, low-elevation shadow definitions for accessible depth.
 */

/**
 * Standard elevation tokens designed for soft, natural lighting.
 */
export const SHADOWS = {
  // Light mode soft card elevation
  soft: {
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  // Dark mode soft card elevation
  softDark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 2,
  },
};

/**
 * Resolves the soft elevation style for the active theme mode.
 * @param {boolean} [isDark=false] Whether dark mode is active.
 * @returns {typeof SHADOWS.soft} Shadow style object.
 */
export function getShadow(isDark = false) {
  return isDark ? SHADOWS.softDark : SHADOWS.soft;
}
