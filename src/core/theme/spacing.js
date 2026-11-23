/**
 * @layer Core (Theme)
 * @responsibility Layout metrics, 8-pt spacing grid, radii, and touch targets.
 */

/**
 * 8-pt spacing grid scale.
 * Keeps visual hierarchy balanced, thumb-friendly, and consistently spaced.
 */
export const SPACING = {
  xs: 4,    // Half step (4dp) - tight badge padding & micro gaps
  sm: 8,    // 1 unit (8dp) - standard element spacing & icon gap
  md: 16,   // 2 units (16dp) - card inner padding & content margins
  lg: 24,   // 3 units (24dp) - section padding & screen margins
  xl: 32,   // 4 units (32dp) - major module separation
  xxl: 40,  // 5 units (40dp) - header & hero gaps
  xxxl: 48, // 6 units (48dp) - floating action button clearance
};

/**
 * Corner radii tokens ensuring one cohesive design language.
 */
export const RADIUS = {
  card: 20,    // Universal card border radius (20dp)
  button: 14,  // Standard interactive button radius (14dp)
  sm: 8,       // Micro radius for chips & badges
  pill: 9999,  // Pill radius for toggle switches & search bars
};

/**
 * Minimum touch target dimensions adhering to mobile accessibility standards.
 */
export const TOUCH_TARGET = {
  min: 48,     // 48dp x 48dp minimum accessible touch target
};

/**
 * Multiplies the base 8-pt unit.
 * @param {number} units Number of 8-pt units.
 * @returns {number} Pixel value in dp.
 */
export function getSpacing(units = 1) {
  return units * 8;
}
