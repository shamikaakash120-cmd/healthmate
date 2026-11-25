/**
 * @layer Presentation (Dashboard Components)
 * @responsibility Hero card displaying daily ProgressRings for steps, calories, and water
 *                against default goals, paired with an encouraging progress banner.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  AppButton,
  AppCard,
  AppText,
  ProgressRing,
} from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { formatNumber } from '../../../core/utils/formatters';

/**
 * Renders the hero daily progress summary card with three animated ProgressRings
 * and a dynamic encouraging message based on today's progress.
 *
 * @param {object} props
 * @param {Array<{
 *   key: string,
 *   label: string,
 *   unit: string,
 *   todayValue: number,
 *   goal: number,
 *   percent: number,
 *   goalMet: boolean
 * }>} props.metrics Derived metric items for steps, calories, and water.
 * @param {number} props.overallPercent Overall percentage completion (0–100).
 * @param {{ message: string, subtext: string, iconName: string, tone: 'neutral'|'primary'|'success' }} props.encouragement
 * @param {boolean} props.hasEntriesToday Whether at least one record was logged today.
 * @param {Function} [props.onLogPress] Handler invoked when the empty-state prompt CTA is pressed.
 * @returns {React.JSX.Element}
 */
export default function HeroProgressCard({
  metrics,
  overallPercent,
  encouragement,
  hasEntriesToday,
  onLogPress,
}) {
  const { colors, spacing, radius } = useTheme();
  const { width } = useWindowDimensions();

  // Keep three rings cleanly spaced on narrow phones (~360dp) and balanced on wide viewports
  const ringSize = Math.min(110, Math.max(82, Math.floor((width - 104) / 3)));
  const strokeWidth = ringSize >= 100 ? 9 : 8;

  const badgeBg =
    encouragement.tone === 'success' ? colors.successBg : colors.surfaceAlt;
  const badgeColor =
    encouragement.tone === 'success'
      ? colors.success
      : encouragement.tone === 'primary'
        ? colors.primary
        : colors.textMuted;

  return (
    <AppCard
      style={{ marginBottom: spacing.lg }}
      accessibilityLabel={`Today's progress: ${overallPercent}% overall. ${encouragement.message}`}
    >
      {/* ── Card Header ── */}
      <View style={[styles.headerRow, { marginBottom: spacing.md }]}>
        <AppText variant="heading" bold>
          Today's Progress
        </AppText>
        <View
          style={[
            styles.percentBadge,
            {
              backgroundColor: badgeBg,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.sm + 2,
              paddingVertical: spacing.xs,
            },
          ]}
        >
          <AppText
            variant="caption"
            bold
            style={{ color: badgeColor, fontSize: 12 }}
          >
            {hasEntriesToday ? `${overallPercent}%` : 'Start fresh'}
          </AppText>
        </View>
      </View>

      {/* ── Three Goal Progress Rings ── */}
      <View style={[styles.ringsRow, { marginBottom: spacing.md }]}>
        {metrics.map((item) => (
          <View key={item.key} style={styles.ringCol}>
            <ProgressRing
              metricKey={item.key}
              value={item.todayValue}
              goal={item.goal}
              size={ringSize}
              strokeWidth={strokeWidth}
            />
            <View style={[styles.labelRow, { marginTop: spacing.xs + 2 }]}>
              <AppText variant="caption" bold color="text">
                {item.label}
              </AppText>
              {item.goalMet && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={13}
                  color={colors.success}
                  style={{ marginLeft: 3 }}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              )}
            </View>
            <AppText
              variant="caption"
              color="textMuted"
              style={{ fontSize: 11, lineHeight: 15 }}
              numberOfLines={1}
            >
              of {formatNumber(item.goal)}
            </AppText>
          </View>
        ))}
      </View>

      {/* ── Dynamic Encouraging Message Banner ── */}
      <View
        style={[
          styles.encouragementBox,
          {
            backgroundColor: badgeBg,
            borderRadius: radius.button,
            padding: spacing.md,
          },
        ]}
        accessible
        accessibilityLabel={`${encouragement.message} ${encouragement.subtext}`}
      >
        <View style={styles.encouragementRow}>
          <MaterialCommunityIcons
            name={encouragement.iconName}
            size={22}
            color={badgeColor}
            style={{ marginRight: spacing.sm, marginTop: 1 }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <View style={styles.encouragementCopy}>
            <AppText variant="body" bold>
              {encouragement.message}
            </AppText>
            <AppText
              variant="caption"
              color="textMuted"
              style={{ marginTop: 2 }}
            >
              {encouragement.subtext}
            </AppText>
          </View>
        </View>

        {!hasEntriesToday && onLogPress && (
          <AppButton
            label="Log first entry"
            variant="secondary"
            iconName="plus"
            onPress={onLogPress}
            accessibilityLabel="Log your first health entry for today"
            style={{ marginTop: spacing.sm }}
          />
        )}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  percentBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  ringCol: {
    flex: 1,
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  encouragementBox: {
    width: '100%',
  },
  encouragementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  encouragementCopy: {
    flex: 1,
  },
});
