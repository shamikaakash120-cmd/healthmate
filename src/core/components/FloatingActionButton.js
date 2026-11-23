/**
 * @layer Core (Components)
 * @responsibility Thumb-friendly floating action button anchored bottom-right.
 */
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';

/**
 * Floating action button positioned at the bottom-right of the screen.
 * Uses absolute positioning — the parent must be `position: relative`.
 *
 * @param {object} props
 * @param {string} [props.iconName='plus'] MaterialCommunityIcons icon name.
 * @param {Function} props.onPress Press handler.
 * @param {string} props.accessibilityLabel Accessibility label (required).
 * @param {object} [props.style] Additional positioning or style overrides.
 * @returns {React.JSX.Element}
 */
export default function FloatingActionButton({
  iconName = 'plus',
  onPress,
  accessibilityLabel,
  style,
}) {
  const { colors, shadow, spacing } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={[
        styles.fab,
        shadow,
        {
          backgroundColor: colors.primary,
          bottom: spacing.xl,
          right: spacing.lg,
          width: 56,
          height: 56,
          borderRadius: 28,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={28}
        color={colors.primaryText}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    // Minimum 48dp guaranteed by 56dp diameter
    elevation: 6,
  },
});
