/**
 * @layer app (Tabs Navigation Layout)
 * @responsibility Bottom tab navigator layout configuring Home, History, and Settings tabs.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../src/core/theme';

/**
 * Bottom tabs navigator layout.
 * @returns {React.JSX.Element} Rendered tab navigator.
 */
export default function TabsLayout() {
  const { colors, spacing, typography } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          minHeight: 62,
          paddingBottom: spacing.sm,
          paddingTop: spacing.xs + 2,
        },
        tabBarLabelStyle: {
          fontSize: typography.caption.fontSize - 1,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-clock-outline"
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cog-outline"
              size={size || 24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
