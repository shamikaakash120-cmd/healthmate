/**
 * @layer ViewModel (Records)
 * @responsibility Zustand store managing records state, validation, search/filtering, and repository orchestration.
 */
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { recordsToCsv } from '../../../core/utils/csv';
import {
  getLastNDates,
  isFutureDate,
  isValidISODate,
  today,
} from '../../../core/utils/dateUtils';
import { toHealthRecord, validateRecord } from '../model';
import {
  createRecord,
  deleteRecord,
  getAllRecords,
  getRecordById,
  getRecordsBetween,
  getRecordsByDate,
  getTotalsForDate,
  updateRecord,
} from '../repository';

/**
 * Supported History sort modes rendered in the sort menu.
 */
export const SORT_OPTIONS = Object.freeze([
  { key: 'newest', label: 'Newest first', shortLabel: 'Newest', icon: 'sort-calendar-descending' },
  { key: 'oldest', label: 'Oldest first', shortLabel: 'Oldest', icon: 'sort-calendar-ascending' },
  { key: 'most_steps', label: 'Most steps', shortLabel: 'Most steps', icon: 'walk' },
  { key: 'most_water', label: 'Most water', shortLabel: 'Most water', icon: 'water' },
]);

const VALID_SORT_KEYS = new Set(SORT_OPTIONS.map((opt) => opt.key));

/**
 * Normalizes legacy ('desc'/'asc') and current sort option keys.
 * @param {string} sortKey
 * @returns {'newest'|'oldest'|'most_steps'|'most_water'}
 */
export function normalizeSortOrder(sortKey) {
  if (sortKey === 'asc') return 'oldest';
  if (sortKey === 'desc') return 'newest';
  return VALID_SORT_KEYS.has(sortKey) ? sortKey : 'newest';
}

/**
 * Validates a From / To date range ensuring valid local dates, not in the future,
 * and `startDate <= endDate`.
 *
 * @param {string} startDate Lower-bound ISO date (YYYY-MM-DD).
 * @param {string} endDate Upper-bound ISO date (YYYY-MM-DD).
 * @returns {{ valid: boolean, error: string | null }} Validation result.
 */
export function validateDateRange(startDate, endDate) {
  if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
    return {
      valid: false,
      error: 'Please select valid From and To calendar dates.',
    };
  }
  if (isFutureDate(startDate) || isFutureDate(endDate)) {
    return {
      valid: false,
      error: 'Date range cannot extend into the future.',
    };
  }
  if (startDate > endDate) {
    return {
      valid: false,
      error: 'From date must be on or before To date.',
    };
  }
  return { valid: true, error: null };
}

/**
 * Empty metric totals baseline.
 */
const ZERO_TOTALS = Object.freeze({ steps: 0, calories: 0, water: 0 });

/**
 * Zustand store hook for the health records feature.
 */
export const useRecordsStore = create((set, get) => ({
  /** @type {Array<{ id: number, date: string, steps: number, calories: number, water: number }>} */
  records: [],

  /** @type {boolean} */
  isLoading: false,

  /** @type {string|null} */
  error: null,

  /** @type {string|null} Specific calendar date filter (YYYY-MM-DD), or null */
  searchDate: null,

  /** @type {string|null} Range start filter (YYYY-MM-DD), or null */
  rangeStart: null,

  /** @type {string|null} Range end filter (YYYY-MM-DD), or null */
  rangeEnd: null,

  /** @type {'newest'|'oldest'|'most_steps'|'most_water'} Sorting mode */
  sortOrder: 'newest',

  /** @type {boolean} True while generating and sharing a CSV export */
  isExporting: false,

  /** @type {{ steps: number, calories: number, water: number }} Aggregated totals for today */
  todayTotals: { ...ZERO_TOTALS },

  /** @type {{ steps: number, calories: number, water: number }} Aggregated totals for yesterday */
  yesterdayTotals: { ...ZERO_TOTALS },

  /** @type {'idle'|'saving'|'success'|'error'} Status of the most recent save operation */
  lastSaveStatus: 'idle',

  /**
   * Loads health records from SQLite based on current active filters.
   * If searchDate is set, queries by date. If rangeStart & rangeEnd are set,
   * queries by range. Otherwise fetches all records.
   *
   * @returns {Promise<void>}
   */
  loadRecords: async () => {
    set({ isLoading: true, error: null });
    const { searchDate, rangeStart, rangeEnd } = get();

    try {
      let rows;
      if (searchDate) {
        rows = await getRecordsByDate(searchDate);
      } else if (rangeStart && rangeEnd) {
        rows = await getRecordsBetween(rangeStart, rangeEnd);
      } else {
        rows = await getAllRecords();
      }

      set({ records: rows, isLoading: false });
    } catch (err) {
      set({
        error: err?.message || 'Failed to load records from the database.',
        isLoading: false,
      });
    }
  },

  /**
   * Adds a new health record after passing validation.
   * Protects against duplicate rapid submits.
   *
   * @param {object} input Raw form input (date, steps, calories, water).
   * @returns {Promise<{ success: boolean, errors: object|null, record?: object }>}
   */
  addRecord: async (input) => {
    if (get().lastSaveStatus === 'saving') {
      return {
        success: false,
        errors: { form: 'A save operation is currently in progress. Please wait.' },
      };
    }

    set({ lastSaveStatus: 'saving', error: null });

    const validation = validateRecord(input);
    if (!validation.valid) {
      set({ lastSaveStatus: 'error' });
      return { success: false, errors: validation.errors };
    }

    try {
      const domainRecord = toHealthRecord(input);
      const created = await createRecord(domainRecord);

      set({ lastSaveStatus: 'success' });
      await Promise.all([get().loadRecords(), get().loadTodayTotals()]);

      return { success: true, errors: null, record: created };
    } catch (err) {
      const errorMsg = err?.message || 'Failed to save health record.';
      set({ lastSaveStatus: 'error', error: errorMsg });
      return { success: false, errors: { form: errorMsg } };
    } finally {
      // Allow UI save status listeners to observe completion before returning to idle
      setTimeout(() => {
        if (get().lastSaveStatus === 'success' || get().lastSaveStatus === 'error') {
          set({ lastSaveStatus: 'idle' });
        }
      }, 1000);
    }
  },

  /**
   * Updates an existing health record after passing validation.
   * Protects against duplicate rapid submits.
   *
   * @param {object} input Raw form input including record `id`.
   * @returns {Promise<{ success: boolean, errors: object|null, record?: object }>}
   */
  editRecord: async (input) => {
    if (get().lastSaveStatus === 'saving') {
      return {
        success: false,
        errors: { form: 'A save operation is currently in progress. Please wait.' },
      };
    }

    if (!input?.id) {
      return {
        success: false,
        errors: { form: 'Missing record ID for update.' },
      };
    }

    set({ lastSaveStatus: 'saving', error: null });

    const validation = validateRecord(input);
    if (!validation.valid) {
      set({ lastSaveStatus: 'error' });
      return { success: false, errors: validation.errors };
    }

    try {
      const domainRecord = toHealthRecord(input, input.id);
      const updated = await updateRecord(domainRecord);

      set({ lastSaveStatus: 'success' });
      await Promise.all([get().loadRecords(), get().loadTodayTotals()]);

      return { success: true, errors: null, record: updated };
    } catch (err) {
      const errorMsg = err?.message || 'Failed to update health record.';
      set({ lastSaveStatus: 'error', error: errorMsg });
      return { success: false, errors: { form: errorMsg } };
    } finally {
      setTimeout(() => {
        if (get().lastSaveStatus === 'success' || get().lastSaveStatus === 'error') {
          set({ lastSaveStatus: 'idle' });
        }
      }, 1000);
    }
  },

  /**
   * Deletes a record by ID and refreshes state.
   *
   * @param {number} id Record primary key.
   * @returns {Promise<{ success: boolean }>}
   */
  removeRecord: async (id) => {
    set({ error: null });
    try {
      const success = await deleteRecord(id);
      if (success) {
        await Promise.all([get().loadRecords(), get().loadTodayTotals()]);
      }
      return { success };
    } catch (err) {
      const errorMsg = err?.message || 'Failed to delete record.';
      set({ error: errorMsg });
      return { success: false };
    }
  },

  /**
   * Sets single date search filter and reloads records.
   *
   * @param {string} date YYYY-MM-DD date string.
   * @returns {Promise<void>}
   */
  setSearchDate: async (date) => {
    set({ searchDate: date, rangeStart: null, rangeEnd: null });
    await get().loadRecords();
  },

  /**
   * Validates and sets date range filter [start, end] and reloads records.
   *
   * @param {string} start YYYY-MM-DD start date.
   * @param {string} end YYYY-MM-DD end date.
   * @returns {Promise<{ success: boolean, error: string | null }>}
   */
  setDateRange: async (start, end) => {
    const validation = validateDateRange(start, end);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    set({ rangeStart: start, rangeEnd: end, searchDate: null });
    await get().loadRecords();
    return { success: true, error: null };
  },

  /**
   * Clears active date filters and loads all records.
   *
   * @returns {Promise<void>}
   */
  clearSearch: async () => {
    set({ searchDate: null, rangeStart: null, rangeEnd: null });
    await get().loadRecords();
  },

  /**
   * Updates the active sorting mode.
   *
   * @param {'newest'|'oldest'|'most_steps'|'most_water'|'desc'|'asc'} order Sort option key.
   */
  setSortOrder: (order) => {
    set({ sortOrder: normalizeSortOrder(order) });
  },

  /**
   * Generates a CSV of the currently displayed (filtered and sorted) records,
   * saves it to cache (or triggers download on web), and opens the system share sheet.
   *
   * @returns {Promise<{ success: boolean, empty?: boolean, count?: number, message?: string }>}
   */
  exportCsv: async () => {
    if (get().isExporting) {
      return { success: false, message: 'Export is already in progress.' };
    }

    const visibleRecords = selectFilteredRecords(get());
    if (visibleRecords.length === 0) {
      return {
        success: false,
        empty: true,
        message: 'Nothing to export. Adjust your filters or add an entry first.',
      };
    }

    set({ isExporting: true });
    try {
      const csvContent = recordsToCsv(visibleRecords);
      const filename = `healthmate-records-${today()}.csv`;

      if (Platform.OS === 'web') {
        if (typeof document !== 'undefined' && typeof Blob !== 'undefined') {
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return { success: true, count: visibleRecords.length };
        }
        return {
          success: false,
          message: 'CSV download is unavailable in this browser environment.',
        };
      }

      const cacheFile = new File(Paths.cache, filename);
      cacheFile.create({ intermediates: true, overwrite: true });
      await cacheFile.write(csvContent);

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        return {
          success: false,
          message: 'Sharing is not available on this device.',
        };
      }

      await Sharing.shareAsync(cacheFile.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export HealthMate Records',
        UTI: 'public.comma-separated-values-text',
      });

      return { success: true, count: visibleRecords.length };
    } catch (err) {
      return {
        success: false,
        message: err?.message || 'Could not export CSV. Please try again.',
      };
    } finally {
      set({ isExporting: false });
    }
  },

  /**
   * Loads aggregated sums of steps, calories, and water for today and yesterday.
   *
   * @returns {Promise<void>}
   */
  loadTodayTotals: async () => {
    try {
      const [yesterdayStr, todayStr] = getLastNDates(2);
      const [todayTotals, yesterdayTotals] = await Promise.all([
        getTotalsForDate(todayStr),
        getTotalsForDate(yesterdayStr),
      ]);
      set({ todayTotals, yesterdayTotals });
    } catch {
      // Non-fatal: keep existing totals if background calculation fails
    }
  },

  /**
   * Retrieves a record for editing, checking local cache first then falling back to SQLite.
   *
   * @param {number} id Record primary key.
   * @returns {Promise<{ id: number, date: string, steps: number, calories: number, water: number }|null>}
   */
  getRecordForEdit: async (id) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return null;
    }

    const cached = get().records.find((r) => r.id === numericId);
    if (cached) {
      return cached;
    }
    return await getRecordById(numericId);
  },
}));

/**
 * Compares two records chronologically (newest or oldest first), breaking ties by ID.
 * @param {object} a
 * @param {object} b
 * @param {boolean} ascending
 * @returns {number}
 */
function compareByDate(a, b, ascending) {
  if (a.date !== b.date) {
    return ascending
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date);
  }
  return ascending ? a.id - b.id : b.id - a.id;
}

/**
 * Selector that filters records by active `searchDate` (or `rangeStart`/`rangeEnd`)
 * and returns them ordered according to `sortOrder`.
 *
 * @param {object} state Store state (or derived slice `{ records, searchDate, rangeStart, rangeEnd, sortOrder }`).
 * @returns {Array<object>} Filtered and sorted records array.
 */
export function selectFilteredRecords(state) {
  const { records, searchDate, rangeStart, rangeEnd, sortOrder } = state;
  if (!records || records.length === 0) return [];

  const filtered = records.filter((item) => {
    if (searchDate) {
      return item.date === searchDate;
    }
    if (rangeStart && rangeEnd) {
      return item.date >= rangeStart && item.date <= rangeEnd;
    }
    return true;
  });

  const normalizedSort = normalizeSortOrder(sortOrder);
  return [...filtered].sort((a, b) => {
    if (normalizedSort === 'oldest') {
      return compareByDate(a, b, true);
    }
    if (normalizedSort === 'most_steps') {
      if (b.steps !== a.steps) return b.steps - a.steps;
      return compareByDate(a, b, false);
    }
    if (normalizedSort === 'most_water') {
      if (b.water !== a.water) return b.water - a.water;
      return compareByDate(a, b, false);
    }
    return compareByDate(a, b, false);
  });
}
