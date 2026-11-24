/**
 * @layer Presentation (Settings Screen)
 * @responsibility Pure UI view for application configuration, theme mode, and database management.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  AppText,
  AppCard,
  AppButton,
  QuickChip,
  showSuccessToast,
  showErrorToast,
} from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { seedDatabase } from '../../../core/database';
import { useRecordsStore } from '../../records/viewmodel';

/**
 * Settings and preferences screen component.
 * @returns {React.JSX.Element} Rendered settings screen.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { colors, spacing, themeMode, setThemeMode, isDark } = useTheme();

  const loadRecords = useRecordsStore((state) => state.loadRecords);
  const loadTodayTotals = useRecordsStore((state) => state.loadTodayTotals);

  async function handleReSeed() {
    try {
      await seedDatabase(true);
      await Promise.all([loadRecords(), loadTodayTotals()]);
      showSuccessToast('Database seeded with 10-day test records!');
    } catch (err) {
      showErrorToast(`Failed to seed data: ${err?.message}`);
    }
  }

  return (
    <ScreenContainer scroll padded>
      {/* ── Screen Header ── */}
      <View style={[styles.header, { marginBottom: spacing.lg }]}>
        <AppText variant="caption" color="textMuted">
          Preferences
        </AppText>
        <AppText variant="title" bold style={{ marginTop: 2 }}>
          Settings ⚙️
        </AppText>
      </View>

      {/* ── Theme & Appearance ── */}
      <AppCard style={{ marginBottom: spacing.lg }}>
        <AppText variant="heading" bold style={{ marginBottom: spacing.xs }}>
          Appearance
        </AppText>
        <AppText variant="body" color="textMuted" style={{ marginBottom: spacing.md }}>
          Current mode: {themeMode} ({isDark ? 'Dark' : 'Light'})
        </AppText>
        <View style={styles.chipsRow}>
          {['system', 'light', 'dark'].map((mode) => (
            <QuickChip
              key={mode}
              label={mode.charAt(0).toUpperCase() + mode.slice(1)}
              selected={themeMode === mode}
              onPress={() => setThemeMode(mode)}
              accessibilityLabel={`Select ${mode} theme mode`}
              style={{ marginRight: spacing.sm }}
            />
          ))}
        </View>
      </AppCard>

      {/* ── Daily Goals Placeholder ── */}
      <AppCard style={{ marginBottom: spacing.lg }}>
        <AppText variant="heading" bold style={{ marginBottom: spacing.xs }}>
          Daily Goals
        </AppText>
        <AppText variant="body" color="textMuted" style={{ marginBottom: spacing.sm }}>
          Standard targets: 10,000 steps • 500 kcal • 2,000 ml
        </AppText>
        <AppText variant="caption" color="textMuted">
          Custom goal adjustments will be fully configurable here.
        </AppText>
      </AppCard>

      {/* ── Data & Diagnostics ── */}
      <AppCard style={{ marginBottom: spacing.lg }}>
        <AppText variant="heading" bold style={{ marginBottom: spacing.xs }}>
          Database & Developer Tools
        </AppText>
        <AppText variant="body" color="textMuted" style={{ marginBottom: spacing.md }}>
          Manage sample dataset or run CRUD test verification.
        </AppText>
        <View style={styles.actionsCol}>
          <AppButton
            label="Re-seed Sample Data"
            variant="secondary"
            iconName="database-refresh"
            onPress={handleReSeed}
            accessibilityLabel="Re-seed SQLite database with dummy data"
            style={{ marginBottom: spacing.sm }}
          />
          <AppButton
            label="Open Dev & CRUD Gallery"
            variant="text"
            iconName="flask-outline"
            onPress={() => router.push('/dev-gallery')}
            accessibilityLabel="Open developer component gallery and CRUD test runner"
          />
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionsCol: {
    flexDirection: 'column',
  },
});
