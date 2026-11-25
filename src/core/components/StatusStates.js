/**
 * @layer Core (Components)
 * @responsibility Full-screen loading and error states for async operations.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import AppButton from './AppButton';
import AppText from './AppText';

const ERROR_ICON_SIZE = 72;

/**
 * Full-screen loading indicator with optional label.
 *
 * @param {object} props
 * @param {string} [props.label='Loading…'] Accessible loading message.
 * @returns {React.JSX.Element}
 */
export function LoadingState({ label = 'Loading…' }) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={[styles.container, { paddingHorizontal: spacing.xl }]}
      accessibilityRole="progressbar"
      accessibilityLiveRegion="polite"
      accessibilityLabel={label}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText
        variant="body"
        color="textMuted"
        align="center"
        style={{ marginTop: spacing.md }}
      >
        {label}
      </AppText>
    </View>
  );
}

/**
 * Full-screen error state with friendly copy and an optional retry button.
 *
 * @param {object} props
 * @param {string} [props.message] Error detail message shown to the user.
 * @param {Function} [props.onRetry] Retry handler; hides retry button if omitted.
 * @returns {React.JSX.Element}
 */
export function ErrorState({ message, onRetry }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[styles.container, { paddingHorizontal: spacing.xl }]}
      accessibilityLiveRegion="assertive"
    >
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={`Something went wrong. ${message || ''}`}
        style={styles.messageGroup}
      >
      <View
        style={[
          styles.iconCircle,
          {
            width: ERROR_ICON_SIZE,
            height: ERROR_ICON_SIZE,
            borderRadius: radius.pill,
            backgroundColor: colors.errorBg,
            marginBottom: spacing.lg,
          },
        ]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={36}
          color={colors.error}
        />
      </View>

          <AppText variant="heading" align="center" style={{ marginBottom: spacing.sm }}>
            Something went wrong
          </AppText>

          {message && (
            <AppText
              variant="body"
              color="textMuted"
              align="center"
              style={{ marginBottom: spacing.lg }}
            >
              {message}
            </AppText>
          )}
        </View>

      {onRetry && (
        <AppButton
          label="Try again"
          onPress={onRetry}
          variant="secondary"
          iconName="refresh"
          accessibilityLabel="Retry the failed operation"
          style={styles.retryBtn}
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
  retryBtn: {
    minWidth: 160,
  },
});
