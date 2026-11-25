/**
 * @layer Core (Components)
 * @responsibility Themed card container with consistent radius, shadow, surface color,
 *                and optional calm press-scale animation when interactive.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';
import PressableScale from './PressableScale';

/**
 * Standard surface card with corner radius 20 and soft elevation.
 * Uses theme surface color and shadow tokens exclusively — no hard-coded values.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children Card contents.
 * @param {Function} [props.onPress] Optional press handler (adds calm 150ms scale feedback).
 * @param {object} [props.style] Additional styles applied to the card container.
 * @param {string} [props.accessibilityLabel] Accessibility label for the card region.
 * @param {boolean} [props.noPad=false] Remove default inner padding.
 * @returns {React.JSX.Element}
 */
export default function AppCard({
  children,
  onPress,
  style,
  accessibilityLabel,
  noPad = false,
}) {
  const { colors, spacing, radius, shadow } = useTheme();

  const cardSurfaceStyle = [
    styles.card,
    shadow,
    {
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: noPad ? 0 : spacing.md,
    },
    style,
  ];

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        scaleTo={0.985}
        duration={150}
        style={cardSurfaceStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </PressableScale>
    );
  }

  return (
    <View
      style={cardSurfaceStyle}
      accessibilityLabel={accessibilityLabel}
      accessible={!!accessibilityLabel}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
