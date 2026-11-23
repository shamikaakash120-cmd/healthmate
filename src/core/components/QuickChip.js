/**
 * @layer Core (Components)
 * @responsibility Small tappable pill chip for quick-add increments (e.g. "+250 ml").
 */
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText';
import { useTheme } from '../theme';

/**
 * Compact pill-shaped chip for quick metric increments.
 *
 * @param {object} props
 * @param {string} props.label Text displayed in the chip (e.g. "+250 ml").
 * @param {Function} props.onPress Press handler.
 * @param {string} [props.metricKey] If provided, uses that metric's color; otherwise uses primary.
 * @param {boolean} [props.selected=false] Renders in filled (selected) state.
 * @param {object} [props.style] Additional styles.
 * @param {string} props.accessibilityLabel Accessibility label (required).
 * @returns {React.JSX.Element}
 */
export default function QuickChip({
  label,
  onPress,
  metricKey,
  selected = false,
  style,
  accessibilityLabel,
}) {
  const { colors, spacing, radius } = useTheme();

  const accentColor = metricKey ? colors[metricKey] : colors.primary;
  const tintColor = metricKey ? colors[`${metricKey}Tint`] : colors.surfaceAlt;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? accentColor : tintColor,
          borderColor: accentColor,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs + 2,
          minHeight: 32,
        },
        style,
      ]}
    >
      <AppText
        variant="caption"
        bold
        style={{ color: selected ? '#FFFFFF' : accentColor }}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
