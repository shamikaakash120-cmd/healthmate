/**
 * @layer app (Root Navigation Layout)
 * @responsibility Root navigation stack layout ensuring database initialization, global toast mounting, and modal routing.
 */
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { ErrorState, LoadingState, Toast } from '../src/core/components';
import { initDatabase, seedDatabase } from '../src/core/database';
import { useTheme } from '../src/core/theme';
import { useSettingsStore } from '../src/features/settings/viewmodel';

/**
 * Root navigation layout responsible for database setup, startup settings hydration,
 * modal routes, and global Toast mounting.
 *
 * @returns {React.JSX.Element}
 */
export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  // Initializes the SQLite database, seeds initial data if empty, and loads persisted settings.
  async function setup() {
    try {
      setDbError(null);
      await initDatabase();
      await seedDatabase();
      await useSettingsStore.getState().loadSettings();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Main bottom tabs group */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Modal form for adding or editing health records */}
        <Stack.Screen
          name="record-form"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>

      {/* Global snackbar / toast notifications */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
