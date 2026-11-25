/**
 * @layer Core (Components)
 * @responsibility Metric summary card: tinted icon circle, label, large numeric value,
 *                unit, and optional neutral "vs yesterday" comparison badge.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';
import { formatNumber } from '../utils/formatters';
import AppCard from './AppCard';
import AppText from './AppText';

/**
 * Displays a single health metric with its color-coded icon, value, unit, and optional
 * neutral comparison indicator against yesterday. All colors are sourced from theme tokens.
 *
 * @param {object} props
 * @param {string} props.metricKey Key into METRICS config ('steps'|'calories'|'water').
 * @param {string|number} props.value Current metric value to display.
 * @param {string} [props.label] Override label (defaults to METRICS label).
 * @param {'vertical'|'horizontal'} [props.layout='vertical'] Card layout orientation.
 * @param {object} [props.comparison] Optional comparison badge metadata (`direction`, `label`, `iconName`, `a11yText`).
 * @param {object} [props.style] Additional styles for the outer card.
 * @param {string} [props.accessibilityLabel] Override accessibility label.
 * @returns {React.JSX.Element|null}
 */
  export default function MetricCard({
    metricKey,
    value,
    label,
    layout = 'vertical',
    comparison,
    style,
    accessibilityLabel,
  }) {
    const { colors, spacing, radius, metrics } = useTheme();
    const config = metrics[metricKey];
    if (!config) return null;

    const metricColor = colors[config.colorKey];
    const metricTint = colors[config.tintKey];
    const displayLabel = label || config.label;
    const formattedValue = typeof value === 'number' ? formatNumber(value) : value;

    const comparisonSummary = comparison?.a11yText || comparison?.label || '';
    const a11yLabel =
      accessibilityLabel ||
    `${displayLabel}: ${formattedValue} ${config.unit}${comparisonSummary ? `, ${comparisonSummary}` : ''}`;

        // Soft, judgment-free palette: primary teal for upward progress, muted slate otherwise (never red).
        const comparisonColor=
    comparison?.direction === 'up' ? colors.primary : colors.textMuted;

    const renderIconBadge = (extraStyle) => (
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: metricTint,
            width: 48,
            height: 48,
            borderRadius: 24,
          },
          extraStyle,
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
    );

    const renderValueRow = () => (
      <View style={styles.valueRow}>
        <AppText
          variant="metricNumber"
          style={{ color: metricColor }}
          bold
        >
          {formattedValue}
        </AppText>
        <AppText
          variant="caption"
          color="textMuted"
          style={{ marginLeft: spacing.xs, alignSelf: 'flex-end', marginBottom: 4 }}
        >
          {config.unit}
        </AppText>
      </View>
    );

    const renderComparisonPill = (extraStyle) => {
      if (!comparison?.label) return null;
      const iconName =
        comparison.iconName ||
        (comparison.direction === 'up'
          ? 'arrow-up'
          : comparison.direction === 'down'
            ? 'arrow-down'
            : 'minus');

      return (
        <View
          style={[
            styles.comparisonPill,
            {
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
            },
            extraStyle,
          ]}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={13}
            color={comparisonColor}
            style={{ marginRight: 4 }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <AppText
            variant="caption"
            style={{ color: comparisonColor, fontSize: 12, lineHeight: 16 }}
            numberOfLines={1}
          >
            {comparison.label}
          </AppText>
        </View>
      );
    };

    if (layout === 'horizontal') {
      return (
        <AppCard
          style={[styles.horizontalCard, style]}
          accessibilityLabel={a11yLabel}
        >
          {renderIconBadge({ marginRight: spacing.md })}
          <View style={styles.horizontalContent}>
            <View style={styles.horizontalTopRow}>
              <AppText variant="caption" color="textMuted" bold>
                {displayLabel}
              </AppText>
              {renderComparisonPill()}
            </View>
            {renderValueRow()}
          </View>
        </AppCard>
      );
    }

    return (
      <AppCard
        style={[styles.card, style]}
        accessibilityLabel={a11yLabel}
      >
        {renderIconBadge({ marginBottom: spacing.sm })}

        <AppText variant="caption" color="textMuted" style={{ marginBottom: 2 }}>
          {displayLabel}
        </AppText>

        {renderValueRow()}

        {renderComparisonPill({ marginTop: spacing.sm })}
      </AppCard>
    );
  }

  const styles = StyleSheet.create({
    card: {
      alignItems: 'flex-start',
      minWidth: 120,
    },
    horizontalCard: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    horizontalContent: {
      flex: 1,
    },
    horizontalTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 2,
    },
    iconCircle: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    comparisonPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
  });
