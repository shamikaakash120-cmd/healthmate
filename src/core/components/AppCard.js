/**
 * @layer Core (Components)
 * @responsibility Themed card container with consistent radius, shadow, and surface color.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';

/**
 * Standard surface card with corner radius 20 and soft elevation. Always uses theme surface color and shadow tokens — no hard-coded values.
 * @param {object} props
 * @param {React.ReactNode} props.children 
 * @param {object} [props.style] Additional styles applied to the card container.
 * @param {string} [props.accessibilityLabel] Accessibility label for the card region.
 * @param {boolean} [props.noPad=false] Remove default inner padding.
 * @returns {React.JSX.Element}
 */
export default function AppCard({
  children,
  style,
  accessibilityLabel,
  noPad = false,
}) {
  const { colors, spacing, radius, shadow } = useTheme();

  return (
    <View
      style={[
        styles.card,
        shadow,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          padding: noPad ? 0 : spacing.md,
        },
        style,
      ]}
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
