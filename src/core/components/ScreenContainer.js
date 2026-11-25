/**
 * @layer Core (Components)
 * @responsibility Safe-area aware screen wrapper with optional scroll and consistent padding.
 */
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '../theme';

/**
 * Wraps every screen in a safe-area container with the correct background color.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children Screen content.
 * @param {boolean} [props.scroll=false] Enable vertical scrolling.
 * @param {boolean} [props.padded=true] Apply horizontal+vertical padding from spacing.lg.
 * @param {Array<'top'|'right'|'bottom'|'left'>} [props.edges] Safe area edges to apply.
 * @param {object} [props.style] Additional styles for the inner container.
 * @param {object} [props.contentContainerStyle] Additional styles for ScrollView content.
 * @param {React.ReactElement} [props.refreshControl] Optional RefreshControl for pull-to-refresh when scroll is true.
 * @returns {React.JSX.Element}
 */
export default function ScreenContainer({
  children,
  scroll = false,
  padded = true,
  edges,
  style,
  contentContainerStyle,
  refreshControl,
}) {
  const { colors, spacing, isDark } = useTheme();

  const paddingStyle = padded ? { padding: spacing.lg } : {};

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[paddingStyle, { paddingBottom: spacing.xxxl }, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, paddingStyle, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
});
