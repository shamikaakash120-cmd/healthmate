/**
 * @layer Presentation (Settings Components)
 * @responsibility Three-option accessible segmented control for choosing app theme mode.
 */
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../../../core/components';
import { useTheme } from '../../../core/theme';

const THEME_OPTIONS = Object.freeze([
  { value: 'system', label: 'System', icon: 'theme-light-dark' },
  { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
  { value: 'dark', label: 'Dark', icon: 'weather-night' },
]);

/**
 * Renders a three-segment control for System, Light, and Dark appearance modes.
 *
 * @param {object} props
 * @param {'system'|'light'|'dark'} props.value Active theme mode.
 * @param {(mode: 'system'|'light'|'dark') => void} props.onChange Selection callback.
 * @returns {React.JSX.Element} Segmented control UI.
 */
export default function ThemeSegmentedControl({ value, onChange }) {
  const { colors, radius, spacing } = useTheme();

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
          borderRadius: radius.button,
          padding: spacing.xs,
        },
      ]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Theme appearance options"
    >
      {THEME_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const foreground = isSelected ? colors.primaryText : colors.textMuted;

        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.75}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${option.label} theme`}
            style={[
              styles.segment,
              {
                borderRadius: radius.button - 3,
                backgroundColor: isSelected ? colors.primary : 'transparent',
                paddingHorizontal: spacing.sm,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={18}
              color={foreground}
              style={{ marginRight: spacing.xs }}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <AppText
              variant="caption"
              bold={isSelected}
              numberOfLines={1}
              style={{
                color: foreground,
                fontSize: 13,
              }}
            >
              {option.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
