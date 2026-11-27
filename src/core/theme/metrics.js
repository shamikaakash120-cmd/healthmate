/**
 * @layer Core (Theme)
 * @responsibility Single source of truth for metric configurations, icons, units, and goals.
 */

/**
 * Metric configuration dictionary.
 */
export const METRICS = {
  steps: {
    key: 'steps',
    label: 'Steps',
    icon: 'walk',
    unit: 'steps',
    colorKey: 'steps',
    tintKey: 'stepsTint',
    defaultGoal: 10000,
    maxLimit: 100000,
    stepSize: 500,
  },
  calories: {
    key: 'calories',
    label: 'Calories',
    icon: 'fire',
    unit: 'kcal',
    colorKey: 'calories',
    tintKey: 'caloriesTint',
    defaultGoal: 500,
    maxLimit: 20000,
    stepSize: 50,
  },
  water: {
    key: 'water',
    label: 'Water',
    icon: 'water',
    unit: 'ml',
    colorKey: 'water',
    tintKey: 'waterTint',
    defaultGoal: 2000,
    maxLimit: 20000,
    stepSize: 250,
  },
};

/**
 * Array of all supported metric keys.
 */
export const METRIC_KEYS = Object.keys(METRICS);

/**
 * Retrieves configuration metadata for a specific health metric.
 * @param {'steps'|'calories'|'water'} metricKey Metric identifier.
 * @returns {typeof METRICS.steps} Configuration object for the metric.
 */
export function getMetricConfig(metricKey) {
  const config = METRICS[metricKey];
  if (!config) {
    throw new Error(`[Metrics] Unknown metric key requested: "${metricKey}". Supported keys: ${METRIC_KEYS.join(', ')}`);
  }
  return config;
}
