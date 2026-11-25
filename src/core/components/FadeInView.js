/**
 * @layer Core (Components)
 * @responsibility Subtle fade-in & vertical settle wrapper for list items and cards.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * Gently fades and settles children into view over 220ms using built-in Animated.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children Content to fade in.
 * @param {number} [props.delay=0] Optional entrance stagger in ms (kept small/calm).
 * @param {number} [props.duration=220] Animation duration in ms.
 * @param {object} [props.style] Optional container styles.
 * @returns {React.JSX.Element}
 */
export default function FadeInView({
  children,
  delay = 0,
  duration = 220,
  style,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity, translateY, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
