/**
 * @layer Core (Components)
 * @responsibility Accessible pressable wrapper with a calm 150ms scale response on press.
 */
import React, { useRef } from 'react';
import { Animated, Easing, Platform, Pressable } from 'react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * Wraps an interactive button, chip, or card with subtle 150ms scale feedback.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children Child elements.
 * @param {Function} [props.onPress] Tap handler.
 * @param {boolean} [props.disabled=false] Disables press interaction and animation.
 * @param {number} [props.scaleTo=0.97] Target scale while pressed.
 * @param {number} [props.duration=150] Animation duration in ms (150–300ms range).
 * @param {object} [props.containerStyle] Styles applied to the outer Animated wrapper.
 * @param {object} [props.style] Styles applied to the inner Pressable.
 * @returns {React.JSX.Element}
 */
export default function PressableScale({
  children,
  onPress,
  disabled = false,
  scaleTo = 0.97,
  duration = 150,
  containerStyle,
  style,
  ...rest
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function animateTo(toValue) {
    Animated.timing(scaleAnim, {
      toValue,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }

  return (
    <Animated.View style={[containerStyle, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          if (!disabled) animateTo(scaleTo);
        }}
        onPressOut={() => animateTo(1)}
        style={({ pressed }) => [
          style,
          pressed && !disabled ? { opacity: 0.92 } : null,
        ]}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
