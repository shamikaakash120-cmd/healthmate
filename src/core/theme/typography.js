/**
 * @layer Core (Theme)
 * @responsibility Typography scales, font sizes, weights, and line heights.
 */

/**
 * Standard typography scale adhering to Material Design 3 guidelines.
 * Optimized for mobile legibility and glanceable health statistics.
 */
export const TYPOGRAPHY = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: 0,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  metricNumber: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
};

/**
 * Resolves a typography style object from the type scale.
 * @param {'display'|'title'|'heading'|'body'|'caption'|'metricNumber'} variant Typography variant key.
 * @returns {object} React Native TextStyle object.
 */
export function getTypographyStyle(variant = 'body') {
  return TYPOGRAPHY[variant] || TYPOGRAPHY.body;
}
