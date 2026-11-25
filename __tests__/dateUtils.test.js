/**
 * Unit tests for local calendar date utilities (`src/core/utils/dateUtils.js`).
 */
import {
  formatDisplayDate,
  formatRelativeDay,
  getDaysBetween,
  getLastNDates,
  getWeekdayInitial,
  getWeekdayShort,
  isFutureDate,
  isValidISODate,
  parseISODate,
  shiftISODate,
  toISODate,
  today,
} from '../src/core/utils/dateUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Tuesday, 18 August 2026 at local noon
    jest.setSystemTime(new Date(2026, 7, 18, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('converts and parses YYYY-MM-DD in local time without UTC day shift', () => {
    const localDate = new Date(2026, 7, 18, 0, 5, 0);
    expect(toISODate(localDate)).toBe('2026-08-18');
    expect(today()).toBe('2026-08-18');

    const parsed = parseISODate('2026-08-18');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(18);
  });

  test('validates calendar dates including leap days and rejects bad dates', () => {
    expect(isValidISODate('2024-02-29')).toBe(true);
    expect(isValidISODate('2026-08-18')).toBe(true);
    expect(isValidISODate('2026-02-29')).toBe(false);
    expect(isValidISODate('2026-02-30')).toBe(false);
    expect(isValidISODate('18-08-2026')).toBe(false);
    expect(isValidISODate(null)).toBe(false);
  });

  test('formats display date and passes invalid input through unchanged', () => {
    expect(formatDisplayDate('2026-08-18')).toBe('Tue, 18 Aug 2026');
    expect(formatDisplayDate('invalid-date')).toBe('invalid-date');
  });

  test('returns Today, Yesterday, or formatted date for formatRelativeDay', () => {
    expect(formatRelativeDay('2026-08-18')).toBe('Today');
    expect(formatRelativeDay('2026-08-17')).toBe('Yesterday');
    expect(formatRelativeDay('2026-08-16')).toBe('Sun, 16 Aug 2026');
  });

  test('detects future dates accurately', () => {
    expect(isFutureDate('2026-08-19')).toBe(true);
    expect(isFutureDate('2099-01-01')).toBe(true);
    expect(isFutureDate('2026-08-18')).toBe(false);
    expect(isFutureDate('2026-08-17')).toBe(false);
    expect(isFutureDate('2026-02-30')).toBe(false);
  });

  test('generates last N dates ordered oldest to newest', () => {
    expect(getLastNDates(1)).toEqual(['2026-08-18']);
    expect(getLastNDates(7)).toEqual([
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
      '2026-08-15',
      '2026-08-16',
      '2026-08-17',
      '2026-08-18',
    ]);

    // Verify month-boundary crossing (1 Aug -> 31 Jul)
    jest.setSystemTime(new Date(2026, 7, 2, 9, 0, 0));
    expect(getLastNDates(3)).toEqual([
      '2026-07-31',
      '2026-08-01',
      '2026-08-02',
    ]);
  });

  test('computes shifted dates, day differences, and weekday labels', () => {
    expect(shiftISODate('2026-08-18', -1)).toBe('2026-08-17');
    expect(shiftISODate('2026-08-01', -1)).toBe('2026-07-31');
    expect(getDaysBetween('2026-08-10', '2026-08-18')).toBe(8);
    expect(getWeekdayInitial('2026-08-18')).toBe('T');
    expect(getWeekdayShort('2026-08-18')).toBe('Tue');
  });
});
