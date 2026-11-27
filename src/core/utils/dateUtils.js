/**
 * @layer Core (Utils)
 * @responsibility Calendar date helpers using local time only.
 *
 * Uses split YYYY-MM-DD local constructors and avoids `.toISOString()` so UTC conversion
 * never shifts midnight dates by one calendar day.
 */

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Converts a Date object to a YYYY-MM-DD string using local time.
 * Avoids UTC conversion bugs from `.toISOString()`.
 *
 * @param {Date} date - The date to convert.
 * @returns {string} ISO date string in local time (YYYY-MM-DD).
 *
 * @example
 * toISODate(new Date(2026, 7, 18)); // → "2026-08-18"
 */
export function toISODate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Returns today's date as a YYYY-MM-DD string in local time.
 *
 * @returns {string} Today in YYYY-MM-DD format.
 *
 * @example
 * today(); // → "2026-11-23"
 */
export function today() {
  return toISODate(new Date());
}

/**
 * Parses a YYYY-MM-DD ISO date string to a local-time Date object.
 * Splits the string to avoid UTC-midnight timezone shift.
 *
 * @param {string} iso - Date string in YYYY-MM-DD format.
 * @returns {Date} Corresponding local-time Date (time set to 00:00:00).
 *
 * @example
 * parseISODate("2026-08-18"); // → Date(2026, 7, 18)
 */
export function parseISODate(iso) {
  if (!isValidISODate(iso)) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns true when a YYYY-MM-DD string is syntactically and
 * calendrically valid (e.g. "2026-02-30" is rejected).
 *
 * @param {string} iso - Candidate date string.
 * @returns {boolean}
 *
 * @example
 * isValidISODate("2026-02-30"); // → false
 * isValidISODate("2026-08-18"); // → true
 */
export function isValidISODate(iso) {
  if (typeof iso !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

/**
 * Returns true when the given ISO date string represents a date
 * strictly after today in local time.
 *
 * @param {string} iso - Date string in YYYY-MM-DD format.
 * @returns {boolean}
 *
 * @example
 * isFutureDate("2099-01-01"); // → true
 * isFutureDate("2000-01-01"); // → false
 */
export function isFutureDate(iso) {
  if (!isValidISODate(iso)) return false;
  return iso > today(); // lexicographic comparison is correct for YYYY-MM-DD
}

/**
 * Formats a YYYY-MM-DD string as a human-readable date.
 * Uses the device locale for the weekday and month names.
 *
 * @param {string} iso - Date string in YYYY-MM-DD format.
 * @returns {string} Formatted string, e.g. "Tue, 18 Aug 2026".
 *
 * @example
 * formatDisplayDate("2026-08-18"); // → "Tue, 18 Aug 2026"
 */
export function formatDisplayDate(iso) {
  if (!isValidISODate(iso)) return iso;
  const date = parseISODate(iso);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns "Today", "Yesterday", or a formatted date string for older dates.
 *
 * @param {string} iso - Date string in YYYY-MM-DD format.
 * @returns {string} Relative label or formatted display date.
 *
 * @example
 * formatRelativeDay(today());              // → "Today"
 * formatRelativeDay("2026-11-22");         // → "Yesterday"
 * formatRelativeDay("2026-08-18");         // → "Tue, 18 Aug 2026"
 */
export function formatRelativeDay(iso) {
  if (!isValidISODate(iso)) return iso;
  const todayStr = today();
  if (iso === todayStr) return 'Today';

  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (iso === toISODate(yest)) return 'Yesterday';

  return formatDisplayDate(iso);
}

/**
 * Returns an array of the last N calendar dates (inclusive of today),
 * ordered from oldest to newest, as YYYY-MM-DD strings.
 *
 * @param {number} n - Number of dates to return (must be ≥ 1).
 * @returns {string[]} Array of YYYY-MM-DD strings, oldest first.
 *
 * @example
 * getLastNDates(3); // → ["2026-11-21", "2026-11-22", "2026-11-23"]
 */
export function getLastNDates(n) {
  const dates = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    dates.push(toISODate(d));
  }
  return dates;
}

/**
 * Returns the absolute number of whole calendar days between two
 * YYYY-MM-DD strings, independent of time and timezone.
 *
 * @param {string} isoA - Start date string.
 * @param {string} isoB - End date string.
 * @returns {number} Absolute number of days between the two dates.
 *
 * @example
 * getDaysBetween("2026-11-20", "2026-11-23"); // → 3
 */
export function getDaysBetween(isoA, isoB) {
  if (!isValidISODate(isoA) || !isValidISODate(isoB)) return 0;
  const a = parseISODate(isoA);
  const b = parseISODate(isoB);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.abs(Math.round((b.getTime() - a.getTime()) / msPerDay));
}

const WEEKDAY_INITIALS = Object.freeze(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
const WEEKDAY_SHORT_NAMES = Object.freeze(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

/**
 * Shifts a YYYY-MM-DD local date string by a whole number of calendar days.
 *
 * @param {string} iso - Anchor date in YYYY-MM-DD format.
 * @param {number} deltaDays - Signed day offset (e.g. -1 for yesterday).
 * @returns {string} Shifted YYYY-MM-DD date string in local time, or input if invalid.
 */
export function shiftISODate(iso, deltaDays) {
  if (!isValidISODate(iso)) return iso;
  const date = parseISODate(iso);
  date.setDate(date.getDate() + deltaDays);
  return toISODate(date);
}

/**
 * Returns the single-letter weekday initial (e.g. 'M', 'T', 'W') for a YYYY-MM-DD date.
 *
 * @param {string} iso - Date string in YYYY-MM-DD format.
 * @returns {string} Single-letter weekday initial, or '' if invalid.
 */
export function getWeekdayInitial(iso) {
  if (!isValidISODate(iso)) return '';
  return WEEKDAY_INITIALS[parseISODate(iso).getDay()] || '';
}

/**
 * Returns the short three-letter weekday name (e.g. 'Mon') for a YYYY-MM-DD date.
 *
 * @param {string} iso - Date string in YYYY-MM-DD format.
 * @returns {string} Short weekday name, or '' if invalid.
 */
export function getWeekdayShort(iso) {
  if (!isValidISODate(iso)) return '';
  return WEEKDAY_SHORT_NAMES[parseISODate(iso).getDay()] || '';
}
