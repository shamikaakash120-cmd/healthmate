/**
 * @layer Presentation (Dashboard Components)
 * @responsibility Displays consecutive logging-day streak with a flame icon and calm encouragement.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppCard, AppText } from '../../../core/components';
import { useTheme } from '../../../core/theme';

/**
 * Pure presentation card showing the active logging streak.
 *
 * @param {object} props
 * @param {{ count: number, loggedToday: boolean, message: string, subtext: string }} props.streak
 *   Derived streak metadata from `useDashboardViewModel`.
 * @returns {React.JSX.Element} Rendered streak banner card.
 */
export default function StreakBannerCard({ streak }) {
  const { colors, spacing, radius, touchTarget } = useTheme();
  const hasStreak = streak.count > 0;

  const badgeBg = hasStreak ? colors.caloriesTint : colors.surfaceAlt;
  const flameColor = hasStreak ? colors.calories : colors.textMuted;

  return (
    <AppCard
      style={{ marginBottom: spacing.md }}
      accessibilityLabel={`${streak.message} ${streak.subtext}`}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconCircle,
            {
              width: touchTarget.min,
              height: touchTarget.min,
              backgroundColor: badgeBg,
              borderRadius: radius.pill,
              marginRight: spacing.md,
            },
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          <MaterialCommunityIcons
            name="fire"
            size={24}
            color={flameColor}
          />
        </View>

        <View style={styles.copyCol}>
          <AppText variant="body" bold>
            {streak.message}
          </AppText>
          <AppText
            variant="caption"
            color="textMuted"
            style={{ marginTop: spacing.xs / 2 }}
          >
            {streak.subtext}
          </AppText>
        </View>

        {hasStreak && (
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: badgeBg,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.sm + spacing.xs,
                paddingVertical: spacing.xs,
                marginLeft: spacing.sm,
              },
            ]}
          >
            <AppText
              variant="caption"
              bold
              style={{ color: flameColor }}
            >
              {streak.count}d
            </AppText>
          </View>
        )}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyCol: {
    flex: 1,
    flexShrink: 1,
  },
  countBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
