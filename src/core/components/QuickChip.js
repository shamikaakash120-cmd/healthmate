/**
 * @layer Core (Components)
 * @responsibility Small tappable pill chip for quick-add increments with 48dp target and calm press scale.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import AppText from './AppText';
import PressableScale from './PressableScale';

/**
 * Compact pill-shaped chip for quick metric increments.
 *
 * @param {object} props
 * @param {string} props.label Text displayed in the chip (e.g. "+250 ml").
 * @param {Function} props.onPress Press handler.
 * @param {string} [props.metricKey] If provided, uses that metric's color; otherwise uses primary.
 * @param {boolean} [props.selected=false] Renders in filled (selected) state.
 * @param {object} [props.style] Additional outer spacing styles.
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
  const { colors, spacing, radius, touchTarget } = useTheme();

  const accentColor = metricKey ? colors[metricKey] : colors.primary;
  const tintColor = metricKey ? colors[`${metricKey}Tint`] : colors.surfaceAlt;

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.96}
      duration={150}
      containerStyle={style}
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
          paddingVertical: spacing.xs,
          minHeight: touchTarget.min,
          minWidth: touchTarget.min,
        },
      ]}
    >
      <AppText
        variant="caption"
        bold
        style={{ color: selected ? colors.primaryText : accentColor }}
      >
        {label}
      </AppText>
    </PressableScale >
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
