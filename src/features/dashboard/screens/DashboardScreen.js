/**
 * @layer Presentation (Dashboard Screen)
 * @responsibility Pure UI screen rendering today's greeting, Hero ProgressRings card,
 *                daily MetricCards with neutral "vs yesterday" comparisons,
 *                encouraging progress messages, empty/loading/error states,
 *                pull-to-refresh, focus-triggered refresh, and add-entry FAB.
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
import { HeroProgressCard } from '../components';
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
    router.push('/record-form');
  }, [router]);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (isInitialLoading) {
    return (
      <ScreenContainer padded={false}>
        <LoadingState label="Loading your daily summary…" />
      </ScreenContainer>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <ScreenContainer padded={false}>
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
            <View style={[styles.headerRow, { marginBottom: spacing.lg }]}>
              <View style={styles.headerTextCol}>
                <AppText
                  variant="caption"
                  color="textMuted"
                  accessibilityLabel={`Today is ${displayDate}`}
                >
                  {displayDate}
                </AppText>
                <AppText variant="title" bold style={{ marginTop: 2 }}>
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
                      paddingHorizontal: spacing.sm + 2,
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
            <View style={[styles.sectionHeaderRow, { marginBottom: spacing.sm }]}>
              <AppText variant="heading" bold>
                Today's Totals
              </AppText>
              <AppText variant="caption" color="textMuted">
                vs yesterday
              </AppText>
            </View>

                    {/* ── Three Stacked Metric Cards ── */}
        <View style={styles.metricsStack}>
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
        paddingTop: 8,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
  },
      headerTextCol: {
        flex: 1,
  },
      entryPill: {
        alignSelf: 'center',
  },
      sectionHeaderRow: {
        flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
  },
      metricsStack: {
        width: '100%',
  },
});
