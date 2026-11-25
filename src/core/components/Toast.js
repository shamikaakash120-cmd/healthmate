/**
 * @layer Core (Components)
 * @responsibility Global Snackbar/Toast provider with smooth 220ms fade/slide motion,
 *                success and error tokens, auto-dismiss, and imperative Zustand store API.
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { create } from 'zustand';
import { useTheme } from '../theme';
import AppText from './AppText';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const AUTO_DISMISS_MS = 2800;
const ENTER_DURATION_MS = 220;
const EXIT_DURATION_MS = 200;

/**
 * Zustand store holding the current toast notification state.
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

/**
 * Global Snackbar/Toast overlay anchored cleanly above the bottom tab bar.
 * @returns {React.JSX.Element | null}
 */
export function Toast() {
  const { colors, elevatedShadow, spacing, radius } = useTheme();
  const visible = useToastStore((state) => state.visible);
  const message = useToastStore((state) => state.message);
  const type = useToastStore((state) => state.type);
  const hideToast = useToastStore((state) => state.hideToast);

  const translateY = useRef(new Animated.Value(32)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef(null);
  const activeAnimation = useRef(null);

  const dismiss = useCallback(() => {
    activeAnimation.current?.stop();
    const exitAnim = Animated.parallel([
      Animated.timing(translateY, {
        toValue: 32,
        duration: EXIT_DURATION_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_DURATION_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]);
    activeAnimation.current = exitAnim;
    exitAnim.start(({ finished }) => {
      if (finished) hideToast();
    });
  }, [hideToast, opacity, translateY]);

  useEffect(() => {
      if (!visible) return undefined;

    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    activeAnimation.current?.stop();

  translateY.setValue(32);
  opacity.setValue(0);

    const enterAnim = Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]);
  activeAnimation.current = enterAnim;
  enterAnim.start();

  dismissTimer.current = setTimeout(dismiss, AUTO_DISMISS_MS);

  return () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    activeAnimation.current?.stop();
  };
}, [visible, message, dismiss, opacity, translateY]);

if (!visible) return null;

const isSuccess = type === 'success';
const bgColor = isSuccess ? colors.successBg : colors.errorBg;
const fgColor = isSuccess ? colors.success : colors.error;
const iconName = isSuccess ? 'check-circle-outline' : 'alert-circle-outline';
const a11yLabel = `${isSuccess ? 'Success' : 'Error'}: ${message}`;

return (
  <Animated.View
    pointerEvents="none"
    style={[
      styles.toast,
      elevatedShadow,
      {
        backgroundColor: bgColor,
        borderColor: colors.border,
        borderLeftColor: fgColor,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        marginHorizontal: spacing.lg,
        bottom: spacing.xxl + spacing.md,
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
      style={[styles.messageText, { color: fgColor }]}
    >
      {message}
    </AppText>
  </Animated.View>
);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 0,
    right: 0,
    maxWidth: 520,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  messageText: {
    flex: 1,
    flexShrink: 1,
  },
});
