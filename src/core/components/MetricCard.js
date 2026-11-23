/**
 * @layer Core (Components)
 * @responsibility Metric summary card: tinted icon circle, label, large numeric value, and unit.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';
import AppCard from './AppCard';
import { useTheme } from '../theme';

/**
 * Displays a single health metric with its color-coded icon, value, and unit.
 * All colors sourced from theme tokens via the metric's colorKey and tintKey.
 *
 * @param {object} props
 * @param {string} props.metricKey Key into METRICS config ('steps'|'calories'|'water').
 * @param {string|number} props.value Current metric value to display.
 * @param {string} [props.label] Override label (defaults to METRICS label).
 * @param {object} [props.style] Additional styles for the outer card.
 * @param {string} [props.accessibilityLabel] Override accessibility label.
 * @returns {React.JSX.Element}
 */
export default function MetricCard({ metricKey, value, label, style, accessibilityLabel }) {
  const { colors, spacing, radius, metrics } = useTheme();
  const config = metrics[metricKey];
  if (!config) return null;

  const metricColor = colors[config.colorKey];
  const metricTint = colors[config.tintKey];
  const displayLabel = label || config.label;
  const a11yLabel =
    accessibilityLabel ||
    `${displayLabel}: ${value} ${config.unit}`;

  return (
    <AppCard
      style={[styles.card, style]}
      accessibilityLabel={a11yLabel}
    >
      {/* Icon circle */}
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: metricTint,
            width: 48,
            height: 48,
            borderRadius: 24,
            marginBottom: spacing.sm,
          },
        ]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <MaterialCommunityIcons
          name={config.icon}
          size={24}
          color={metricColor}
        />
      </View>

      {/* Label */}
      <AppText variant="caption" color="textMuted" style={{ marginBottom: 2 }}>
        {displayLabel}
      </AppText>

      {/* Value row */}
      <View style={styles.valueRow}>
        <AppText
          variant="metricNumber"
          style={{ color: metricColor }}
          bold
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </AppText>
        <AppText
          variant="caption"
          color="textMuted"
          style={{ marginLeft: spacing.xs, alignSelf: 'flex-end', marginBottom: 3 }}
        >
          {config.unit}
        </AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    minWidth: 120,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});
