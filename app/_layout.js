/**
 * @layer app (Root Navigation Layout)
 * @responsibility Root navigation stack layout ensuring database initialization and seeding before rendering screens.
 */
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { ErrorState, LoadingState, Toast } from '../src/core/components';
import { initDatabase, seedDatabase } from '../src/core/database';
import { useTheme } from '../src/core/theme';

/**
 * Root stack layout.
 * Awaits local database readiness and seed population before exposing child application routes.
 *
 * @returns {React.JSX.Element} The rendered navigation stack or startup state.
 */
export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  /**
   * Initializes the SQLite database and populates initial seed data if empty.
   */
  async function setup() {
    try {
      setDbError(null);
      await initDatabase();
      await seedDatabase();
      setIsDbReady(true);
    } catch (err) {
      setDbError(err?.message || 'Could not connect to the local database.');
    }
  }

  useEffect(() => {
    setup();
  }, []);

  // While database migrations & seeding run, present a calming loading state
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
