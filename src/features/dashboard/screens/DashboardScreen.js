/**
 * @layer Presentation (Dashboard Screen)
 * @responsibility Pure UI view presenting the HealthMate dashboard summary.
 */
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../../../core/theme';

/**
 * Main dashboard screen component.
 * @returns {React.JSX.Element} Dashboard screen interface.
 */
export default function DashboardScreen() {
  const { colors, typography, spacing, radius, shadow, isDark } = useTheme();

  return (
          <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <StatusBar
              barStyle={isDark ? 'light-content' : 'dark-content'}
              backgroundColor={colors.background}
            />
            <View style={[styles.container, { padding: spacing.lg }]}>
              <View
                style={[
                  styles.card,
                  shadow,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: radius.card,
                    padding: spacing.xl,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    styles.badge,
                    { color: colors.primary, marginBottom: spacing.sm },
                  ]}
                >
                  Health & Wellness Tracker
                </Text>
                <Text
                  style={[
                    typography.display,
                    styles.title,
                    { color: colors.text, marginBottom: spacing.sm },
                  ]}
                >
                  HealthMate
                </Text>
                <Text
                  style={[
                    typography.body,
                    styles.subtitle,
                    { color: colors.textMuted },
                  ]}
                >
                  Welcome! Your daily health companion is ready.
                </Text>
              </View>
            </View>
          </SafeAreaView>
          );
}

          const styles = StyleSheet.create({
            safeArea: {
            flex: 1,
  },
          container: {
            flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
  },
          card: {
            width: '100%',
          maxWidth: 360,
          alignItems: 'center',
  },
          badge: {
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 1,
  },
          title: {
          textAlign: 'center',
  },
          subtitle: {
          textAlign: 'center',
  },
});
