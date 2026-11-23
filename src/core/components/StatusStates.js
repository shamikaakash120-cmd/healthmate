/**
 * @layer Core (Components)
 * @responsibility Full-screen loading and error states for async operations.
 */
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';
import AppButton from './AppButton';
import { useTheme } from '../theme';

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
      style={styles.container}
      accessibilityLiveRegion="polite"
      accessibilityLabel={label}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText
        variant="body"
        color="textMuted"
        style={{ marginTop: spacing.md }}
      >
        {label}
      </AppText>
    </View>
  );
}

/**
 * Full-screen error state with friendly copy and a retry button.
 *
 * @param {object} props
 * @param {string} [props.message] Error detail message shown to the user.
 * @param {Function} [props.onRetry] Retry handler; hides retry button if omitted.
 * @returns {React.JSX.Element}
 */
export function ErrorState({ message, onRetry }) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={styles.container}
      accessibilityLiveRegion="assertive"
      accessibilityLabel={`Error: ${message || 'Something went wrong'}`}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.errorBg, marginBottom: spacing.lg },
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

      {onRetry && (
        <AppButton
          label="Try again"
          onPress={onRetry}
          variant="secondary"
          iconName="refresh"
          accessibilityLabel="Retry the failed operation"
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
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
