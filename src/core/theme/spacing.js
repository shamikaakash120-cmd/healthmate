/**
 * @layer Core (Theme)
 * @responsibility Layout metrics, 8-pt spacing grid, radii, and touch targets.
 */

/**
 * 8-pt layout spacing scale tokens.
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48, // Used to clear the bottom-right FloatingActionButton in scroll views
};

/**
 * Corner radii tokens ensuring one cohesive design language.
 */
export const RADIUS = {
  card: 20,
  button: 14,
  sm: 8,
  pill: 9999,
};

/**
 * Minimum touch target dimensions adhering to mobile accessibility standards.
 */
export const TOUCH_TARGET = {
  min: 48,
};

/**
 * Multiplies the base 8-pt unit.
 * @param {number} units Number of 8-pt units.
 * @returns {number} Pixel value in dp.
 */
export function getSpacing(units = 1) {
  return units * 8;
}
