/**
 * @layer Core (Components)
 * @responsibility Friendly empty state with icon, title, hint, and optional action.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';
import AppButton from './AppButton';
import { useTheme } from '../theme';

/**
 * Renders an encouraging empty state for lists and dashboard sections.
 *
 * @param {object} props
 * @param {string} [props.iconName='heart-pulse'] MaterialCommunityIcons icon name.
 * @param {string} props.title Primary empty state message.
 * @param {string} [props.hint] Secondary hint / guidance text.
 * @param {string} [props.actionLabel] Label for the optional call-to-action button.
 * @param {Function} [props.onAction] Handler for the call-to-action button.
 * @param {object} [props.style] Additional styles for the outer container.
 * @returns {React.JSX.Element}
 */
export default function EmptyState({
  iconName = 'heart-pulse',
  title,
  hint,
  actionLabel,
  onAction,
  style,
}) {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={[styles.container, { paddingVertical: spacing.xxl }, style]}
      accessibilityRole="text"
      accessibilityLabel={`${title}${hint ? '. ' + hint : ''}`}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.surfaceAlt,
            marginBottom: spacing.lg,
          },
        ]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <MaterialCommunityIcons
          name={iconName}
          size={40}
          color={colors.textMuted}
        />
      </View>

      <AppText variant="heading" align="center" style={{ marginBottom: spacing.sm }}>
        {title}
      </AppText>

      {hint && (
        <AppText
          variant="body"
          color="textMuted"
          align="center"
          style={{ marginBottom: spacing.lg, lineHeight: 22 }}
        >
          {hint}
        </AppText>
      )}

      {actionLabel && onAction && (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          accessibilityLabel={actionLabel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
