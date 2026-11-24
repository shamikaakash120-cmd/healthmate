/**
 * @layer Presentation (Dashboard Screen)
 * @responsibility Pure UI view displaying today's health metrics summary and activity overview.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  AppText,
  AppCard,
  MetricCard,
  ProgressRing,
  FloatingActionButton,
} from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { greetingForTime } from '../../../core/utils/formatters';
import { formatDisplayDate, today } from '../../../core/utils/dateUtils';
import { useRecordsStore } from '../../records/viewmodel';

/**
 * Main dashboard screen component.
 * @returns {React.JSX.Element} Dashboard screen interface.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const todayTotals = useRecordsStore((state) => state.todayTotals);
  const loadTodayTotals = useRecordsStore((state) => state.loadTodayTotals);
  const loadRecords = useRecordsStore((state) => state.loadRecords);

  useEffect(() => {
    loadTodayTotals();
    loadRecords();
  }, []);

  const todayStr = today();
  const displayDate = formatDisplayDate(todayStr);
  const greeting = greetingForTime();

  return (
    <ScreenContainer scroll padded>
        {/* ── Screen Header ── */}
        <View style={[styles.header, { marginBottom: spacing.lg }]}>
          <AppText variant="caption" color="textMuted">
            {displayDate}
          </AppText>
          <AppText variant="title" bold style={{ marginTop: 2 }}>
            {greeting} 🌿
          </AppText>
        </View>

        {/* ── Today's Glanceable Goal Rings ── */}
        <AppCard style={{ marginBottom: spacing.lg }}>
          <AppText variant="heading" bold style={{ marginBottom: spacing.md }}>
            Today's Progress
          </AppText>
          <View style={styles.ringsRow}>
            <View style={styles.ringCol}>
              <ProgressRing
                metricKey="steps"
                value={todayTotals.steps}
                goal={10000}
                size={96}
                strokeWidth={8}
              />
            <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>
              Steps
            </AppText>
          </View>
          <View style={styles.ringCol}>
            <ProgressRing
              metricKey="calories"
              value={todayTotals.calories}
              goal={500}
              size={96}
              strokeWidth={8}
            />
            <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>
              Calories
            </AppText>
          </View>
          <View style={styles.ringCol}>
            <ProgressRing
              metricKey="water"
              value={todayTotals.water}
              goal={2000}
              size={96}
              strokeWidth={8}
            />
            <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>
              Water
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* ── Metric Summary Cards ── */}
      <AppText variant="heading" bold style={{ marginBottom: spacing.sm }}>
        Daily Totals
      </AppText>
      <View style={[styles.metricsRow, { marginBottom: spacing.xl }]}>
        <MetricCard
          metricKey="steps"
          value={todayTotals.steps}
          style={{ flex: 1, marginRight: spacing.sm }}
        />
        <MetricCard
          metricKey="calories"
          value={todayTotals.calories}
          style={{ flex: 1, marginRight: spacing.sm }}
        />
        <MetricCard
          metricKey="water"
          value={todayTotals.water}
          style={{ flex: 1 }}
        />
      </View>

      {/* ── Floating Action Button (Add Entry) ── */}
      <FloatingActionButton
        iconName="plus"
        onPress={() => router.push('/record-form')}
        accessibilityLabel="Add new health record"
      />
    </ScreenContainer>
  );
}

    const styles = StyleSheet.create({
      header: {
        paddingTop: 8,
      },
        ringsRow: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingVertical: 4,
        },
          ringCol: {
            alignItems: 'center',
          },
            metricsRow: {
              flexDirection: 'row',
              justifyContent: 'space-between',
            },
          });
