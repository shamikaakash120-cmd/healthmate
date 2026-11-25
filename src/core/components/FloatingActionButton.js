/**
 * @layer Core (Components)
 * @responsibility Thumb-friendly floating action button anchored bottom-right with calm press scale.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import PressableScale from './PressableScale';

const FAB_SIZE = 56;

/**
 * Floating action button positioned at the bottom-right of the screen.
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
  const { colors, elevatedShadow, radius, spacing } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.94}
      duration={150}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      containerStyle={[
        styles.positioner,
        {
          bottom: spacing.xl,
          right: spacing.lg,
        },
        style,
      ]}
      style={[
        styles.fab,
        elevatedShadow,
        {
          backgroundColor: colors.primary,
          width: FAB_SIZE,
          height: FAB_SIZE,
          borderRadius: radius.pill,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={28}
        color={colors.primaryText}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
    positioner: {
      position: 'absolute',
    },
    fab: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
