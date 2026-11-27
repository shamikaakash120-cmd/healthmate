/**
 * @layer Presentation (Dashboard Components)
 * @responsibility 7-day weekly summary card with selectable metric tabs, totals & daily averages,
 *                and an animated plain-View bar chart highlighting today (no chart libraries).
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { AppCard, AppText, PressableScale } from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { formatNumber } from '../../../core/utils/formatters';

const BAR_CHART_HEIGHT = 92;
const BAR_ANIMATION_MS = 280;

/**
 * Animated plain-View bar filling smoothly to its target height over 280ms.
 */
function AnimatedWeeklyBar({ targetHeight, color, radiusValue, isToday }) {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(heightAnim, {
      toValue: targetHeight,
      duration: BAR_ANIMATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();

    return () => {
      animation.stop();
    };
  }, [heightAnim, targetHeight]);

  return (
    <Animated.View
      style={{
        width: '100%',
        height: heightAnim,
        backgroundColor: color,
        borderRadius: radiusValue,
        opacity: isToday ? 1 : 0.78,
      }}
    />
  );
}

/**
 * Pure UI component rendering the 7-day weekly totals, averages, and animated plain-View bar chart.
 *
 * @param {object} props
 * @param {object} props.weeklySummary Derived weekly summary object from `useDashboardViewModel`.
 * @param {(metricKey: 'steps'|'calories'|'water') => void} props.onSelectMetric
 *   Callback invoked when a metric tab is tapped.
 * @returns {React.JSX.Element} Rendered weekly summary card.
 */
export default function WeeklySummaryCard({ weeklySummary, onSelectMetric }) {
  const { colors, spacing, radius, touchTarget } = useTheme();
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
      <View style={[styles.headerRow, { gap: spacing.xs, marginBottom: spacing.sm + 2 }]}>
        <AppText variant="heading" bold>
          Weekly Summary
        </AppText>
        <AppText variant="caption" color="textMuted">
          {subtitle}
        </AppText>
      </View>

      <View
        style={[styles.tabsRow, { gap: spacing.xs + 2, marginBottom: spacing.md }]}
        accessibilityRole="tablist"
        accessibilityLabel="Select weekly metric chart"
      >
        {
          tabs.map((tab) => {
            const isSelected = tab.key === selectedMetric;
            const tabAccent = colors[tab.colorKey];

            return (
              <PressableScale
                key={tab.key}
                scaleTo={0.97}
                duration={150}
                onPress={() => onSelectMetric(tab.key)}
                containerStyle={styles.tabWrap}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Show weekly ${tab.label.toLowerCase()} chart`}
                style={[
                  styles.tabButton,
                  {
                    minHeight: touchTarget.min,
                    backgroundColor: isSelected ? tabAccent : colors.surfaceAlt,
                    borderRadius: radius.button - 2,
                    paddingHorizontal: spacing.xs + 2,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={16}
                  color={isSelected ? colors.primaryText : tabAccent}
                  style={{ marginRight: spacing.xs }}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
                <AppText
                  variant="caption"
                  bold={isSelected}
                  numberOfLines={1}
                  style={{
                    color: isSelected ? colors.primaryText : colors.text,
                    flexShrink: 1,
                  }}
                >
                  {tab.label}
                </AppText>
              </PressableScale>
            );
          })}
      </View>

      <View
        style={[
          styles.statsBanner,
          {
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.button - 2,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 2,
            gap: spacing.md,
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
              style={{ marginLeft: spacing.xs }}
            >
              {activeSummary.unit}
            </AppText>
          </View>
        </View>

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
              style={{ marginLeft: spacing.xs }}
            >
              {activeSummary.unit}/day
            </AppText>
          </View>
        </View>
      </View>

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
              <AppText
                variant="caption"
                numberOfLines={1}
                style={{
                  fontSize: 10,
                  lineHeight: 14,
                  minHeight: 14,
                  marginBottom: spacing.xs,
                  fontWeight: bar.isToday ? '700' : '500',
                  color: bar.isToday ? activeColor : colors.textMuted,
                }}
              >
                {bar.compactValue || '\u00A0'}
              </AppText>

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
                <AnimatedWeeklyBar
                  targetHeight={barHeight}
                  color={activeColor}
                  radiusValue={radius.sm - 1}
                  isToday={bar.isToday}
                />
              </View>

              <View
                style={[
                  styles.dayBadge,
                  {
                    marginTop: spacing.xs + 2,
                    borderRadius: radius.pill,
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

      {(!hasData || !hasMetricData) && (
        <View
          style={[
            styles.emptyNotice,
            {
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.sm,
              paddingHorizontal: spacing.sm + spacing.xs,
              paddingVertical: spacing.xs + 2,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <AppText
            variant="caption"
            color="textMuted"
            align="center"
          >
            {!hasData
              ? 'No records logged in the last 7 days yet. Add an entry to see your weekly chart.'
              : `No ${activeSummary.label.toLowerCase()} logged in the last 7 days yet.`}
          </AppText>
        </View>
      )}

      <View
        style={[
          styles.breakdownContainer,
          {
            borderTopColor: colors.border,
            paddingTop: spacing.sm,
            marginTop: spacing.xs,
          },
        ]}
      >
        {
          summaries.map((item) => {
            const isCurrent = item.key === selectedMetric;
            const itemColor = colors[item.colorKey];

            return (
              <PressableScale
                key={item.key}
                scaleTo={0.985}
                duration={150}
                onPress={() => onSelectMetric(item.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: isCurrent }}
                accessibilityLabel={`${item.label} weekly total ${formatNumber(item.total)} ${item.unit}, daily average ${formatNumber(item.dailyAverage)} ${item.unit}. Tap to show chart.`}
                style={[
                  styles.breakdownRow,
                  {
                    minHeight: touchTarget.min,
                    paddingHorizontal: spacing.xs,
                    borderRadius: radius.sm,
                    backgroundColor: isCurrent ? colors.surfaceAlt : 'transparent',
                  },
                ]}
              >
                <View style={styles.breakdownLeft}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={18}
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
                    style={{ color: colors.text }}
                  >
                    {formatNumber(item.total)} {item.unit}
                  </AppText>
                  <AppText
                    variant="caption"
                    color="textMuted"
                    style={{ marginLeft: spacing.xs + 2 }}
                  >
                    · {formatNumber(item.dailyAverage)}/day
                  </AppText>
                </View>
              </PressableScale>
            );
          })}
      </View>
    </AppCard >
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tabWrap: {
    flex: 1,
    minWidth: 88,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    minWidth: 110,
  },
  statValueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginTop: 2,
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
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownRight: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flexShrink: 1,
  },
});
