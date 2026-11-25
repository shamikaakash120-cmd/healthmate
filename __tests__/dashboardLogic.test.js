/**
 * Unit tests for Dashboard pure derivation logic (`src/features/dashboard/viewmodel/useDashboardViewModel.js`).
 */
import {
  deriveDashboardMetrics,
  deriveEncouragementMessage,
  deriveMetricComparison,
  deriveStreak,
  deriveWeeklySummary,
} from '../src/features/dashboard/viewmodel/useDashboardViewModel';

describe('dashboard pure derivation logic', () => {
  test('derives zeroed metrics when no totals exist today or yesterday', () => {
    const derived = deriveDashboardMetrics(
      { steps: 0, calories: 0, water: 0 },
      { steps: 0, calories: 0, water: 0 }
    );

    expect(derived.overallPercent).toBe(0);
    expect(derived.goalsMetCount).toBe(0);
    expect(derived.allGoalsMet).toBe(false);
    expect(derived.metrics).toHaveLength(3);
    expect(derived.metrics[0].comparison).toEqual({
      direction: 'none',
      diff: 0,
      label: 'No entries yet',
      iconName: 'minus',
      a11yText: 'no entries today or yesterday',
    });
  });

  test('computes progress against custom saved daily goals and clamps at 100%', () => {
    const customGoals = { steps: 8000, calories: 400, water: 2000 };
    const derived = deriveDashboardMetrics(
      { steps: 12000, calories: 200, water: 2000 },
      { steps: 6000, calories: 300, water: 2000 },
      customGoals
    );

    const stepsMetric = derived.metrics.find((m) => m.key === 'steps');
    const caloriesMetric = derived.metrics.find((m) => m.key === 'calories');
    const waterMetric = derived.metrics.find((m) => m.key === 'water');

    expect(stepsMetric.goal).toBe(8000);
    expect(stepsMetric.progress).toBe(1);
    expect(stepsMetric.percent).toBe(100);
    expect(stepsMetric.goalMet).toBe(true);
    expect(stepsMetric.comparison.direction).toBe('up');

    expect(caloriesMetric.goal).toBe(400);
    expect(caloriesMetric.progress).toBe(0.5);
    expect(caloriesMetric.percent).toBe(50);
    expect(caloriesMetric.goalMet).toBe(false);
    expect(caloriesMetric.comparison.direction).toBe('down');

    expect(waterMetric.goalMet).toBe(true);
    expect(waterMetric.comparison.direction).toBe('flat');

    // Average of [1.0, 0.5, 1.0] = 2.5 / 3 => 83%
    expect(derived.overallPercent).toBe(83);
    expect(derived.goalsMetCount).toBe(2);
    expect(derived.allGoalsMet).toBe(false);
  });

  test('derives neutral comparison messages for up, down, flat, and empty', () => {
    expect(deriveMetricComparison(7000, 5000, 'steps')).toMatchObject({
      direction: 'up',
      diff: 2000,
      label: '2,000 vs yesterday',
    });
    expect(deriveMetricComparison(400, 500, 'kcal')).toMatchObject({
      direction: 'down',
      diff: -100,
      label: '100 vs yesterday',
    });
    expect(deriveMetricComparison(1500, 1500, 'ml')).toMatchObject({
      direction: 'flat',
      diff: 0,
      label: 'Same as yesterday',
    });
  });

  test('selects calm encouraging messages based on progress thresholds', () => {
    expect(
      deriveEncouragementMessage({
        overallPercent: 0,
        allGoalsMet: false,
        hasEntriesToday: false,
      })
    ).toMatchObject({
      message: 'Ready when you are. Log your first entry.',
      tone: 'neutral',
    });

    expect(
      deriveEncouragementMessage({
        overallPercent: 25,
        allGoalsMet: false,
        hasEntriesToday: true,
      })
    ).toMatchObject({
      message: 'Nice start! Every small effort counts.',
      tone: 'primary',
    });

    expect(
      deriveEncouragementMessage({
        overallPercent: 60,
        allGoalsMet: false,
        hasEntriesToday: true,
      })
    ).toMatchObject({
      message: "You're halfway there!",
      tone: 'primary',
    });

    expect(
      deriveEncouragementMessage({
        overallPercent: 85,
        allGoalsMet: false,
        hasEntriesToday: true,
      })
    ).toMatchObject({
      message: 'Almost there! Keep up the gentle pace.',
      tone: 'primary',
    });

    expect(
      deriveEncouragementMessage({
        overallPercent: 100,
        allGoalsMet: true,
        hasEntriesToday: true,
      })
    ).toMatchObject({
      message: 'Goal reached. Lovely work!',
      tone: 'success',
    });
  });

  test('derives 7-day weekly summary totals, daily averages, and handles empty weeks', () => {
    const weekDates = [
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
      '2026-08-15',
      '2026-08-16',
      '2026-08-17',
      '2026-08-18',
    ];

    const emptySummary = deriveWeeklySummary(weekDates, [], 'steps');
    expect(emptySummary.hasData).toBe(false);
    expect(emptySummary.hasMetricData).toBe(false);
    expect(emptySummary.activeSummary.total).toBe(0);
    expect(emptySummary.activeSummary.dailyAverage).toBe(0);
    expect(emptySummary.bars).toHaveLength(7);
    expect(emptySummary.bars[6].isToday).toBe(true);

    const populated = deriveWeeklySummary(
      weekDates,
      [
        { date: '2026-08-17', steps: 7000, calories: 350, water: 1400 },
        { date: '2026-08-18', steps: 14000, calories: 700, water: 2100 },
      ],
      'steps'
    );
    expect(populated.hasData).toBe(true);
    expect(populated.activeDaysCount).toBe(2);
    expect(populated.activeSummary.total).toBe(21000);
    expect(populated.activeSummary.dailyAverage).toBe(3000);
    expect(populated.bars[5].ratio).toBe(0.5);
    expect(populated.bars[6].ratio).toBe(1);
  });

  test('calculates consecutive streaks accurately across active and broken runs', () => {
    expect(deriveStreak([], '2026-08-18')).toMatchObject({
      count: 0,
      loggedToday: false,
    });

    expect(
      deriveStreak(['2026-08-18', '2026-08-17', '2026-08-16', '2026-08-14'], '2026-08-18')
    ).toMatchObject({
      count: 3,
      loggedToday: true,
      message: '3-day streak. Keep it up!',
    });

    // Logged yesterday and day before, not today yet
    expect(
      deriveStreak(['2026-08-17', '2026-08-16'], '2026-08-18')
    ).toMatchObject({
      count: 2,
      loggedToday: false,
    });

    // Last log 2 days ago -> streak reset to 0
    expect(
      deriveStreak(['2026-08-16', '2026-08-15'], '2026-08-18')
    ).toMatchObject({
      count: 0,
      loggedToday: false,
    });
  });
});
