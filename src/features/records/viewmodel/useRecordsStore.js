/**
 * @layer ViewModel (Records)
 * @responsibility Zustand store managing records state, validation, search/filtering, and repository orchestration.
 *
 * RULES APPLIED:
 *   - No SQL queries (repositories are the ONLY place for SQL).
 *   - No UI code (screens/components render UI).
 *   - Validates using Model layer (`validateRecord`) and converts safely using `toHealthRecord()`.
 *   - Guard against duplicate rapid submits (concurrent calls ignored while a save is in progress).
 *   - Automatically refreshes records and daily totals after mutations.
 */
import { create } from 'zustand';
import { validateRecord, toHealthRecord } from '../model';
import {
  createRecord,
  getAllRecords,
  getRecordById,
  getRecordsByDate,
  getRecordsBetween,
  updateRecord,
  deleteRecord,
  getTotalsForDate,
} from '../repository';
import { getLastNDates } from '../../../core/utils/dateUtils';

/**
 * Empty metric totals baseline.
 */
const ZERO_TOTALS = Object.freeze({ steps: 0, calories: 0, water: 0 });

/**
 * Zustand store hook for the health records feature.
 */
export const useRecordsStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
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

  /** @type {'desc'|'asc'} Chronological sorting order */
  sortOrder: 'desc',

  /** @type {{ steps: number, calories: number, water: number }} Aggregated totals for today */
  todayTotals: { ...ZERO_TOTALS },

  /** @type {{ steps: number, calories: number, water: number }} Aggregated totals for yesterday */
  yesterdayTotals: { ...ZERO_TOTALS },

  /** @type {'idle'|'saving'|'success'|'error'} Status of the most recent save operation */
  lastSaveStatus: 'idle',

  // ─── Actions ────────────────────────────────────────────────────────────────

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
    // Guard against duplicate rapid submits
    if (get().lastSaveStatus === 'saving') {
      return {
        success: false,
        errors: { form: 'A save operation is currently in progress. Please wait.' },
      };
    }

    set({ lastSaveStatus: 'saving', error: null });

    // Validate with domain model
    const validation = validateRecord(input);
    if (!validation.valid) {
      set({ lastSaveStatus: 'error' });
      return { success: false, errors: validation.errors };
    }

    try {
      // Safe type conversion through model layer
      const domainRecord = toHealthRecord(input);

      // Persist via repository
      const created = await createRecord(domainRecord);

      set({ lastSaveStatus: 'success' });

      // Refresh records list and today's summary metrics
      await Promise.all([get().loadRecords(), get().loadTodayTotals()]);

      return { success: true, errors: null, record: created };
    } catch (err) {
      const errorMsg = err?.message || 'Failed to save health record.';
      set({ lastSaveStatus: 'error', error: errorMsg });
      return { success: false, errors: { form: errorMsg } };
    } finally {
      // Reset save status back to idle after a brief tick
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
    // Guard against duplicate rapid submits
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

    // Validate with domain model
    const validation = validateRecord(input);
    if (!validation.valid) {
      set({ lastSaveStatus: 'error' });
      return { success: false, errors: validation.errors };
    }

    try {
      // Safe type conversion through model layer
      const domainRecord = toHealthRecord(input, input.id);

      // Persist update via repository
      const updated = await updateRecord(domainRecord);

      set({ lastSaveStatus: 'success' });

      // Refresh records and totals
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
   * Sets date range filter [start, end] and reloads records.
   *
   * @param {string} start YYYY-MM-DD start date.
   * @param {string} end YYYY-MM-DD end date.
   * @returns {Promise<void>}
   */
  setDateRange: async (start, end) => {
    set({ rangeStart: start, rangeEnd: end, searchDate: null });
    await get().loadRecords();
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
   * Toggles or updates the chronological sorting order.
   *
   * @param {'desc'|'asc'} [order] Optional explicit sort order.
   */
  setSortOrder: (order) => {
    const nextOrder = order || (get().sortOrder === 'desc' ? 'asc' : 'desc');
    set({ sortOrder: nextOrder });
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
    } catch (err) {
      // Non-fatal: keep current totals if calculation encounters an issue
      console.warn('[useRecordsStore] loadTodayTotals failed:', err?.message);
    }
  },

  /**
   * Retrieves a record for editing, checking local cache first then falling back to SQLite.
   *
   * @param {number} id Record primary key.
   * @returns {Promise<{ id: number, date: string, steps: number, calories: number, water: number }|null>}
   */
  getRecordForEdit: async (id) => {
    const cached = get().records.find((r) => r.id === id);
    if (cached) {
      return cached;
    }
    return await getRecordById(id);
  },
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

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

  return [...filtered].sort((a, b) => {
    if (a.date !== b.date) {
      return sortOrder === 'asc'
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    }
    return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
  });
}
