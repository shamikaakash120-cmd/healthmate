/**
 * @layer Core (Components)
 * @responsibility SVG circular progress ring with metric color fill,
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme';
import AppText from './AppText';

// Create an animated version of the SVG Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Renders a circular progress ring that animates from 0 to the current progress ratio.
 *
 * @param {object} props
 * @param {string} props.metricKey Key into METRICS config ('steps'|'calories'|'water').
 * @param {number} props.value Current value.
 * @param {number} props.goal Target / goal value.
 * @param {number} [props.size=120] Diameter of the ring in dp.
 * @param {number} [props.strokeWidth=10] Width of the progress stroke.
 * @param {boolean} [props.showCentreText=true] Show value and unit inside the ring.
 * @param {string} [props.accessibilityLabel] Override accessibility description.
 * @returns {React.JSX.Element}
 */
export default function ProgressRing({
  metricKey,
  value,
  goal,
  size = 120,
  strokeWidth = 10,
  showCentreText = true,
  accessibilityLabel,
}) {
  const { colors, metrics } = useTheme();
  const config = metrics[metricKey];
  if (!config) return null;

  const metricColor = colors[config.colorKey];
  const trackColor = colors[config.tintKey];

  const progress = goal > 0 ? Math.min(value / goal, 1) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated stroke offset
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const displayValue =
    value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

  const a11yLabel =
    accessibilityLabel ||
    `${config.label}: ${value} of ${goal} ${config.unit}, ${Math.round(progress * 100)}% complete`;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel={a11yLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: goal, now: value }}
    >
      {/* Rotate container -90deg so arc begins at 12 o'clock without using SVG `origin` prop (avoids React 19 web `transform-origin` warning) */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ rotate: '-90deg' }] },
        ]}
      >
        <Svg width={size} height={size}>
          {/* Track ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress ring */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={metricColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {showCentreText && (
        <View
          style={[
            styles.centreText,
            { maxWidth: Math.max(0, size - strokeWidth * 2 - 8) },
          ]}
          pointerEvents="none"
        >
          <AppText
            variant={size >= 100 ? 'title' : 'heading'}
            bold
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              color: metricColor,
              lineHeight: size >= 100 ? 26 : 22,
            }}
          >
            {displayValue}
          </AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {config.unit}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centreText: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
