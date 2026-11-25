/**
 * @layer Core (Components)
 * @responsibility Friendly empty state with icon, title, hint, and optional action.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import AppButton from './AppButton';
import AppText from './AppText';

const EMPTY_ICON_SIZE = 80;

/**
 * Renders an encouraging empty state for lists and dashboard sections.
 * Keeps interactive CTA outside any container accessibility grouping so screen readers
 * can focus both the message and action button independently.
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
  const { colors, radius, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingVertical: spacing.xxl,
          paddingHorizontal: spacing.xl,
        },
        style,
      ]}
    >
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={`${title}${hint ? `. ${hint}` : ''}`}
        style={styles.messageGroup}
      >
      <View
        style={[
          styles.iconCircle,
          {
            width: EMPTY_ICON_SIZE,
            height: EMPTY_ICON_SIZE,
            borderRadius: radius.pill,
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
              style={{ marginBottom: spacing.lg }}
            >
              {hint}
            </AppText>
          )}
        </View>

      {actionLabel && onAction && (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          accessibilityLabel={actionLabel}
          style={styles.actionBtn}
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
  },
  messageGroup: {
    alignItems: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    minWidth: 180,
  },
});
