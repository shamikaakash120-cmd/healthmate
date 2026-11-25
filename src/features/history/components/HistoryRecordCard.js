/**
 * @layer Presentation (History Components)
 * @responsibility Renders a single health record entry card with relative/formatted date heading,
 *                three compact color-coded metric rows, and accessible 48dp Edit/Delete actions.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard, AppText, PressableScale } from '../../../core/components';
import { METRICS, METRIC_KEYS, useTheme } from '../../../core/theme';
import { formatDisplayDate, formatRelativeDay } from '../../../core/utils/dateUtils';
import { formatNumber } from '../../../core/utils/formatters';

const METRIC_BADGE_SIZE = 32;

/**
 * Displays a single historical health record entry inside an AppCard.
 *
 * @param {object} props
 * @param {{ id: number, date: string, steps: number, calories: number, water: number }} props.record Health record entity.
 * @param {(record: object) => void} props.onEdit Handler invoked when the Edit button is pressed.
 * @param {(record: object) => void} props.onDelete Handler invoked when the Delete button is pressed.
 * @returns {React.JSX.Element}
 */
export default function HistoryRecordCard({ record, onEdit, onDelete }) {
  const { colors, spacing, radius, touchTarget } = useTheme();

  const relativeDate = formatRelativeDay(record.date);
  const formattedDate = formatDisplayDate(record.date);
  const hasRelativeHeading = relativeDate === 'Today' || relativeDate === 'Yesterday';

  return (
    <AppCard style={{ marginBottom: spacing.md }}>
      {/* ── Card Header: Date Heading & 48dp Action Buttons ── */}
      <View
        style={[
          styles.headerRow,
          {
            borderBottomColor: colors.border,
            paddingBottom: spacing.sm,
            marginBottom: spacing.sm,
            gap: spacing.sm,
          },
        ]}
      >
        <View style={styles.dateCol}>
          <AppText
            variant="heading"
            bold
            accessibilityRole="header"
            accessibilityLabel={`Entry for ${hasRelativeHeading ? `${relativeDate}, ${formattedDate}` : formattedDate}`}
          >
            {relativeDate}
          </AppText>
          {hasRelativeHeading && (
            <AppText variant="caption" color="textMuted" style={{ marginTop: 2 }}>
              {formattedDate}
            </AppText>
          )}
        </View>

        <View style={[styles.actionsRow, { gap: spacing.xs }]}>
            <PressableScale
              onPress={() => onEdit(record)}
              scaleTo={0.93}
              duration={150}
              accessibilityRole="button"
              accessibilityLabel={`Edit entry from ${formattedDate}`}
              style={[
                styles.actionButton,
                {
                  minWidth: touchTarget.min,
                  minHeight: touchTarget.min,
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radius.button,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color={colors.primary}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
          </PressableScale>

          <PressableScale
            onPress={() => onDelete(record)}
            scaleTo={0.93}
            duration={150}
            accessibilityRole="button"
            accessibilityLabel={`Delete entry from ${formattedDate}`}
            style={[
              styles.actionButton,
              {
                minWidth: touchTarget.min,
                minHeight: touchTarget.min,
                backgroundColor: colors.errorBg,
                borderRadius: radius.button,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={colors.error}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
        </PressableScale>
      </View>
    </View>

      {/* ── Three Compact Metric Rows ── */ }
  <View style={styles.metricsList}>
    {METRIC_KEYS.map((key, index) => {
      const config = METRICS[key];
      const metricColor = colors[config.colorKey];
      const metricTint = colors[config.tintKey];
      const rawValue = record[key] ?? 0;
      const formattedValue = formatNumber(rawValue);

      return (
        <View
          key={key}
          accessible
          accessibilityLabel={`${config.label}: ${formattedValue} ${config.unit}`}
          style={[
            styles.metricRow,
            { gap: spacing.sm },
            index < METRIC_KEYS.length - 1 && { marginBottom: spacing.xs + 2 },
          ]}
        >
          <View style={styles.metricLeft}>
            <View
              style={[
                styles.metricIconBadge,
                {
                  width: METRIC_BADGE_SIZE,
                  height: METRIC_BADGE_SIZE,
                  backgroundColor: metricTint,
                  borderRadius: radius.pill,
                  marginRight: spacing.sm,
                },
              ]}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              <MaterialCommunityIcons
                name={config.icon}
                size={16}
                color={metricColor}
              />
            </View>
            <AppText variant="body" color="textMuted">
              {config.label}
            </AppText>
          </View>

          <View style={styles.metricRight}>
            <AppText variant="body" bold style={{ color: metricColor }}>
              {formattedValue}
            </AppText>
            <AppText
              variant="caption"
              style={{ color: metricColor, marginLeft: spacing.xs }}
            >
              {config.unit}
            </AppText>
          </View>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  dateCol: {
    flex: 1,
    minWidth: 140,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsList: {
    width: '100%',
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricRight: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
});
