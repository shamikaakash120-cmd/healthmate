/**
 * @layer app (Root Navigation Layout)
 * @responsibility Root navigation stack layout ensuring database initialization before rendering screens.
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { initDatabase } from '../src/core/database';
import { LoadingState, ErrorState, Toast } from '../src/core/components';
import { useTheme } from '../src/core/theme';

/**
 * Root stack layout.
 * Awaits local database readiness before exposing child application routes.
 *
 * @returns {React.JSX.Element} The rendered navigation stack or startup state.
 */
export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  /**
   * Initializes the SQLite database.
   */
  async function setup() {
    try {
      setDbError(null);
      await initDatabase();
      setIsDbReady(true);
    } catch (err) {
      setDbError(err?.message || 'Could not connect to the local database.');
    }
  }

  useEffect(() => {
    setup();
  }, []);

  // While database migrations run, present a calming loading state
  if (!isDbReady) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        {dbError ? (
          <ErrorState message={dbError} onRetry={setup} />
        ) : (
          <LoadingState label="Preparing HealthMate..." />
        )}
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="dev-gallery" />
      </Stack>
      {/* Global toast notification layer */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
