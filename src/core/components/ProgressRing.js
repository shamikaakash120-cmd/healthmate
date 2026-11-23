/**
 * @layer Core (Components)
 * @responsibility SVG circular progress ring with metric color fill,
 *                animated stroke, and centre text displaying value/goal.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import AppText from './AppText';
import { useTheme } from '../theme';

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
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
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
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {showCentreText && (
        <View style={styles.centreText} pointerEvents="none">
          <AppText
            variant="heading"
            bold
            style={{ color: metricColor, lineHeight: 24 }}
          >
            {displayValue}
          </AppText>
          <AppText variant="caption" color="textMuted">
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
