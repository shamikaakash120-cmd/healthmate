/**
 * @layer app (Root Navigation Layout)
 * @responsibility Root navigation stack layout configuring application screens.
 */
import React from 'react';
import { Stack } from 'expo-router';

/**
 * Root stack navigation layout.
 * @returns {React.JSX.Element} The rendered navigation stack.
 */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
