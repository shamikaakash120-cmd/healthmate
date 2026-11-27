/**
 * @layer Core (Components)
 * @responsibility SVG circular progress ring with metric color fill and smooth 300ms animation.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme';
import AppText from './AppText';

/**
 * Renders a circular progress ring that animates from 0 to the current progress ratio over 300ms.
 *
 * @param {object} props
 * @param {string} props.metricKey Key into METRICS config ('steps'|'calories'|'water').
 * @param {number} props.value Current value.
 * @param {number} props.goal Target / goal value.
 * @param {number} [props.size=120] Diameter of the ring in dp.
 * @param {number} [props.strokeWidth=10] Width of the progress stroke.
 * @param {boolean} [props.showCentreText=true] Show value and unit inside the ring.
 * @param {string} [props.accessibilityLabel] Override accessibility description.
 * @returns {React.JSX.Element | null}
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

  const numericValue = Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const progress = config && goal > 0 ? Math.min(numericValue / goal, 1) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Drive plain <Circle> strokeDashoffset via React state synced from Animated.Value.
  // Avoids Animated.createAnimatedComponent(Circle), which passes collapsable={false}
  // to the DOM <circle> element on web and triggers a React 19 attribute warning.
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [animatedRatio, setAnimatedRatio] = useState(0);

  useEffect(() => {
    const listenerId = animatedProgress.addListener(({ value: nextValue }) => {
      setAnimatedRatio(nextValue);
    });

    const animation = Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    });
    animation.start();

    return () => {
      animatedProgress.removeListener(listenerId);
      animation.stop();
    };
  }, [animatedProgress, progress]);

  if (!config) return null;

  const metricColor = colors[config.colorKey];
  const trackColor = colors[config.tintKey];
  const strokeDashoffset = circumference * (1 - animatedRatio);

  const displayValue =
    numericValue >= 1000 ? `${(numericValue / 1000).toFixed(1)}k` : String(numericValue);

  const a11yLabel =
    accessibilityLabel ||
    `${config.label}: ${numericValue} of ${goal} ${config.unit}, ${Math.round(progress * 100)}% complete`;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel={a11yLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: goal, now: numericValue }}
    >
      {/* Rotate container -90deg so arc begins at 12 o'clock without using SVG `origin` prop (avoids React 19 web `transform-origin` warning) */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ rotate: '-90deg' }] },
        ]}
      >
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        <Circle
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
