/**
 * @layer Presentation (Dashboard Components)
 * @responsibility 7-day weekly summary card with selectable metric tabs, totals & daily averages,
 *                and a plain-View bar chart highlighting today (no chart libraries).
 */
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard, AppText } from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { formatNumber } from '../../../core/utils/formatters';

const BAR_CHART_HEIGHT = 92;

/**
 * Pure UI component rendering the 7-day weekly totals, averages, and bar chart.
 *
 * @param {object} props
 * @param {object} props.weeklySummary Derived weekly summary object from `useDashboardViewModel`.
 * @param {(metricKey: 'steps'|'calories'|'water') => void} props.onSelectMetric
 *   Callback invoked when a metric tab is tapped.
 * @returns {React.JSX.Element} Rendered weekly summary card.
 */
export default function WeeklySummaryCard({ weeklySummary, onSelectMetric }) {
  const { colors, spacing, radius } = useTheme();
  const {
    selectedMetric,
    tabs,
    summaries,
    activeSummary,
    bars,
    hasData,
    hasMetricData,
    activeDaysCount,
  } = weeklySummary;

  const activeColor = colors[activeSummary.colorKey];
  const activeTint = colors[activeSummary.tintKey];

  const subtitle = hasData
    ? `${activeDaysCount} ${activeDaysCount === 1 ? 'day' : 'days'} logged`
    : 'No entries this week';

  return (
    <AppCard style={{ marginBottom: spacing.md }}>
      {/* ── Header ── */}
      <View style={[styles.headerRow, { marginBottom: spacing.sm + 2 }]}>
        <AppText variant="heading" bold>
          Weekly Summary
        </AppText>
        <AppText variant="caption" color="textMuted">
          {subtitle}
        </AppText>
      </View>

      {/* ── Metric Selector Tabs ── */}
      <View
        style={[styles.tabsRow, { marginBottom: spacing.md }]}
        accessibilityRole="tablist"
        accessibilityLabel="Select weekly metric chart"
      >
        {tabs.map((tab, index) => {
          const isSelected = tab.key === selectedMetric;
          const tabAccent = colors[tab.colorKey];

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.75}
              onPress={() => onSelectMetric(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Show weekly ${tab.label.toLowerCase()} chart`}
              style={[
                styles.tabButton,
                {
                  backgroundColor: isSelected ? tabAccent : colors.surfaceAlt,
                  borderRadius: radius.button - 2,
                  marginRight: index < tabs.length - 1 ? spacing.xs + 2 : 0,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={15}
                color={isSelected ? colors.primaryText : tabAccent}
                style={{ marginRight: 4 }}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <AppText
                variant="caption"
                bold={isSelected}
                numberOfLines={1}
                style={{
                  color: isSelected ? colors.primaryText : colors.text,
                  fontSize: 12,
                }}
              >
                {tab.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Active Metric 7-Day Total & Average Callout ── */}
      <View
        style={[
          styles.statsBanner,
          {
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.button - 2,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 2,
            marginBottom: spacing.md,
          },
        ]}
      >
        <View style={styles.statCol}>
          <AppText variant="caption" color="textMuted">
            7-day total
          </AppText>
          <View style={styles.statValueRow}>
            <AppText variant="heading" bold style={{ color: activeColor }}>
              {formatNumber(activeSummary.total)}
            </AppText>
            <AppText
              variant="caption"
              color="textMuted"
              style={{ marginLeft: 4 }}
            >
              {activeSummary.unit}
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.statDivider,
            { backgroundColor: colors.border, marginHorizontal: spacing.md },
          ]}
        />

        <View style={styles.statCol}>
          <AppText variant="caption" color="textMuted">
            Daily average
          </AppText>
          <View style={styles.statValueRow}>
            <AppText variant="heading" bold>
              {formatNumber(activeSummary.dailyAverage)}
            </AppText>
            <AppText
              variant="caption"
              color="textMuted"
              style={{ marginLeft: 4 }}
            >
              {activeSummary.unit}/day
            </AppText>
          </View>
        </View>
      </View>

      {/* ── Plain-View 7-Day Bar Chart ── */}
      <View
        style={[styles.chartRow, { marginBottom: spacing.sm }]}
        accessibilityLabel={`7-day ${activeSummary.label} bar chart`}
      >
        {bars.map((bar) => {
          const barHeight =
            bar.value > 0
              ? Math.max(6, Math.round(bar.ratio * BAR_CHART_HEIGHT))
              : 0;

          return (
            <View
              key={bar.date}
              style={styles.barColumn}
              accessible
              accessibilityLabel={`${bar.isToday ? 'Today' : bar.weekdayShort}: ${formatNumber(bar.value)} ${activeSummary.unit}`}
            >
              {/* Value caption above bar */}
              <AppText
                variant="caption"
                numberOfLines={1}
                style={{
                  fontSize: 10,
                  lineHeight: 14,
                  minHeight: 14,
                  marginBottom: 4,
                  fontWeight: bar.isToday ? '700' : '500',
                  color: bar.isToday ? activeColor : colors.textMuted,
                }}
              >
                {bar.compactValue || '\u00A0'}
              </AppText>

              {/* Vertical track & filled bar */}
              <View
                style={[
                  styles.barTrack,
                  {
                    height: BAR_CHART_HEIGHT,
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.sm,
                    borderColor: bar.isToday ? activeColor : 'transparent',
                    borderWidth: bar.isToday ? 1 : 0,
                  },
                ]}
              >
                {barHeight > 0 && (
                  <View
                    style={{
                      width: '100%',
                      height: barHeight,
                      backgroundColor: activeColor,
                      borderRadius: radius.sm - 1,
                      opacity: bar.isToday ? 1 : 0.78,
                    }}
                  />
                )}
              </View>

              {/* Day initial below bar (Today highlighted) */}
              <View
                style={[
                  styles.dayBadge,
                  {
                    marginTop: 6,
                    backgroundColor: bar.isToday ? activeTint : 'transparent',
                    borderColor: bar.isToday ? activeColor : 'transparent',
                    borderWidth: bar.isToday ? 1.5 : 0,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  bold={bar.isToday}
                  style={{
                    fontSize: 11,
                    lineHeight: 14,
                    color: bar.isToday ? activeColor : colors.textMuted,
                  }}
                >
                  {bar.dayInitial}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Graceful Empty Week / Empty Metric Guidance ── */}
      {(!hasData || !hasMetricData) && (
        <View
          style={[
            styles.emptyNotice,
            {
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.sm,
              paddingHorizontal: spacing.sm + 2,
              paddingVertical: spacing.xs + 2,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <AppText
            variant="caption"
            color="textMuted"
            style={{ textAlign: 'center' }}
          >
            {!hasData
              ? 'No records logged in the last 7 days yet. Add an entry to see your weekly chart.'
              : `No ${activeSummary.label.toLowerCase()} logged in the last 7 days yet.`}
          </AppText>
        </View>
      )}

      {/* ── All-Metrics 7-Day Breakdown ── */}
      <View
        style={[
          styles.breakdownContainer,
          {
            borderTopColor: colors.border,
            paddingTop: spacing.sm + 2,
            marginTop: spacing.xs,
          },
        ]}
      >
        {summaries.map((item, idx) => {
          const isCurrent = item.key === selectedMetric;
          const itemColor = colors[item.colorKey];

          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              onPress={() => onSelectMetric(item.key)}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} weekly total ${formatNumber(item.total)} ${item.unit}, daily average ${formatNumber(item.dailyAverage)} ${item.unit}. Tap to show chart.`}
              style={[
                styles.breakdownRow,
                {
                  paddingVertical: spacing.xs + 1,
                  marginBottom: idx < summaries.length - 1 ? 2 : 0,
                },
              ]}
            >
              <View style={styles.breakdownLeft}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={16}
                  color={itemColor}
                  style={{ marginRight: spacing.xs + 2 }}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
                <AppText
                  variant="caption"
                  bold={isCurrent}
                  color={isCurrent ? 'text' : 'textMuted'}
                >
                  {item.label}
                </AppText>
              </View>

              <View style={styles.breakdownRight}>
                <AppText
                  variant="caption"
                  bold
                  numberOfLines={1}
                  style={{ color: colors.text }}
                >
                  {formatNumber(item.total)} {item.unit}
                </AppText>
                <AppText
                  variant="caption"
                  color="textMuted"
                  numberOfLines={1}
                  style={{ marginLeft: 6 }}
                >
                  · {formatNumber(item.dailyAverage)}/day
                </AppText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: 20,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  dayBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNotice: {
    width: '100%',
  },
  breakdownContainer: {
    borderTopWidth: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginLeft: 8,
  },
});
