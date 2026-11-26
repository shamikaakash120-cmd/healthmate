/**
 * @layer Core (Utils)
 * @responsibility Pure CSV serialization utilities for exporting health records.
 *
 * No UI code. No filesystem or sharing side-effects.
 */

/**
 * Standard CSV header row required for HealthMate record exports.
 * @type {string}
 */
export const HEALTH_RECORDS_CSV_HEADER = 'id,date,steps,calories,water';

/**
 * Escapes a single cell value according to RFC 4180 CSV rules.
 * Wraps the cell in double quotes and doubles inner quotes if it contains
 * commas, quotes, or line breaks.
 *
 * @param {unknown} value Cell value to serialize.
 * @returns {string} Escaped CSV cell string.
 */
export function escapeCsvCell(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts an array of health record objects into a CSV string with the
 * columns `id,date,steps,calories,water`, preserving the exact array order.
 *
 * @param {Array<{ id: number, date: string, steps: number, calories: number, water: number }>} [records=[]]
 *   Records currently displayed to the user.
 * @returns {string} Complete RFC 4180-compatible CSV document string.
 */
export function recordsToCsv(records = []) {
  if (!Array.isArray(records) || records.length === 0) {
    return HEALTH_RECORDS_CSV_HEADER;
  }

  const rows = records.map((record) =>
    [
      record?.id ?? '',
      record?.date ?? '',
      record?.steps ?? '',
      record?.calories ?? '',
      record?.water ?? '',
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return [HEALTH_RECORDS_CSV_HEADER, ...rows].join('\n');
}
