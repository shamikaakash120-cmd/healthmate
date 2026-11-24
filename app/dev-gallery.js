/**
 * @layer app (Dev Gallery – TEMPORARY)
 * @responsibility Visual consistency check for all core components in light & dark,
 *                plus live database CRUD diagnostics.
 *                Delete this file and its tab entry before final submission.
 */
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native';

import {
  AppText,
  AppCard,
  AppButton,
  AppTextInput,
  MetricCard,
  ProgressRing,
  QuickChip,
  EmptyState,
  LoadingState,
  ErrorState,
  Toast,
  showSuccessToast,
  showErrorToast,
  FloatingActionButton,
} from '../src/core/components';
import { useTheme } from '../src/core/theme';
import { runCrudTest, seedDatabase } from '../src/core/database';

/** Thin divider with section title */
function Section({ title }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
      <AppText variant="caption" color="textMuted" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </AppText>
      <View style={{ height: 1, backgroundColor: colors.border, marginTop: spacing.xs }} />
    </View>
  );
}

export default function DevGallery() {
  const { colors, spacing, isDark, setThemeMode, themeMode } = useTheme();

  // Local state for interactive demos
  const [inputValue, setInputValue] = useState('');
  const [crudLogs, setCrudLogs] = useState([]);
  const [testingCrud, setTestingCrud] = useState(false);

    async function handleRunCrud() {
      setTestingCrud(true);
      try {
        const result = await runCrudTest();
        setCrudLogs(result.results);
        if (result.success) {
          showSuccessToast('CRUD verification passed! Check console & log card.');
        } else {
          showErrorToast(`CRUD test failed: ${result.error}`);
        }
      } catch (err) {
        showErrorToast(`Unexpected test failure: ${err?.message}`);
      } finally {
        setTestingCrud(false);
      }
    }

    async function handleReSeed() {
      try {
        await seedDatabase(true);
        showSuccessToast('Database re-seeded with fresh 10-day test records!');
      } catch (err) {
        showErrorToast(`Seeding error: ${err?.message}`);
      }
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Toast overlay */}
        <Toast />

        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: spacing.xxxl + 56,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <AppText variant="display" bold style={{ marginBottom: spacing.xs }}>
            Dev Gallery
          </AppText>
          <AppText variant="body" color="textMuted" style={{ marginBottom: spacing.lg }}>
            Visual inspection of all core components in {isDark ? 'dark 🌙' : 'light ☀️'} mode.
          </AppText>

          {/* Theme Toggle */}
          <View style={styles.row}>
            {['system', 'light', 'dark'].map((mode) => (
              <QuickChip
                key={mode}
                label={mode}
                selected={themeMode === mode}
                onPress={() => setThemeMode(mode)}
                accessibilityLabel={`Switch to ${mode} theme`}
                style={{ marginRight: spacing.sm }}
              />
            ))}
          </View>

          {/* ── Database & CRUD Diagnostics ── */}
          <Section title="Database & CRUD Diagnostics" />
          <AppCard style={{ marginBottom: spacing.sm }}>
            <AppText variant="heading" style={{ marginBottom: spacing.xs }}>
              SQLite Live Verification
            </AppText>
            <AppText variant="body" color="textMuted" style={{ marginBottom: spacing.md }}>
              Run end-to-end parameterised SQL tests: Create test record, Read by ID/Date/Totals, Update, and Delete with cleanup.
            </AppText>
            <View style={[styles.row, { marginBottom: spacing.sm }]}>
              <AppButton
                label={testingCrud ? 'Running Tests…' : 'Run CRUD Test'}
                variant="primary"
                iconName="database-check"
                loading={testingCrud}
                onPress={handleRunCrud}
                accessibilityLabel="Run complete CRUD database test"
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <AppButton
                label="Re-seed Data"
                variant="secondary"
                iconName="database-plus"
                onPress={handleReSeed}
                accessibilityLabel="Re-seed dummy health records"
              />
            </View>
            {crudLogs.length > 0 && (
              <View
                style={{
                  backgroundColor: colors.surfaceAlt,
                  padding: spacing.sm,
                  borderRadius: 8,
                  marginTop: spacing.sm,
                }}
              >
                {crudLogs.map((line, idx) => (
                  <AppText
                    key={idx}
                    variant="caption"
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 11,
                      lineHeight: 16,
                      color: line.includes('❌') ? colors.error : line.includes('✅') ? colors.success : colors.text,
                    }}
                  >
                    {line}
                  </AppText>
                ))}
              </View>
            )}
          </AppCard>

          {/* ── Typography ── */}
          <Section title="Typography" />
          {['display', 'title', 'heading', 'body', 'caption', 'metricNumber'].map((v) => (
            <AppText key={v} variant={v} style={{ marginBottom: spacing.xs }}>
              {v.charAt(0).toUpperCase() + v.slice(1)} — The quick brown fox
            </AppText>
          ))}

          {/* ── AppCard ── */}
          <Section title="AppCard" />
          <AppCard accessibilityLabel="Sample card">
            <AppText variant="heading">Card Title</AppText>
            <AppText variant="body" color="textMuted">
              Soft shadow, radius 20, surface color adapts to theme.
            </AppText>
          </AppCard>

          {/* ── AppButton variants ── */}
          <Section title="AppButton" />
          <View style={styles.col}>
            <AppButton label="Primary" variant="primary" onPress={() => { }} accessibilityLabel="Primary button" style={{ marginBottom: spacing.sm }} />
            <AppButton label="Secondary" variant="secondary" onPress={() => { }} accessibilityLabel="Secondary button" style={{ marginBottom: spacing.sm }} />
            <AppButton label="Text / Link" variant="text" onPress={() => { }} accessibilityLabel="Text button" style={{ marginBottom: spacing.sm }} />
            <AppButton label="Destructive" variant="destructive" onPress={() => { }} accessibilityLabel="Destructive button" style={{ marginBottom: spacing.sm }} />
            <AppButton label="With icon" variant="primary" iconName="plus" onPress={() => { }} accessibilityLabel="Button with icon" style={{ marginBottom: spacing.sm }} />
            <AppButton label="Loading…" variant="primary" loading onPress={() => { }} accessibilityLabel="Loading button" style={{ marginBottom: spacing.sm }} />
            <AppButton label="Disabled" variant="primary" disabled onPress={() => { }} accessibilityLabel="Disabled button" />
          </View>

          {/* ── AppTextInput ── */}
          <Section title="AppTextInput" />
          <AppTextInput
            label="Steps today"
            value={inputValue}
            onChangeText={(t) => setInputValue(t)}
            placeholder="e.g. 7500"
            iconName="walk"
            unit="steps"
            helperText="Enter your total steps for the day"
            numeric
            accessibilityLabel="Steps today input"
            style={{ marginBottom: spacing.md }}
          />
          <AppTextInput
            label="Water intake (error state)"
            value=""
            onChangeText={() => { }}
            placeholder="e.g. 500"
            iconName="water"
            unit="ml"
            error="Please enter a valid amount (1 – 20000 ml)"
            numeric
            accessibilityLabel="Water intake error example"
            style={{ marginBottom: spacing.md }}
          />
          <AppTextInput
            label="Disabled field"
            value="8000"
            onChangeText={() => { }}
            iconName="fire"
            unit="kcal"
            disabled
            accessibilityLabel="Disabled input example"
          />

          {/* ── MetricCards ── */}
          <Section title="MetricCard" />
          <View style={styles.row}>
            {['steps', 'calories', 'water'].map((key) => (
              <MetricCard
                key={key}
                metricKey={key}
                value={key === 'steps' ? 7452 : key === 'calories' ? 342 : 1750}
                style={{ flex: 1, marginRight: key !== 'water' ? spacing.sm : 0 }}
              />
            ))}
          </View>

          {/* ── ProgressRing ── */}
          <Section title="ProgressRing" />
          <View style={[styles.row, { justifyContent: 'space-around' }]}>
            <View style={{ alignItems: 'center' }}>
              <ProgressRing metricKey="steps" value={7452} goal={10000} size={110} />
              <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>Steps</AppText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <ProgressRing metricKey="calories" value={342} goal={500} size={110} />
              <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>Calories</AppText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <ProgressRing metricKey="water" value={1750} goal={2000} size={110} />
              <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.xs }}>Water</AppText>
            </View>
          </View>

          {/* ── QuickChip ── */}
          <Section title="QuickChip" />
          <View style={styles.row}>
            {['+250 ml', '+500 ml', '+1 L'].map((label) => (
              <QuickChip
                key={label}
                label={label}
                metricKey="water"
                onPress={() => showSuccessToast(`Added ${label}`)}
                accessibilityLabel={`Quick add ${label}`}
                style={{ marginRight: spacing.sm }}
              />
            ))}
          </View>
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            {['+500', '+1000', '+2000'].map((label, i) => (
              <QuickChip
                key={label}
                label={`${label} steps`}
                metricKey="steps"
                selected={i === 1}
                onPress={() => { }}
                accessibilityLabel={`Quick add ${label} steps`}
                style={{ marginRight: spacing.sm }}
              />
            ))}
          </View>

          {/* ── Toast ── */}
          <Section title="Toast / Snackbar" />
          <View style={styles.row}>
            <AppButton
              label="Success toast"
              variant="secondary"
              iconName="check-circle-outline"
              onPress={() => showSuccessToast('Record saved successfully! 🎉')}
              accessibilityLabel="Show success toast"
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <AppButton
              label="Error toast"
              variant="destructive"
              iconName="alert-circle-outline"
              onPress={() => showErrorToast('Could not save. Please try again.')}
              accessibilityLabel="Show error toast"
              style={{ flex: 1 }}
            />
          </View>

          {/* ── EmptyState ── */}
          <Section title="EmptyState" />
          <AppCard noPad>
            <EmptyState
              iconName="clipboard-text-outline"
              title="No records yet"
              hint="Nice start! Tap the + button to log your first health record."
              actionLabel="Add first record"
              onAction={() => showSuccessToast('Opening form…')}
            />
          </AppCard>

          {/* ── LoadingState ── */}
          <Section title="LoadingState" />
          <AppCard style={{ height: 160, justifyContent: 'center' }}>
            <LoadingState label="Fetching your records…" />
          </AppCard>

          {/* ── ErrorState ── */}
          <Section title="ErrorState" />
          <AppCard style={{ height: 220, justifyContent: 'center' }}>
            <ErrorState
              message="Unable to load records. Check your storage permissions."
              onRetry={() => showSuccessToast('Retrying…')}
            />
          </AppCard>
        </ScrollView>

        {/* ── FloatingActionButton ── */}
        <FloatingActionButton
          iconName="plus"
          onPress={() => showSuccessToast('FAB pressed!')}
          accessibilityLabel="Add new health record"
        />
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    col: {
      flexDirection: 'column',
    },
  });
