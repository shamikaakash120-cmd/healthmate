/**
 * @layer Core (Components)
 * @responsibility Themed button with primary/secondary/text/destructive variants,
 *                loading state, press feedback, and minimum 48dp touch target.
 */
import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';
import { useTheme } from '../theme';

/**
 * Reusable button component covering all interaction contexts.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'text'|'destructive'} [props.variant='primary'] Visual variant.
 * @param {string} props.label Button label text.
 * @param {Function} props.onPress Press handler.
 * @param {boolean} [props.loading=false] Shows an activity spinner and disables press.
 * @param {boolean} [props.disabled=false] Prevents interaction and reduces opacity.
 * @param {string} [props.iconName] Optional MaterialCommunityIcons icon displayed left of label.
 * @param {object} [props.style] Additional outer container styles.
 * @param {string} props.accessibilityLabel Accessibility label (required for screen readers).
 * @returns {React.JSX.Element}
 */
export default function AppButton({
  variant = 'primary',
  label,
  onPress,
  loading = false,
  disabled = false,
  iconName,
  style,
  accessibilityLabel,
}) {
  const { colors, spacing, radius, typography } = useTheme();

  const isDisabled = disabled || loading;

  // Resolve variant-specific styles from tokens
  const variantStyles = {
    primary: {
      bg: colors.primary,
      fg: colors.primaryText,
      borderColor: 'transparent',
      borderWidth: 0,
    },
    secondary: {
      bg: 'transparent',
      fg: colors.primary,
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    text: {
      bg: 'transparent',
      fg: colors.primary,
      borderColor: 'transparent',
      borderWidth: 0,
    },
    destructive: {
      bg: colors.error,
      fg: '#FFFFFF',
      borderColor: 'transparent',
      borderWidth: 0,
    },
  };

  const v = variantStyles[variant] || variantStyles.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.borderColor,
          borderWidth: v.borderWidth,
          borderRadius: radius.button,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm + 2,
          opacity: isDisabled ? 0.5 : 1,
          minHeight: 48,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <View style={styles.row}>
          {iconName && (
            <MaterialCommunityIcons
              name={iconName}
              size={18}
              color={v.fg}
              style={{ marginRight: spacing.xs }}
            />
          )}
          <AppText
            variant="body"
            bold
            style={{ color: v.fg }}
            accessibilityLabel={label}
          >
            {label}
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
