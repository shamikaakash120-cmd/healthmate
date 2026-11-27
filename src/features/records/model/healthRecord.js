/**
 * @layer Model (Records)
 * @responsibility HealthRecord data shape, factory, and pure input validation.
 */

import { isFutureDate, isValidISODate, today } from '../../../core/utils/dateUtils';

/** @type {Readonly<Record<string, number>>} */
export const LIMITS = Object.freeze({
  stepsMin: 0,
  stepsMax: 100_000,
  caloriesMin: 0,
  caloriesMax: 20_000,
  waterMin: 0,
  waterMax: 20_000,
});

/**
 * @typedef {object} HealthRecord
 * @property {number|null} id        - SQLite row ID; null for a new, unsaved record.
 * @property {string}      date      - Local date string in YYYY-MM-DD format.
 * @property {number}      steps     - Step count (whole number, 0 – 100 000).
 * @property {number}      calories  - Active calories burned in kcal (0 – 20 000).
 * @property {number}      water     - Water consumed in ml (0 – 20 000).
 */

/**
 * @typedef {object} ValidationErrors
 * @property {string|null} date     - Date field error message, or null if valid.
 * @property {string|null} steps    - Steps field error message, or null if valid.
 * @property {string|null} calories - Calories field error message, or null if valid.
 * @property {string|null} water    - Water field error message, or null if valid.
 */

/**
 * @typedef {object} ValidationResult
 * @property {boolean}          valid  - True only when every field passes all checks.
 * @property {ValidationErrors} errors - Per-field friendly error messages.
 */

/**
 * Creates a fresh HealthRecord with safe defaults for use in the Add form.
 *
 * @param {Partial<HealthRecord>} [overrides={}] - Optional field overrides.
 * @returns {HealthRecord} A new record object (id is null, date is today).
 *
 * @example
 * createHealthRecord();
 * // → { id: null, date: "2026-11-23", steps: 0, calories: 0, water: 0 }
 */
export function createHealthRecord(overrides = {}) {
  return {
    id: null,
    date: today(),
    steps: 0,
    calories: 0,
    water: 0,
    ...overrides,
  };
}

/**
 * Validates the date field.
 * @param {unknown} rawDate
 * @returns {string|null} Error message, or null if valid.
 */
function validateDate(rawDate) {
  if (rawDate === null || rawDate === undefined || String(rawDate).trim() === '') {
    return 'Date is required. Please select a date.';
  }
  const str = String(rawDate).trim();
  if (!isValidISODate(str)) {
    return 'Please enter a valid date (YYYY-MM-DD format).';
  }
  if (isFutureDate(str)) {
    return "You can't log records for future dates. Please choose today or an earlier date.";
  }
  return null;
}

/**
 * Validates a numeric metric field (steps, calories, water).
 * Accepts numeric strings from text inputs.
 *
 * @param {unknown} rawValue    - Raw field value (may be string or number).
 * @param {string}  fieldLabel  - Human-readable field name for messages.
 * @param {string}  unit        - Unit label for messages (e.g. "steps", "kcal", "ml").
 * @param {number}  min         - Minimum allowed value (inclusive).
 * @param {number}  max         - Maximum allowed value (inclusive).
 * @returns {string|null} Error message, or null if valid.
 */
function validateMetricField(rawValue, fieldLabel, unit, min, max) {
  const strVal = String(rawValue ?? '').trim();
  if (strVal === '') {
    return `${fieldLabel} is required. Please enter a value.`;
  }

  // Integer-only pattern rejects decimals, signs, and non-numeric text upfront
  if (!/^\d+$/.test(strVal)) {
    return `${fieldLabel} must be a whole number (no decimals or letters). You entered "${strVal}".`;
  }

  const num = Number(strVal);

  if (num < min) {
    return `${fieldLabel} cannot be negative. Please enter a value of at least ${min} ${unit}.`;
  }

  if (num > max) {
    return `${fieldLabel} seems too high. The maximum allowed is ${max.toLocaleString()} ${unit}. Please double-check your entry.`;
  }

  return null;
}

/**
 * Validates all fields of a health record input object.
 * Accepts values as strings (from text inputs) or numbers.
 * Returns per-field friendly error messages suitable for inline display.
 *
 * @param {object} input                   - Raw form input object.
 * @param {unknown} input.date             - Date string (YYYY-MM-DD).
 * @param {unknown} input.steps            - Steps value (string or number).
 * @param {unknown} input.calories         - Calories value (string or number).
 * @param {unknown} input.water            - Water value in ml (string or number).
 * @returns {ValidationResult}
 *
 * @example
 * validateRecord({ date: "2099-01-01", steps: "abc", calories: "", water: "500" });
 * // → {
 * //     valid: false,
 * //     errors: {
 * //       date:     "You can't log records for future dates…",
 * //       steps:    "Steps must be a whole number…",
 * //       calories: "Calories is required…",
 * //       water:    null,
 * //     }
 * //   }
 */
export function validateRecord(input) {
  const errors = {
    date: validateDate(input?.date),
    steps: validateMetricField(input?.steps, 'Steps', 'steps', LIMITS.stepsMin, LIMITS.stepsMax),
    calories: validateMetricField(input?.calories, 'Calories', 'kcal', LIMITS.caloriesMin, LIMITS.caloriesMax),
    water: validateMetricField(input?.water, 'Water', 'ml', LIMITS.waterMin, LIMITS.waterMax),
  };

  const valid = Object.values(errors).every((e) => e === null);
  return { valid, errors };
}

/**
 * Converts a validated raw input object to a typed HealthRecord,
 * parsing string values to integers.
 * Only call this after `validateRecord` returns `{ valid: true }`.
 *
 * @param {object}      input   - Raw form input object (all fields assumed valid).
 * @param {number|null} [id]    - Existing DB row ID when editing; null when creating.
 * @returns {HealthRecord} Typed, DB-ready record.
 *
 * @example
 * toHealthRecord({ date: "2026-11-23", steps: "7452", calories: "320", water: "1500" });
 * // → { id: null, date: "2026-11-23", steps: 7452, calories: 320, water: 1500 }
 */
export function toHealthRecord(input, id = null) {
  return {
    id,
    date: String(input.date).trim(),
    steps: parseInt(String(input.steps).trim(), 10),
    calories: parseInt(String(input.calories).trim(), 10),
    water: parseInt(String(input.water).trim(), 10),
  };
}
