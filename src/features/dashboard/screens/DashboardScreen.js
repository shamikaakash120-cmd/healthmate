/**
 * @layer Presentation (Dashboard Screen)
 * @responsibility Pure UI screen rendering today's greeting, Hero ProgressRings card,
 *                daily MetricCards with neutral "vs yesterday" comparisons,
 *                This Week streak + animated bar chart, pull-to-refresh,
 *                focus-triggered refresh, and add-entry FAB.
 */
import React, { useCallback } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  AppText,
  ErrorState,
  FloatingActionButton,
  LoadingState,
  MetricCard,
  ScreenContainer,
} from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { safePush } from '../../../core/utils/navigation';
import {
  HeroProgressCard,
  StreakBannerCard,
  WeeklySummaryCard,
} from '../components';
import { useDashboardViewModel } from '../viewmodel';

/**
 * Main Dashboard (Home) screen.
 * Strictly presentation-only: all progress and messaging logic resides in `useDashboardViewModel`.
 *
 * @returns {React.JSX.Element} Dashboard screen interface.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const {
    greeting,
    displayDate,
    todayEntryCount,
    hasEntriesToday,
    metrics,
    overallPercent,
    encouragement,
    weeklySummary,
    streak,
    onSelectWeeklyMetric,
    isInitialLoading,
    isRefreshing,
    error,
    loadOnFocus,
    onRefresh,
    retry,
  } = useDashboardViewModel();

  // Refresh dashboard summary whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadOnFocus();
    }, [loadOnFocus])
  );

  const handleOpenAddForm = useCallback(() => {
    safePush(router, '/record-form');
  }, [router]);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (isInitialLoading) {
    return (
        <ScreenContainer padded={false} edges={['top', 'left', 'right']}>
          <LoadingState label="Loading your daily summary…" />
        </ScreenContainer>
        );
  }

        // ── Error State ────────────────────────────────────────────────────────────
        if (error) {
    return (
          <ScreenContainer padded={false} edges={['top', 'left', 'right']}>
            <ErrorState message={error} onRetry={retry} />
          </ScreenContainer>
          );
  }

          const entryCountLabel =
          todayEntryCount === 1 ? '1 entry today' : `${todayEntryCount} entries today`;

          return (
          <View style={[styles.root, { backgroundColor: colors.background }]}>
            <ScreenContainer
              scroll
              padded
              edges={['top', 'left', 'right']}
              contentContainerStyle={{ paddingBottom: spacing.xxxl * 2 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
            >
              {/* ── Header: Date & Time-Based Greeting ── */}
                <View
                  style={[
                    styles.headerRow,
                    { paddingTop: spacing.sm, gap: spacing.sm, marginBottom: spacing.lg },
                  ]}
                >
                  <View style={styles.headerTextCol}>
                    <AppText
                      variant="caption"
                      color="textMuted"
                      accessibilityLabel={`Today is ${displayDate}`}
                    >
                      {displayDate}
                    </AppText>
                      <AppText
                        variant="title"
                        bold
                        accessibilityRole="header"
                        style={{ marginTop: 2 }}
                      >
                        {greeting}
                      </AppText>
                  </View>

                  {hasEntriesToday && (
                    <View
                      style={[
                        styles.entryPill,
                        {
                          backgroundColor: colors.surfaceAlt,
                          borderRadius: radius.pill,
                          paddingHorizontal: spacing.sm + spacing.xs,
                          paddingVertical: spacing.xs,
                        },
                      ]}
                      accessible
                      accessibilityLabel={entryCountLabel}
                    >
                      <AppText variant="caption" color="textMuted">
                        {entryCountLabel}
                      </AppText>
                    </View>
                  )}
                </View>

                {/* ── Hero Card: Progress Rings + Encouraging Message ── */}
                <HeroProgressCard
                  metrics={metrics}
                  overallPercent={overallPercent}
                  encouragement={encouragement}
                  hasEntriesToday={hasEntriesToday}
                  onLogPress={handleOpenAddForm}
                />

                {/* ── Daily Totals Section Header ── */}
                    <View style={[styles.sectionHeaderRow, { gap: spacing.sm, marginBottom: spacing.sm }]}>
                      <AppText variant="heading" bold accessibilityRole="header">
                        Today's Totals
                      </AppText>
                      <AppText variant="caption" color="textMuted">
                        vs yesterday
                      </AppText>
                    </View>

                    {/* ── Three Stacked Metric Cards ── */}
                    <View style={[styles.metricsStack, { marginBottom: spacing.lg }]}>
                      {metrics.map((item) => (
                        <MetricCard
                          key={item.key}
                          metricKey={item.key}
                          value={item.todayValue}
                          layout="horizontal"
                          comparison={item.comparison}
                          style={{ marginBottom: spacing.sm }}
                        />
                      ))}
                    </View>

                        {/* ── This Week Section: Streak & Animated Bar Chart ── */}
                        <View style={[styles.sectionHeaderRow, { gap: spacing.sm, marginBottom: spacing.sm }]}>
                          <AppText variant="heading" bold accessibilityRole="header">
                            This week
                          </AppText>
                          <AppText variant="caption" color="textMuted">
                            Last 7 days
                          </AppText>
                        </View>

                        <StreakBannerCard streak={streak} />
                        <WeeklySummaryCard
                          weeklySummary={weeklySummary}
                          onSelectMetric={onSelectWeeklyMetric}
                        />
                    </ScreenContainer>

                {/* ── Fixed Bottom-Right Floating Action Button ── */}
                <FloatingActionButton
                  iconName="plus"
                  onPress={handleOpenAddForm}
                  accessibilityLabel="Add new health entry"
                />
              </View>
              );
}

              const styles = StyleSheet.create({
                root: {
                flex: 1,
  },
              headerRow: {
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
  },
              headerTextCol: {
                flex: 1,
              minWidth: 160,
  },
              entryPill: {
                alignSelf: 'center',
  },
              sectionHeaderRow: {
                flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
  },
              metricsStack: {
                width: '100%',
  },
});
