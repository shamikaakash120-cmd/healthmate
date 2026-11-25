/**
 * @layer Presentation (History Components)
 * @responsibility Renders a single health record entry card with relative/formatted date heading,
 *                three compact color-coded metric rows, and accessible 48dp Edit/Delete actions.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppCard, AppText } from '../../../core/components';
import { METRICS, METRIC_KEYS, useTheme } from '../../../core/theme';
import { formatDisplayDate, formatRelativeDay } from '../../../core/utils/dateUtils';
import { formatNumber } from '../../../core/utils/formatters';

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
  const { colors, spacing, radius } = useTheme();

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

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => onEdit(record)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Edit entry from ${formattedDate}`}
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.button,
                marginRight: spacing.xs,
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
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDelete(record)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Delete entry from ${formattedDate}`}
            style={[
              styles.actionButton,
              {
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
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Three Compact Metric Rows ── */}
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
                index < METRIC_KEYS.length - 1 && { marginBottom: spacing.xs + 2 },
              ]}
            >
              <View style={styles.metricLeft}>
                <View
                  style={[
                    styles.metricIconBadge,
                    {
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
    </AppCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  dateCol: {
    flex: 1,
    paddingRight: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsList: {
    width: '100%',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconBadge: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});
