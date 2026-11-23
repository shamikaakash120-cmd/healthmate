/**
 * @layer Core (Components)
 * @responsibility Themed text component bound to the design system type scale.
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

/**
 * Renders text using a named variant from the type scale.
 * All color and size values come exclusively from theme tokens.
 *
 * @param {object} props
 * @param {'display'|'title'|'heading'|'body'|'caption'|'metricNumber'} [props.variant='body'] Type scale variant.
 * @param {'text'|'textMuted'|'primary'|'error'|'success'|'primaryText'} [props.color='text'] Color token key.
 * @param {boolean} [props.bold=false] Override font weight to bold (700).
 * @param {'left'|'center'|'right'} [props.align='left'] Text alignment.
 * @param {object} [props.style] Additional custom styles.
 * @param {string} [props.accessibilityLabel] Accessibility label.
 * @param {React.ReactNode} props.children Text content.
 * @returns {React.JSX.Element}
 */
export default function AppText({
  variant = 'body',
  color = 'text',
  bold = false,
  align = 'left',
  style,
  accessibilityLabel,
  children,
  ...rest
}) {
  const { colors, typography } = useTheme();
  const typeStyle = typography[variant] || typography.body;

  return (
    <Text
      style={[
        typeStyle,
        {
          color: colors[color] || colors.text,
          textAlign: align,
          fontWeight: bold ? '700' : typeStyle.fontWeight,
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      {...rest}
    >
      {children}
    </Text>
  );
}
