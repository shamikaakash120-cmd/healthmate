/**
 * @layer ViewModel (Settings)
 * @responsibility Zustand store managing daily metric goals and theme mode preference,
 *                synced with SQLite via settingsRepository and global theme state.
 *
 * RULES APPLIED:
 *   - No raw SQL queries here; all persistence delegates to settingsRepository.
 *   - No UI code here.
 *   - Updates app-wide theme override immediately when themeMode loads or changes.
 */
import { create } from 'zustand';
import { seedDatabase } from '../../../core/database/seed';
import { useThemeStore } from '../../../core/theme';
import {
  DEFAULT_GOALS,
  DEFAULT_THEME_MODE,
  GOAL_SETTING_KEY_MAP,
  SETTING_KEYS,
  THEME_MODES,
  parseStoredGoals,
  parseStoredThemeMode,
  toGoalsPayload,
  validateDailyGoals,
} from '../model';
import {
  getAllSettings,
  setSetting,
  setSettingsBatch,
} from '../repository';

let latestThemeRequestId = 0;

/**
 * Zustand store hook managing persisted daily goals and app theme preference.
 */
export const useSettingsStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  /** @type {{ steps: number, calories: number, water: number }} */
  dailyGoals: { ...DEFAULT_GOALS },

  /** @type {'system'|'light'|'dark'} */
  themeMode: DEFAULT_THEME_MODE,

  /** @type {boolean} */
  isLoading: false,

  /** @type {boolean} */
  isSavingGoals: false,

  /** @type {boolean} */
  isSeeding: false,

  /** @type {boolean} */
  hasLoaded: false,

  /** @type {string | null} */
  error: null,

  // ─── Actions ────────────────────────────────────────────────────────────────

  /**
   * Loads all persisted settings from SQLite and applies theme + goals state.
   * Called once during startup before rendering main screens.
   *
   * @returns {Promise<{ dailyGoals: { steps: number, calories: number, water: number }, themeMode: 'system'|'light'|'dark' }>}
   */
  loadSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      const settingsMap = await getAllSettings();
      const dailyGoals = parseStoredGoals(settingsMap);
      const themeMode = parseStoredThemeMode(settingsMap);

      useThemeStore.getState().setThemeMode(themeMode);
      set({
        dailyGoals,
        themeMode,
        hasLoaded: true,
        isLoading: false,
        error: null,
      });

      return { dailyGoals, themeMode };
    } catch (err) {
      set({
        isLoading: false,
        error: err?.message || 'Could not load saved settings.',
      });
      return {
        dailyGoals: get().dailyGoals,
        themeMode: get().themeMode,
      };
    }
  },

  /**
   * Validates and persists updated daily goals for steps, calories, and water.
   *
   * @param {{ steps: unknown, calories: unknown, water: unknown }} input Raw goal input values.
   * @returns {Promise<{ success: boolean, errors: object | null, dailyGoals?: { steps: number, calories: number, water: number } }>}
   */
  saveDailyGoals: async (input) => {
    if (get().isSavingGoals) {
      return {
        success: false,
        errors: { form: 'Saving in progress. Please wait a moment.' },
      };
    }

    const validation = validateDailyGoals(input);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const nextGoals = toGoalsPayload(input);
    set({ isSavingGoals: true, error: null });

    try {
      await setSettingsBatch([
        [GOAL_SETTING_KEY_MAP.steps, nextGoals.steps],
        [GOAL_SETTING_KEY_MAP.calories, nextGoals.calories],
        [GOAL_SETTING_KEY_MAP.water, nextGoals.water],
      ]);

      set({
        dailyGoals: nextGoals,
        isSavingGoals: false,
        hasLoaded: true,
        error: null,
      });

      return { success: true, errors: null, dailyGoals: nextGoals };
    } catch (err) {
      const message = err?.message || 'Failed to save your daily goals.';
      set({ isSavingGoals: false, error: message });
      return { success: false, errors: { form: message } };
    }
  },

  /**
   * Restores daily goals back to default targets (`10,000` steps, `500` kcal, `2,000` ml).
   *
   * @returns {Promise<{ success: boolean, errors: object | null, dailyGoals?: { steps: number, calories: number, water: number } }>}
   */
  resetDailyGoals: async () => {
    return get().saveDailyGoals(DEFAULT_GOALS);
  },

  /**
   * Applies a theme mode override app-wide immediately and persists it in SQLite.
   * Rolls back if persistence fails so UI and stored state never diverge.
   *
   * @param {'system'|'light'|'dark'} mode Selected theme mode.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  setThemeMode: async (mode) => {
    if (!THEME_MODES.includes(mode)) {
      return { success: false, error: `Unsupported theme mode "${mode}".` };
    }

    const requestId = ++latestThemeRequestId;
    const previousMode = get().themeMode;
    set({ themeMode: mode, error: null });
    useThemeStore.getState().setThemeMode(mode);

    try {
      await setSetting(SETTING_KEYS.themeMode, mode);
      return { success: true };
    } catch (err) {
      const message = err?.message || 'Failed to save theme preference.';
      if (requestId === latestThemeRequestId) {
        set({ themeMode: previousMode, error: message });
        useThemeStore.getState().setThemeMode(previousMode);
      }
      return { success: false, error: message };
    }
  },

  /**
   * Appends realistic 10-day sample records to SQLite cleanly through the ViewModel.
   * Guarded against rapid double-taps.
   *
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  reseedSampleData: async () => {
    if (get().isSeeding) {
      return { success: false, error: 'Sample data seeding is already in progress.' };
    }

    set({ isSeeding: true, error: null });
    try {
      await seedDatabase(true);
      set({ isSeeding: false });
      return { success: true };
    } catch (err) {
      const message = err?.message || 'Failed to add sample records.';
      set({ isSeeding: false, error: message });
      return { success: false, error: message };
    }
  },
}));
