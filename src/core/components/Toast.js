/**
 * @layer Core (Components)
 * @responsibility Global Snackbar/Toast provider with success and error styles,
 *                auto-dismiss, and imperative show API via a Zustand store.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { create } from 'zustand';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';
import { useTheme } from '../theme';

// ─── Zustand store for toast state ───────────────────────────────────────────

/**
 * Zustand store that holds the current toast notification state.
 * Consumers call `useToastStore.getState().showToast(...)` from anywhere.
 */
export const useToastStore = create((set) => ({
  visible: false,
  message: '',
  type: 'success', // 'success' | 'error'

  /**
   * Displays a toast notification.
   * @param {string} message Toast message text.
   * @param {'success'|'error'} [type='success'] Visual style.
   */
  showToast: (message, type = 'success') =>
    set({ visible: true, message, type }),

  /** Hides the toast. */
  hideToast: () => set({ visible: false }),
}));

/**
 * Convenience helper to trigger a success toast from anywhere in the app.
 * @param {string} message Toast message text.
 */
export function showSuccessToast(message) {
  useToastStore.getState().showToast(message, 'success');
}

/**
 * Convenience helper to trigger an error toast from anywhere in the app.
 * @param {string} message Toast message text.
 */
export function showErrorToast(message) {
  useToastStore.getState().showToast(message, 'error');
}

// ─── Toast UI component ───────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 3000;

/**
 * Renders the active toast notification.
 * Mount this once at the root layout level (inside app/_layout.js).
 * @returns {React.JSX.Element|null}
 */
export function Toast() {
  const { colors, spacing, radius } = useTheme();
  const { visible, message, type, hideToast } = useToastStore();

  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef(null);

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      dismissTimer.current = setTimeout(() => {
        dismiss();
      }, AUTO_DISMISS_MS);
    }

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible, message]);

  function dismiss() {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => hideToast());
  }

  if (!visible) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? colors.successBg : colors.errorBg;
  const fgColor = isSuccess ? colors.success : colors.error;
  const iconName = isSuccess ? 'check-circle-outline' : 'alert-circle-outline';
  const a11yLabel = `${isSuccess ? 'Success' : 'Error'}: ${message}`;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: bgColor,
          borderLeftColor: fgColor,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 2,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.lg,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={a11yLabel}
      accessibilityRole="alert"
    >
      <MaterialCommunityIcons
        name={iconName}
        size={20}
        color={fgColor}
        style={{ marginRight: spacing.sm }}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <AppText
        variant="body"
        style={{ color: fgColor, flex: 1 }}
      >
        {message}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 6,
  },
});
