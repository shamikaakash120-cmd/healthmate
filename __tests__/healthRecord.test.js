/**
 * Unit tests for record domain validation and parsing (`src/features/records/model/healthRecord.js`).
 */
import {
  LIMITS,
  createHealthRecord,
  toHealthRecord,
  validateRecord,
} from '../src/features/records/model/healthRecord';

describe('healthRecord — validateRecord & toHealthRecord', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Pin local clock to 18 Aug 2026 12:00:00
    jest.setSystemTime(new Date(2026, 7, 18, 12, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('accepts a valid record with today date and numeric strings', () => {
    const result = validateRecord({
      date: '2026-08-18',
      steps: '8500',
      calories: '420',
      water: '2000',
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({
      date: null,
      steps: null,
      calories: null,
      water: null,
    });
  });

  test('accepts exact boundary minimum (0) and maximum limits', () => {
    const minResult = validateRecord({
      date: '2026-08-18',
      steps: 0,
      calories: 0,
      water: 0,
    });
    expect(minResult.valid).toBe(true);

    const maxResult = validateRecord({
      date: '2026-08-18',
      steps: LIMITS.stepsMax,
      calories: LIMITS.caloriesMax,
      water: LIMITS.waterMax,
    });
    expect(maxResult.valid).toBe(true);
  });

  test('rejects blank / missing values across all fields', () => {
    const result = validateRecord({
      date: '',
      steps: '   ',
      calories: null,
      water: undefined,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.date).toMatch(/required/i);
    expect(result.errors.steps).toMatch(/required/i);
    expect(result.errors.calories).toMatch(/required/i);
    expect(result.errors.water).toMatch(/required/i);
  });

  test('rejects negative numeric entries', () => {
    const result = validateRecord({
      date: '2026-08-18',
      steps: '-10',
      calories: -1,
      water: '-500',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.steps).toMatch(/whole number/i);
    expect(result.errors.calories).toMatch(/whole number/i);
    expect(result.errors.water).toMatch(/whole number/i);
  });

  test('rejects decimal and non-numeric values', () => {
    const result = validateRecord({
      date: '2026-08-18',
      steps: '1250.5',
      calories: '300.0',
      water: '500ml',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.steps).toMatch(/whole number/i);
    expect(result.errors.calories).toMatch(/whole number/i);
    expect(result.errors.water).toMatch(/whole number/i);
  });

  test('rejects values exceeding maximum sensible limits', () => {
    const result = validateRecord({
      date: '2026-08-18',
      steps: LIMITS.stepsMax + 1,
      calories: LIMITS.caloriesMax + 1,
      water: LIMITS.waterMax + 1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.steps).toMatch(/maximum allowed/i);
    expect(result.errors.calories).toMatch(/maximum allowed/i);
    expect(result.errors.water).toMatch(/maximum allowed/i);
  });

  test('rejects future dates and invalid calendar dates', () => {
    const futureResult = validateRecord({
      date: '2026-08-19',
      steps: '5000',
      calories: '250',
      water: '1500',
    });
    expect(futureResult.valid).toBe(false);
    expect(futureResult.errors.date).toMatch(/future/i);

    const badCalendarResult = validateRecord({
      date: '2026-02-30',
      steps: '5000',
      calories: '250',
      water: '1500',
    });
    expect(badCalendarResult.valid).toBe(false);
    expect(badCalendarResult.errors.date).toMatch(/valid date/i);
  });

  test('parses validated string inputs into numeric HealthRecord payloads', () => {
    const parsed = toHealthRecord(
      { date: ' 2026-08-18 ', steps: '7452', calories: '320', water: '1500' },
      42
    );

    expect(parsed).toEqual({
      id: 42,
      date: '2026-08-18',
      steps: 7452,
      calories: 320,
      water: 1500,
    });

    const fresh = createHealthRecord();
    expect(fresh).toEqual({
      id: null,
      date: '2026-08-18',
      steps: 0,
      calories: 0,
      water: 0,
    });
  });
});
