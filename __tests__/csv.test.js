/**
 * Unit tests for pure CSV serialization utilities (`src/core/utils/csv.js`).
 */
import {
  HEALTH_RECORDS_CSV_HEADER,
  escapeCsvCell,
  recordsToCsv,
} from '../src/core/utils/csv';

describe('csv utilities', () => {
  test('returns header-only CSV when records array is empty or omitted', () => {
    expect(HEALTH_RECORDS_CSV_HEADER).toBe('id,date,steps,calories,water');
    expect(recordsToCsv([])).toBe('id,date,steps,calories,water');
    expect(recordsToCsv()).toBe('id,date,steps,calories,water');
  });

  test('serializes health records with exact column order and row ordering', () => {
    const csv = recordsToCsv([
      { id: 10, date: '2026-08-18', steps: 9400, calories: 470, water: 2300 },
      { id: 9, date: '2026-08-17', steps: 6150, calories: 305, water: 1750 },
    ]);

    expect(csv).toBe(
      [
        'id,date,steps,calories,water',
        '10,2026-08-18,9400,470,2300',
        '9,2026-08-17,6150,305,1750',
      ].join('\n')
    );
  });

  test('escapes commas, double quotes, line breaks, and nullish cells per RFC 4180', () => {
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
    expect(escapeCsvCell(1234)).toBe('1234');
    expect(escapeCsvCell('hello, world')).toBe('"hello, world"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"');
  });
});
