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
import {
  formatDisplayDate,
  getLastNDates,
  getWeekdayInitial,
  getWeekdayShort,
  isValidISODate,
  shiftISODate,
  today,
} from '../../../core/utils/dateUtils';
import {
  calcProgressPercent,
  formatCompact,
  formatNumber,
  greetingForTime,
} from '../../../core/utils/formatters';
import {
  getDistinctRecordDates,
  getRecordsByDate,
  getTotalsBetween,
  getTotalsForDate,
} from '../../records/repository';
import { useRecordsStore } from '../../records/viewmodel';
import { DEFAULT_GOALS } from '../../settings/model';
import { useSettingsStore } from '../../settings/viewmodel';

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
 * Derives per-metric progress against saved daily goals (falling back to `METRICS`
 * defaults) and computes overall completion statistics.
 *
 * @param {{ steps: number, calories: number, water: number }} todayTotals
 * @param {{ steps: number, calories: number, water: number }} yesterdayTotals
 * @param {{ steps: number, calories: number, water: number }} [dailyGoals=DEFAULT_GOALS]
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
export function deriveDashboardMetrics(
  todayTotals = ZERO_TOTALS,
  yesterdayTotals = ZERO_TOTALS,
  dailyGoals = DEFAULT_GOALS
) {
  const metrics = METRIC_KEYS.map((key) => {
    const config = METRICS[key];
    const todayValue = Number(todayTotals?.[key]) || 0;
    const yesterdayValue = Number(yesterdayTotals?.[key]) || 0;
    const savedGoal = Number(dailyGoals?.[key]);
    const goal = Number.isFinite(savedGoal) && savedGoal > 0 ? savedGoal : config.defaultGoal;
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

/**
 * Computes 7-day weekly totals, daily averages (across the 7-day window), and
 * normalized bar chart items for the selected metric. Handles empty weeks gracefully.
 *
 * @param {string[]} weeklyDates Ordered 7 calendar dates ending at today (YYYY-MM-DD).
 * @param {Array<{ date: string, steps: number, calories: number, water: number }>} weeklyRows Rows from `getTotalsBetween`.
 * @param {'steps'|'calories'|'water'} [selectedMetric='steps'] Selected metric tab.
 * @returns {{
 *   selectedMetric: 'steps'|'calories'|'water',
 *   tabs: Array<{ key: string, label: string, icon: string, colorKey: string, tintKey: string }>,
 *   summaries: Array<{
 *     key: string,
 *     label: string,
 *     unit: string,
 *     icon: string,
 *     colorKey: string,
 *     tintKey: string,
 *     total: number,
 *     dailyAverage: number,
 *     maxDayValue: number
 *   }>,
 *   activeSummary: {
 *     key: string,
 *     label: string,
 *     unit: string,
 *     icon: string,
 *     colorKey: string,
 *     tintKey: string,
 *     total: number,
 *     dailyAverage: number,
 *     maxDayValue: number
 *   },
 *   bars: Array<{
 *     date: string,
 *     dayInitial: string,
 *     weekdayShort: string,
 *     isToday: boolean,
 *     value: number,
 *     compactValue: string,
 *     ratio: number
 *   }>,
 *   hasData: boolean,
 *   hasMetricData: boolean,
 *   activeDaysCount: number
 * }}
 */
export function deriveWeeklySummary(
  weeklyDates = [],
  weeklyRows = [],
  selectedMetric = 'steps'
) {
  const dates = weeklyDates.length === 7 ? weeklyDates : getLastNDates(7);
  const todayStr = dates[dates.length - 1];
  const rowByDate = new Map((weeklyRows || []).map((row) => [row.date, row]));

  const metricStats = {};
  for (const key of METRIC_KEYS) {
    const config = METRICS[key];
    let total = 0;
    let maxDayValue = 0;

    for (const date of dates) {
      const value = Number(rowByDate.get(date)?.[key]) || 0;
      total += value;
      if (value > maxDayValue) {
        maxDayValue = value;
      }
    }

    metricStats[key] = {
      key,
      label: config.label,
      unit: config.unit,
      icon: config.icon,
      colorKey: config.colorKey,
      tintKey: config.tintKey,
      total,
      dailyAverage: Math.round(total / dates.length),
      maxDayValue,
    };
  }

  const activeMetricKey = METRICS[selectedMetric] ? selectedMetric : 'steps';
  const activeSummary = metricStats[activeMetricKey];
  const maxDayValue = activeSummary.maxDayValue;

    const bars = dates.map((iso) => {
      const value = Number(rowByDate.get(iso)?.[activeMetricKey]) || 0;
      const ratio = maxDayValue > 0 ? value / maxDayValue : 0;

        return {
          date: iso,
          dayInitial: getWeekdayInitial(iso),
          weekdayShort: getWeekdayShort(iso),
          isToday: iso === todayStr,
          value,
          compactValue: value > 0 ? formatCompact(value) : '',
          ratio,
        };
      });

      return {
        selectedMetric: activeMetricKey,
        tabs: METRIC_KEYS.map((key) => ({
          key,
          label: METRICS[key].label,
          icon: METRICS[key].icon,
          colorKey: METRICS[key].colorKey,
          tintKey: METRICS[key].tintKey,
        })),
        summaries: METRIC_KEYS.map((key) => metricStats[key]),
        activeSummary,
        bars,
        hasData: rowByDate.size > 0,
        hasMetricData: activeSummary.total > 0,
        activeDaysCount: rowByDate.size,
      };
    }

/**
 * Derives the consecutive-day logging streak and gentle encouraging copy.
 * Counts consecutive days with at least one logged record ending today, or ending
 * yesterday when today has not yet been logged.
 *
 * @param {string[]} distinctDatesDesc Distinct YYYY-MM-DD dates sorted descending.
 * @param {string} [todayStr=today()] Today's local calendar date (YYYY-MM-DD).
 * @returns {{
 *   count: number,
 *   loggedToday: boolean,
 *   message: string,
 *   subtext: string
 * }}
 */
export function deriveStreak(distinctDatesDesc = [], todayStr = today()) {
  if (!Array.isArray(distinctDatesDesc) || distinctDatesDesc.length === 0) {
    return {
      count: 0,
      loggedToday: false,
      message: 'Start a streak today.',
      subtext: 'Log any entry today to build a gentle daily habit.',
    };
  }

  const dateSet = new Set(
    distinctDatesDesc.filter((date) => isValidISODate(date) && date <= todayStr)
  );
  const loggedToday = dateSet.has(todayStr);
  const yesterdayStr = shiftISODate(todayStr, -1);

  let cursor = loggedToday ? todayStr : dateSet.has(yesterdayStr) ? yesterdayStr : null;
  let count = 0;

  while (cursor && dateSet.has(cursor)) {
    count += 1;
    cursor = shiftISODate(cursor, -1);
  }

  if (count === 0) {
    return {
      count: 0,
      loggedToday: false,
      message: 'Ready for a fresh streak.',
      subtext: 'Log an entry today to start a new consecutive streak.',
    };
  }

  if (!loggedToday) {
    return {
      count,
      loggedToday: false,
      message: `${count}-day streak. Log today to keep it up!`,
      subtext: 'You logged yesterday — add an entry today to extend your streak.',
    };
  }

  return {
    count,
    loggedToday: true,
    message: `${count}-day streak. Keep it up!`,
    subtext:
      count >= 7
        ? 'Over a full week of steady consistency.'
        : 'Consistency builds lasting wellness habits.',
  };
}

// ─── Zustand Store ────────────────────────────────────────────────────────────

/**
 * Zustand store managing dashboard async loading, pull-to-refresh, weekly stats, and aggregated totals.
 */
export const useDashboardStore = create((set) => ({
  todayTotals: { ...ZERO_TOTALS },
  yesterdayTotals: { ...ZERO_TOTALS },
  todayEntryCount: 0,
  todayDate: today(),
  weeklyDates: getLastNDates(7),
  weeklyRows: [],
  distinctRecordDates: [],
  selectedWeeklyMetric: 'steps',
  greeting: greetingForTime(),
  isLoading: false,
  isRefreshing: false,
  hasLoaded: false,
  error: null,

  /**
   * Selects which metric is displayed in the 7-day Weekly Summary bar chart.
   *
   * @param {'steps'|'calories'|'water'} metricKey Metric identifier.
   */
  setSelectedWeeklyMetric: (metricKey) => {
    set({ selectedWeeklyMetric: METRICS[metricKey] ? metricKey : 'steps' });
  },

  /**
   * Fetches today's and yesterday's aggregated totals, today's entry count,
   * 7-day aggregated daily totals via `getTotalsBetween`, and distinct record dates for streak.
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
      const weeklyDates = getLastNDates(7);
      const weekStartStr = weeklyDates[0];
      const yesterdayStr = weeklyDates[weeklyDates.length - 2];
      const todayStr = weeklyDates[weeklyDates.length - 1];

      const [
        todayTotals,
        yesterdayTotals,
        todayRecords,
        weeklyRows,
        distinctRecordDates,
      ] = await Promise.all([
        getTotalsForDate(todayStr),
        getTotalsForDate(yesterdayStr),
        getRecordsByDate(todayStr),
        getTotalsBetween(weekStartStr, todayStr),
        getDistinctRecordDates(todayStr),
      ]);

      set({
        todayTotals,
        yesterdayTotals,
        todayEntryCount: todayRecords.length,
        todayDate: todayStr,
        weeklyDates,
        weeklyRows,
        distinctRecordDates,
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
 * 7-day weekly summary data, streak counter, and refresh/retry handlers.
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
 *   weeklySummary: ReturnType<typeof deriveWeeklySummary>,
 *   streak: ReturnType<typeof deriveStreak>,
 *   onSelectWeeklyMetric: (metricKey: 'steps'|'calories'|'water') => void,
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
  const weeklyDates = useDashboardStore((state) => state.weeklyDates);
  const weeklyRows = useDashboardStore((state) => state.weeklyRows);
  const distinctRecordDates = useDashboardStore((state) => state.distinctRecordDates);
  const selectedWeeklyMetric = useDashboardStore((state) => state.selectedWeeklyMetric);
  const setSelectedWeeklyMetric = useDashboardStore((state) => state.setSelectedWeeklyMetric);
  const greeting = useDashboardStore((state) => state.greeting);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const isRefreshing = useDashboardStore((state) => state.isRefreshing);
  const hasLoaded = useDashboardStore((state) => state.hasLoaded);
  const error = useDashboardStore((state) => state.error);
  const loadDashboard = useDashboardStore((state) => state.loadDashboard);
  const dailyGoals = useSettingsStore((state) => state.dailyGoals);

  // Stay synced if records are added/edited/deleted/seeded through useRecordsStore while mounted
  const recordsTodayTotals = useRecordsStore((state) => state.todayTotals);
  const recordsList = useRecordsStore((state) => state.records);
  const isFirstRecordsSync = useRef(true);

  useEffect(() => {
    if (isFirstRecordsSync.current) {
      isFirstRecordsSync.current = false;
      return;
    }
    if (useDashboardStore.getState().hasLoaded) {
      loadDashboard({ silent: true });
    }
  }, [recordsTodayTotals, recordsList, loadDashboard]);

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
    () => deriveDashboardMetrics(todayTotals, yesterdayTotals, dailyGoals),
    [todayTotals, yesterdayTotals, dailyGoals]
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

  const weeklySummary = useMemo(
    () => deriveWeeklySummary(weeklyDates, weeklyRows, selectedWeeklyMetric),
    [weeklyDates, weeklyRows, selectedWeeklyMetric]
  );

const streak = useMemo(
  () => deriveStreak(distinctRecordDates, todayDate),
  [distinctRecordDates, todayDate]
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
  weeklySummary,
  streak,
  onSelectWeeklyMetric: setSelectedWeeklyMetric,
  isInitialLoading: isLoading && !hasLoaded,
  isRefreshing,
  error,
  loadOnFocus,
  onRefresh,
  retry,
};
}
