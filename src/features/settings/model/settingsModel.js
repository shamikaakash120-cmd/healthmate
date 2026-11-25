/**
 * @layer Model (Settings)
 * @responsibility Settings keys, theme constants, sensible goal ranges, validation, and safe parsers.
 *
 * No UI code. No SQLite code.
 */
import { METRICS, METRIC_KEYS } from '../../../core/theme/metrics';

/**
 * SQLite keys stored in the `settings` key-value table.
 * @type {Readonly<Record<'goalSteps'|'goalCalories'|'goalWater'|'themeMode', string>>}
 */
export const SETTING_KEYS = Object.freeze({
  goalSteps: 'goal_steps',
  goalCalories: 'goal_calories',
  goalWater: 'goal_water',
  themeMode: 'theme_mode',
});

/**
 * Mapping between metric keys and SQLite setting keys.
 * @type {Readonly<Record<'steps'|'calories'|'water', string>>}
 */
export const GOAL_SETTING_KEY_MAP = Object.freeze({
  steps: SETTING_KEYS.goalSteps,
  calories: SETTING_KEYS.goalCalories,
  water: SETTING_KEYS.goalWater,
});

/**
 * Allowed theme override values.
 * @type {readonly ['system', 'light', 'dark']}
 */
export const THEME_MODES = Object.freeze(['system', 'light', 'dark']);

/**
 * Default theme preference on first launch.
 * @type {'system'}
 */
export const DEFAULT_THEME_MODE = 'system';

/**
 * Default daily targets derived from the core metric catalog.
 * @type {Readonly<{ steps: number, calories: number, water: number }>}
 */
export const DEFAULT_GOALS = Object.freeze({
  steps: METRICS.steps.defaultGoal,
  calories: METRICS.calories.defaultGoal,
  water: METRICS.water.defaultGoal,
});

/**
 * Sensible daily target validation bounds for each metric.
 * @type {Readonly<Record<'steps'|'calories'|'water', { min: number, max: number, label: string, unit: string }>>}
 */
export const GOAL_RANGES = Object.freeze({
  steps: Object.freeze({
    min: 500,
    max: 50_000,
    label: 'Steps goal',
    unit: METRICS.steps.unit,
  }),
  calories: Object.freeze({
    min: 100,
    max: 5_000,
    label: 'Calories goal',
    unit: METRICS.calories.unit,
  }),
  water: Object.freeze({
    min: 500,
    max: 6_000,
    label: 'Water goal',
    unit: METRICS.water.unit,
  }),
});

/**
 * Formats a compact, user-friendly sensible range hint for a daily goal input.
 *
 * @param {'steps'|'calories'|'water'} metricKey Metric identifier.
 * @returns {string} Helper hint text (e.g. "Sensible range: 500 – 50,000 steps").
 */
export function getGoalRangeHint(metricKey) {
  const range = GOAL_RANGES[metricKey];
  if (!range) return '';
  return `Sensible range: ${range.min.toLocaleString()} – ${range.max.toLocaleString()} ${range.unit}`;
}

/**
 * Validates one daily goal value against whole-number and sensible-range rules.
 *
 * @param {unknown} rawValue Raw form value (string or number).
 * @param {{ min: number, max: number, label: string, unit: string }} range Bounds config.
 * @returns {string | null} Gentle inline error message, or null when valid.
 */
function validateGoalField(rawValue, range) {
  const strVal = String(rawValue ?? '').trim();
  if (strVal === '') {
    return `${range.label} is required. Please enter a daily target.`;
  }

  if (!/^\d+$/.test(strVal)) {
    return `${range.label} must be a whole number (no decimals or letters).`;
  }

  const num = Number(strVal);
  if (num < range.min) {
    return `${range.label} should be at least ${range.min.toLocaleString()} ${range.unit}.`;
  }
  if (num > range.max) {
    return `${range.label} should be at most ${range.max.toLocaleString()} ${range.unit}.`;
  }

  return null;
}

/**
 * Validates all three daily goal inputs together.
 *
 * @param {{ steps?: unknown, calories?: unknown, water?: unknown }} input Raw form input.
 * @returns {{ valid: boolean, errors: { steps: string|null, calories: string|null, water: string|null } }}
 */
export function validateDailyGoals(input) {
  const errors = {};
  for (const key of METRIC_KEYS) {
    errors[key] = validateGoalField(input?.[key], GOAL_RANGES[key]);
  }

  const valid = Object.values(errors).every((msg) => msg === null);
  return { valid, errors };
}

/**
 * Parses validated daily goal inputs into integer numeric targets.
 * Call only after `validateDailyGoals(input)` returns `{ valid: true }`.
 *
 * @param {{ steps: unknown, calories: unknown, water: unknown }} input Validated input values.
 * @returns {{ steps: number, calories: number, water: number }} Parsed daily goals.
 */
export function toGoalsPayload(input) {
  return {
    steps: parseInt(String(input.steps).trim(), 10),
    calories: parseInt(String(input.calories).trim(), 10),
    water: parseInt(String(input.water).trim(), 10),
  };
}

/**
 * Safely parses stored goal values from a settings key-value map,
 * falling back to `DEFAULT_GOALS` if any value is absent or invalid.
 *
 * @param {Record<string, string>} settingsMap Raw settings rows dictionary.
 * @returns {{ steps: number, calories: number, water: number }} Resolved goals.
 */
export function parseStoredGoals(settingsMap) {
  const resolved = { ...DEFAULT_GOALS };

  for (const key of METRIC_KEYS) {
    const dbKey = GOAL_SETTING_KEY_MAP[key];
    const raw = settingsMap?.[dbKey];
    if (raw !== undefined && validateGoalField(raw, GOAL_RANGES[key]) === null) {
      resolved[key] = parseInt(String(raw).trim(), 10);
    }
  }

  return resolved;
}

/**
 * Safely parses the stored theme mode from a settings key-value map,
 * defaulting to `'system'` if missing or unrecognized.
 *
 * @param {Record<string, string>} settingsMap Raw settings rows dictionary.
 * @returns {'system'|'light'|'dark'} Validated theme preference.
 */
export function parseStoredThemeMode(settingsMap) {
  const raw = settingsMap?.[SETTING_KEYS.themeMode];
  return THEME_MODES.includes(raw) ? raw : DEFAULT_THEME_MODE;
}
