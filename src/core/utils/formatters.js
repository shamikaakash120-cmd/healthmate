/**
 * @layer Core (Utils)
 * @responsibility Display formatting helpers: numbers, greetings, units.
 * Pure functions — no UI, no DB, no side-effects.
 */

// ─── Number formatting ────────────────────────────────────────────────────────

/**
 * Formats a number with locale-aware thousands separators.
 * Falls back gracefully if the value is not a finite number.
 *
 * @param {number|string} value - Numeric value to format.
 * @param {string} [locale='en-GB'] - BCP 47 locale tag.
 * @returns {string} Formatted string, e.g. 10000 → "10,000".
 *
 * @example
 * formatNumber(10000);       // → "10,000"
 * formatNumber(1234567.89);  // → "1,234,567.89"
 * formatNumber('abc');       // → "0"
 */
export function formatNumber(value, locale = 'en-GB') {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString(locale);
}

/**
 * Abbreviates a large number to a compact string with one decimal place.
 * Values below 1 000 are returned as-is (no suffix).
 *
 * @param {number} value - Numeric value.
 * @returns {string} Compact string, e.g. 10000 → "10.0k".
 *
 * @example
 * formatCompact(999);    // → "999"
 * formatCompact(10000);  // → "10.0k"
 * formatCompact(2500000);// → "2.5M"
 */
export function formatCompact(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/**
 * Formats a metric value with its unit suffix.
 *
 * @param {number|string} value - Numeric metric value.
 * @param {string} unit - Unit label (e.g. 'steps', 'kcal', 'ml').
 * @returns {string} Formatted string, e.g. "10,000 steps".
 *
 * @example
 * formatWithUnit(7452, 'steps'); // → "7,452 steps"
 * formatWithUnit(1750, 'ml');    // → "1,750 ml"
 */
export function formatWithUnit(value, unit) {
  return `${formatNumber(value)} ${unit}`;
}

// ─── Time-of-day greeting ─────────────────────────────────────────────────────

/**
 * Returns a friendly greeting appropriate for the current local time of day.
 *
 * | Hour range | Greeting             |
 * |------------|----------------------|
 * | 00–11      | Good morning         |
 * | 12–16      | Good afternoon       |
 * | 17–20      | Good evening         |
 * | 21–23      | Good night           |
 *
 * @param {Date} [now=new Date()] - Optionally inject a date for testability.
 * @returns {string} Time-appropriate greeting string.
 *
 * @example
 * greetingForTime(new Date(2026, 0, 1, 9));  // → "Good morning"
 * greetingForTime(new Date(2026, 0, 1, 14)); // → "Good afternoon"
 * greetingForTime(new Date(2026, 0, 1, 20)); // → "Good evening"
 * greetingForTime(new Date(2026, 0, 1, 22)); // → "Good night"
 */
export function greetingForTime(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

// ─── Progress helpers ─────────────────────────────────────────────────────────

/**
 * Calculates the percentage completion of a metric toward its goal,
 * clamped between 0 and 100.
 *
 * @param {number} value - Current value.
 * @param {number} goal - Target / goal value.
 * @returns {number} Percentage as an integer 0–100.
 *
 * @example
 * calcProgressPercent(7500, 10000); // → 75
 * calcProgressPercent(12000, 10000); // → 100 (clamped)
 */
export function calcProgressPercent(value, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((value / goal) * 100));
}
