/**
 * @layer Core (Components)
 * @responsibility Themed text input with label, icon, unit suffix, helper text,
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { useTheme } from '../theme';
import AppText from './AppText';

/**
 * Styled text input bound entirely to design system tokens.
 *
 * @param {object} props
 * @param {string} props.label Field label shown above the input.
 * @param {string} [props.value] Controlled input value.
 * @param {Function} [props.onChangeText] Change handler.
 * @param {string} [props.placeholder] Placeholder text.
 * @param {string} [props.iconName] MaterialCommunityIcons name shown on the left.
 * @param {string} [props.unit] Unit suffix shown on the right (e.g. 'ml', 'kcal').
 * @param {string} [props.helperText] Hint text shown below input when no error.
 * @param {string} [props.error] Inline error message; replaces helperText when set.
 * @param {boolean} [props.numeric=false] Use numeric keyboard type.
 * @param {boolean} [props.disabled=false] Prevents editing.
 * @param {string} props.accessibilityLabel Accessibility label for the input.
 * @param {object} [props.style] Additional outer container styles.
 * @returns {React.JSX.Element}
 */
export default function AppTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  iconName,
  unit,
  helperText,
  error,
  numeric = false,
  disabled = false,
  accessibilityLabel,
  style,
  ...rest
}) {
  const { colors, spacing, radius, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  const hasError = !!error;
  const borderColor = hasError
    ? colors.error
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={[styles.wrapper, style]}>
      {/* Label */}
      {label && (
        <AppText
          variant="caption"
          color={hasError ? 'error' : 'textMuted'}
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </AppText>
      )}

      {/* Input row */}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: disabled ? colors.surfaceAlt : colors.surface,
            borderColor,
            borderRadius: radius.sm,
            borderWidth: 1.5,
            paddingHorizontal: spacing.sm,
            minHeight: 48,
          },
        ]}
      >
        {iconName && (
          <MaterialCommunityIcons
            name={iconName}
            size={20}
            color={focused ? colors.primary : colors.textMuted}
            style={{ marginRight: spacing.xs }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        )}

        <TextInput
          style={[
            styles.input,
            typography.body,
            {
              color: colors.text,
              flex: 1,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={numeric ? 'number-pad' : 'default'}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={helperText}
          {...rest}
        />

        {unit && (
          <AppText
            variant="caption"
            color="textMuted"
            style={{ marginLeft: spacing.xs }}
          >
            {unit}
          </AppText>
        )}
      </View>

      {/* Helper / Error text */}
      {(error || helperText) && (
        <AppText
          variant="caption"
          color={hasError ? 'error' : 'textMuted'}
          style={{ marginTop: spacing.xs }}
          accessibilityLiveRegion={hasError ? 'assertive' : 'none'}
          accessibilityLabel={hasError ? `Error: ${error}` : helperText}
        >
          {error || helperText}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    paddingVertical: 10,
  },
});
