/**
 * @layer ViewModel (Dashboard)
 * @responsibility Zustand store and React ViewModel hook deriving daily progress,
 *                yesterday comparisons, encouraging messages, and refresh/loading states.
 *
 * RULES APPLIED:
 *   - No SQL queries here; all persistence reads go through recordRepository.
 *   - No UI/JSX code here; DashboardScreen strictly renders derived ViewModel state.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { create } from 'zustand';
import { METRICS, METRIC_KEYS } from '../../../core/theme';
import { formatDisplayDate, getLastNDates, today } from '../../../core/utils/dateUtils';
import {
  calcProgressPercent,
  formatNumber,
  greetingForTime,
} from '../../../core/utils/formatters';
import { getRecordsByDate, getTotalsForDate } from '../../records/repository';
import { useRecordsStore } from '../../records/viewmodel';

const ZERO_TOTALS = Object.freeze({ steps: 0, calories: 0, water: 0 });

// ─── Pure Derivation Helpers ──────────────────────────────────────────────────

/**
 * Derives a calm, judgment-free "vs yesterday" comparison object for one metric.
 *
 * @param {number} todayValue Today's aggregated total.
 * @param {number} yesterdayValue Yesterday's aggregated total.
 * @param {string} unit Unit label (e.g. 'steps', 'kcal', 'ml').
 * @returns {{
 *   direction: 'up'|'down'|'flat'|'none',
 *   diff: number,
 *   label: string,
 *   iconName: string,
 *   a11yText: string
 * }}
 */
export function deriveMetricComparison(todayValue, yesterdayValue, unit) {
  const current = Number(todayValue) || 0;
  const previous = Number(yesterdayValue) || 0;
  const diff = current - previous;
  const absFormatted = formatNumber(Math.abs(diff));

  if (current === 0 && previous === 0) {
    return {
      direction: 'none',
      diff: 0,
      label: 'No entries yet',
      iconName: 'minus',
      a11yText: 'no entries today or yesterday',
    };
  }

  if (diff > 0) {
    return {
      direction: 'up',
      diff,
      label: `${absFormatted} vs yesterday`,
      iconName: 'arrow-up',
      a11yText: `up ${absFormatted} ${unit} compared to yesterday`,
    };
  }

  if (diff < 0) {
    return {
      direction: 'down',
      diff,
      label: `${absFormatted} vs yesterday`,
      iconName: 'arrow-down',
      a11yText: `${absFormatted} ${unit} less than yesterday`,
    };
  }

  return {
    direction: 'flat',
    diff: 0,
    label: 'Same as yesterday',
    iconName: 'minus',
    a11yText: 'same as yesterday',
  };
}

/**
 * Derives per-metric progress against default goals from `METRICS` and computes
 * overall completion statistics.
 *
 * @param {{ steps: number, calories: number, water: number }} todayTotals
 * @param {{ steps: number, calories: number, water: number }} yesterdayTotals
 * @returns {{
 *   metrics: Array<{
 *     key: string,
 *     label: string,
 *     unit: string,
 *     todayValue: number,
 *     yesterdayValue: number,
 *     goal: number,
 *     progress: number,
 *     percent: number,
 *     goalMet: boolean,
 *     comparison: ReturnType<typeof deriveMetricComparison>
 *   }>,
 *   overallPercent: number,
 *   goalsMetCount: number,
 *   allGoalsMet: boolean
 * }}
 */
export function deriveDashboardMetrics(todayTotals = ZERO_TOTALS, yesterdayTotals = ZERO_TOTALS) {
  const metrics = METRIC_KEYS.map((key) => {
    const config = METRICS[key];
    const todayValue = Number(todayTotals?.[key]) || 0;
    const yesterdayValue = Number(yesterdayTotals?.[key]) || 0;
    const goal = config.defaultGoal;
    const progress = goal > 0 ? Math.min(todayValue / goal, 1) : 0;
    const percent = calcProgressPercent(todayValue, goal);
    const goalMet = goal > 0 && todayValue >= goal;

    return {
      key,
      label: config.label,
      unit: config.unit,
      todayValue,
      yesterdayValue,
      goal,
      progress,
      percent,
      goalMet,
      comparison: deriveMetricComparison(todayValue, yesterdayValue, config.unit),
    };
  });

  const totalRatio = metrics.reduce((sum, item) => sum + item.progress, 0);
  const overallPercent = metrics.length > 0 ? Math.round((totalRatio / metrics.length) * 100) : 0;
  const goalsMetCount = metrics.filter((item) => item.goalMet).length;
  const allGoalsMet = metrics.length > 0 && goalsMetCount === metrics.length;

  return {
    metrics,
    overallPercent,
    goalsMetCount,
    allGoalsMet,
  };
}

/**
 * Selects a supportive, calm encouraging message matched to current daily progress.
 *
 * @param {object} params
 * @param {number} params.overallPercent Overall completion percentage (0–100).
 * @param {boolean} params.allGoalsMet Whether every metric met its daily goal.
 * @param {boolean} params.hasEntriesToday Whether at least one entry exists today.
 * @returns {{
 *   message: string,
 *   subtext: string,
 *   iconName: string,
 *   tone: 'neutral'|'primary'|'success'
 * }}
 */
export function deriveEncouragementMessage({ overallPercent, allGoalsMet, hasEntriesToday }) {
  if (!hasEntriesToday) {
    return {
      message: 'Ready when you are. Log your first entry.',
      subtext: 'Tap + to add steps, active calories, or hydration at your own pace.',
      iconName: 'sprout-outline',
      tone: 'neutral',
    };
  }

  if (allGoalsMet || overallPercent >= 100) {
    return {
      message: 'Goal reached. Lovely work!',
      subtext: 'You met all your daily goals today. Take a moment to rest and recharge.',
      iconName: 'check-decagram-outline',
      tone: 'success',
    };
  }

  if (overallPercent >= 80) {
    return {
      message: 'Almost there! Keep up the gentle pace.',
      subtext: `${overallPercent}% of your daily targets reached.`,
      iconName: 'weather-sunny',
      tone: 'primary',
    };
  }

  if (overallPercent >= 50) {
    return {
      message: "You're halfway there!",
      subtext: `${overallPercent}% toward today's daily goals.`,
      iconName: 'trending-up',
      tone: 'primary',
    };
  }

  if (overallPercent > 0) {
    return {
      message: 'Nice start! Every small effort counts.',
      subtext: `${overallPercent}% of your daily goals so far.`,
      iconName: 'leaf',
      tone: 'primary',
    };
  }

  return {
    message: 'Entry logged. Ready whenever you want to add more.',
    subtext: 'Every quiet habit builds steady momentum.',
    iconName: 'sprout-outline',
    tone: 'neutral',
  };
}

// ─── Zustand Store ────────────────────────────────────────────────────────────

/**
 * Zustand store managing dashboard async loading, pull-to-refresh, and aggregated totals.
 */
export const useDashboardStore = create((set) => ({
  todayTotals: { ...ZERO_TOTALS },
  yesterdayTotals: { ...ZERO_TOTALS },
  todayEntryCount: 0,
  todayDate: today(),
  greeting: greetingForTime(),
  isLoading: false,
  isRefreshing: false,
  hasLoaded: false,
  error: null,

  /**
   * Fetches today's and yesterday's aggregated totals plus today's entry count.
   *
   * @param {object} [options]
   * @param {boolean} [options.isRefresh=false] True when triggered via pull-to-refresh.
   * @param {boolean} [options.silent=false] True for seamless background refresh on tab focus.
   * @returns {Promise<void>}
   */
  loadDashboard: async ({ isRefresh = false, silent = false } = {}) => {
    if (isRefresh) {
      set({ isRefreshing: true, error: null });
    } else if (!silent) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const [yesterdayStr, todayStr] = getLastNDates(2);
      const [todayTotals, yesterdayTotals, todayRecords] = await Promise.all([
        getTotalsForDate(todayStr),
        getTotalsForDate(yesterdayStr),
        getRecordsByDate(todayStr),
      ]);

      set({
        todayTotals,
        yesterdayTotals,
        todayEntryCount: todayRecords.length,
        todayDate: todayStr,
        greeting: greetingForTime(),
        hasLoaded: true,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (err) {
      set({
        error: err?.message || 'Could not load your daily health summary.',
        isLoading: false,
        isRefreshing: false,
      });
    }
  },
}));

// ─── ViewModel Hook ───────────────────────────────────────────────────────────

/**
 * Presentation-ready ViewModel hook for DashboardScreen.
 * Supplies formatted header strings, derived ring/card metrics, encouragement copy,
 * and refresh/retry handlers so the screen contains pure rendering only.
 *
 * @returns {{
 *   greeting: string,
 *   displayDate: string,
 *   todayEntryCount: number,
 *   hasEntriesToday: boolean,
 *   metrics: ReturnType<typeof deriveDashboardMetrics>['metrics'],
 *   overallPercent: number,
 *   allGoalsMet: boolean,
 *   encouragement: ReturnType<typeof deriveEncouragementMessage>,
 *   isInitialLoading: boolean,
 *   isRefreshing: boolean,
 *   error: string|null,
 *   loadOnFocus: () => void,
 *   onRefresh: () => void,
 *   retry: () => void
 * }}
 */
export function useDashboardViewModel() {
  const todayTotals = useDashboardStore((state) => state.todayTotals);
  const yesterdayTotals = useDashboardStore((state) => state.yesterdayTotals);
  const todayEntryCount = useDashboardStore((state) => state.todayEntryCount);
  const todayDate = useDashboardStore((state) => state.todayDate);
  const greeting = useDashboardStore((state) => state.greeting);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const isRefreshing = useDashboardStore((state) => state.isRefreshing);
  const hasLoaded = useDashboardStore((state) => state.hasLoaded);
  const error = useDashboardStore((state) => state.error);
  const loadDashboard = useDashboardStore((state) => state.loadDashboard);

  // Stay synced if records are added/edited/seeded through useRecordsStore while mounted
  const recordsTodayTotals = useRecordsStore((state) => state.todayTotals);
  const isFirstTotalsSync = useRef(true);

  useEffect(() => {
    if (isFirstTotalsSync.current) {
      isFirstTotalsSync.current = false;
      return;
    }
    if (useDashboardStore.getState().hasLoaded) {
      loadDashboard({ silent: true });
    }
  }, [recordsTodayTotals, loadDashboard]);

  const loadOnFocus = useCallback(() => {
    const alreadyLoaded = useDashboardStore.getState().hasLoaded;
    loadDashboard({ silent: alreadyLoaded });
  }, [loadDashboard]);

  const onRefresh = useCallback(() => {
    loadDashboard({ isRefresh: true });
  }, [loadDashboard]);

  const retry = useCallback(() => {
    loadDashboard({ isRefresh: false, silent: false });
  }, [loadDashboard]);

  const derived = useMemo(
    () => deriveDashboardMetrics(todayTotals, yesterdayTotals),
    [todayTotals, yesterdayTotals]
  );

  const hasEntriesToday = todayEntryCount > 0;

  const encouragement = useMemo(
    () =>
      deriveEncouragementMessage({
        overallPercent: derived.overallPercent,
        allGoalsMet: derived.allGoalsMet,
        hasEntriesToday,
      }),
    [derived.overallPercent, derived.allGoalsMet, hasEntriesToday]
  );

  const displayDate = useMemo(() => formatDisplayDate(todayDate), [todayDate]);

  return {
    greeting,
    displayDate,
    todayEntryCount,
    hasEntriesToday,
    metrics: derived.metrics,
    overallPercent: derived.overallPercent,
    allGoalsMet: derived.allGoalsMet,
    encouragement,
    isInitialLoading: isLoading && !hasLoaded,
    isRefreshing,
    error,
    loadOnFocus,
    onRefresh,
    retry,
  };
}
