/**
 * @layer Presentation (Settings Screen)
 * @responsibility Pure UI screen for customizing daily health goals, app-wide theme mode,
 *                app version metadata, and sample database tools.
 *
 * RULES APPLIED:
 *   - UI only; validation, state, and SQLite persistence run through `useSettingsStore`.
 *   - Keyboard avoiding, next-field focus, inline validation, and calm design tokens.
 */
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import appConfig from '../../../../app.json';
import {
  AppButton,
  AppCard,
  AppText,
  AppTextInput,
  ScreenContainer,
  showErrorToast,
  showSuccessToast,
} from '../../../core/components';
import { seedDatabase } from '../../../core/database';
import { METRICS, useTheme } from '../../../core/theme';
import { useRecordsStore } from '../../records/viewmodel';
import { ThemeSegmentedControl } from '../components';
import { DEFAULT_GOALS, getGoalRangeHint } from '../model';
import { useSettingsStore } from '../viewmodel';

const APP_VERSION = Constants.expoConfig?.version || appConfig?.expo?.version || '1.0.0';
const APP_NAME = Constants.expoConfig?.name || appConfig?.expo?.name || 'HealthMate';

const GOAL_FIELDS = [
  {
    key: 'steps',
    label: 'Steps',
    placeholder: 'e.g. 10000',
    a11yLabel: 'Daily steps goal',
  },
  {
    key: 'calories',
    label: 'Calories Burned',
    placeholder: 'e.g. 500',
    a11yLabel: 'Daily active calories goal',
  },
  {
    key: 'water',
    label: 'Water (ml)',
    placeholder: 'e.g. 2000',
    a11yLabel: 'Daily water intake goal in millilitres',
  },
];

/**
 * Settings and preferences screen component.
 *
 * @returns {React.JSX.Element} Rendered settings screen.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { colors, spacing, radius, touchTarget, isDark } = useTheme();

  // ViewModel store state & actions
  const dailyGoals = useSettingsStore((state) => state.dailyGoals);
  const themeMode = useSettingsStore((state) => state.themeMode);
  const isSavingGoals = useSettingsStore((state) => state.isSavingGoals);
  const saveDailyGoals = useSettingsStore((state) => state.saveDailyGoals);
  const resetDailyGoals = useSettingsStore((state) => state.resetDailyGoals);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);

  const loadRecords = useRecordsStore((state) => state.loadRecords);
  const loadTodayTotals = useRecordsStore((state) => state.loadTodayTotals);

  // Local draft values for numeric goal inputs
  const [drafts, setDrafts] = useState({
    steps: String(dailyGoals.steps),
    calories: String(dailyGoals.calories),
    water: String(dailyGoals.water),
  });
  const [errors, setErrors] = useState({});
  const [isSeeding, setIsSeeding] = useState(false);

  // Focus refs for keyboard next-field progression
  const caloriesRef = useRef(null);
  const waterRef = useRef(null);
  const fieldRefs = {
    steps: null,
    calories: caloriesRef,
    water: waterRef,
  };

  // Sync draft form values whenever persisted goals update (startup load / save / reset)
  useEffect(() => {
    setDrafts({
      steps: String(dailyGoals.steps),
      calories: String(dailyGoals.calories),
      water: String(dailyGoals.water),
    });
    setErrors({});
  }, [dailyGoals]);

  function handleGoalChange(key, value) {
    setDrafts((prev) => ({ ...prev, [key]: value }));
    if (errors[key] || errors.form) {
      setErrors((prev) => ({ ...prev, [key]: null, form: null }));
    }
  }

  async function handleSaveGoals() {
    setErrors({});
    const result = await saveDailyGoals(drafts);

    if (result.success) {
      showSuccessToast('Daily goals saved!');
    } else if (result.errors) {
      setErrors(result.errors);
      if (result.errors.form) {
        showErrorToast(result.errors.form);
      }
    }
  }

  async function handleResetDefaults() {
    setErrors({});
    const result = await resetDailyGoals();
    if (result.success) {
      showSuccessToast('Daily goals reset to defaults.');
    } else if (result.errors?.form) {
      showErrorToast(result.errors.form);
    }
  }

  async function handleSelectTheme(mode) {
    if (mode === themeMode) return;
    const result = await setThemeMode(mode);
    if (result.success) {
      const label = mode.charAt(0).toUpperCase() + mode.slice(1);
      showSuccessToast(`Appearance set to ${label} mode.`);
    } else {
      showErrorToast(result.error || 'Could not save theme preference.');
    }
  }

  async function handleReSeed() {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      await seedDatabase(true);
      await Promise.all([loadRecords(), loadTodayTotals()]);
      showSuccessToast('Database seeded with 10-day test records!');
    } catch (err) {
      showErrorToast(`Failed to seed data: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSeeding(false);
    }
  }

  const isDefaultGoals =
    String(drafts.steps).trim() === String(DEFAULT_GOALS.steps) &&
    String(drafts.calories).trim() === String(DEFAULT_GOALS.calories) &&
    String(drafts.water).trim() === String(DEFAULT_GOALS.water);

  const appearanceSummary =
    themeMode === 'system'
      ? `Following system setting (currently ${isDark ? 'Dark' : 'Light'})`
      : `Using ${isDark ? 'Dark' : 'Light'} theme across the app`;

  return (
        <ScreenContainer
          scroll
          padded
          edges={['top', 'left', 'right']}
          contentContainerStyle={{ paddingBottom: spacing.xxxl * 1.5 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            {/* ── Screen Header ── */}
            <View style={[styles.header, { paddingTop: spacing.sm, marginBottom: spacing.lg }]}>
              <AppText variant="caption" color="textMuted">
                Preferences
              </AppText>
              <AppText variant="title" bold accessibilityRole="header" style={{ marginTop: 2 }}>
                Settings
              </AppText>
            </View>

              {/* ── Daily Goals Card ── */}
              <AppCard style={{ marginBottom: spacing.lg }}>
                <AppText variant="heading" bold accessibilityRole="header" style={{ marginBottom: spacing.xs }}>
                  Daily goals
                </AppText>
                <AppText
                  variant="body"
                  color="textMuted"
                  style={{ marginBottom: spacing.md }}
                >
                  Set personal targets for your Dashboard summary and progress rings.
                </AppText>

                {GOAL_FIELDS.map((field, index) => {
                  const metric = METRICS[field.key];
                  const isLast = index === GOAL_FIELDS.length - 1;
                  const nextField = !isLast ? GOAL_FIELDS[index + 1] : null;
                  const nextRef = nextField ? fieldRefs[nextField.key] : null;

                  return (
                    <AppTextInput
                      key={field.key}
                      inputRef={fieldRefs[field.key]}
                      label={field.label}
                      value={drafts[field.key]}
                      onChangeText={(text) => handleGoalChange(field.key, text)}
                      placeholder={field.placeholder}
                      iconName={metric.icon}
                      iconColor={colors[metric.colorKey]}
                      unit={metric.unit}
                      helperText={getGoalRangeHint(field.key)}
                      error={errors[field.key]}
                      numeric
                      returnKeyType={isLast ? 'done' : 'next'}
                      blurOnSubmit={isLast}
                      onSubmitEditing={
                        isLast ? handleSaveGoals : () => nextRef?.current?.focus()
                      }
                      accessibilityLabel={field.a11yLabel}
                      style={{ marginBottom: isLast ? spacing.lg : spacing.md }}
                    />
                  );
                })}

                <AppButton
                  label="Save Goals"
                  variant="primary"
                  iconName="check"
                  loading={isSavingGoals}
                  onPress={handleSaveGoals}
                  accessibilityLabel="Save daily goals"
                />

                {!isDefaultGoals && (
                  <AppButton
                    label="Reset to Defaults"
                    variant="text"
                    iconName="restore"
                    disabled={isSavingGoals}
                    onPress={handleResetDefaults}
                    accessibilityLabel="Reset daily goals to default values"
                    style={{ marginTop: spacing.xs }}
                  />
                )}
              </AppCard>

              {/* ── Appearance Card ── */}
              <AppCard style={{ marginBottom: spacing.lg }}>
                <AppText variant="heading" bold accessibilityRole="header" style={{ marginBottom: spacing.xs }}>
                  Appearance
                </AppText>
                <AppText
                  variant="body"
                  color="textMuted"
                  style={{ marginBottom: spacing.md }}
                >
                  {appearanceSummary}
                </AppText>
                <ThemeSegmentedControl
                  value={themeMode}
                  onChange={handleSelectTheme}
                />
              </AppCard>

                  {/* ── About HealthMate Card ── */}
                  <AppCard style={{ marginBottom: spacing.lg }}>
                    <View style={[styles.aboutHeader, { marginBottom: spacing.sm }]}>
                      <View
                        style={[
                          styles.aboutIconBadge,
                          {
                            width: touchTarget.min,
                            height: touchTarget.min,
                            backgroundColor: colors.surfaceAlt,
                            borderRadius: radius.button,
                            marginRight: spacing.sm,
                          },
                        ]}
                        accessibilityElementsHidden
                        importantForAccessibility="no"
                      >
                        <MaterialCommunityIcons
                          name="heart-pulse"
                          size={22}
                          color={colors.primary}
                        />
                      </View>
                  <View style={styles.aboutTitleCol}>
                    <AppText variant="heading" bold accessibilityRole="header">
                      About {APP_NAME}
                    </AppText>
                    <AppText variant="caption" color="primary" bold>
                      Version {APP_VERSION}
                    </AppText>
                  </View>
                </View>
                <AppText variant="body" color="textMuted">
                  Calm daily tracking for steps, active calories burned, and hydration.
                  Your records and preferences stay privately in your device SQLite database.
                </AppText>
              </AppCard>

                {/* ── Data & Developer Tools (retained until cleanup) ── */}
                <AppCard style={{ marginBottom: spacing.md }}>
                  <AppText variant="heading" bold accessibilityRole="header" style={{ marginBottom: spacing.xs }}>
                    Database & Developer Tools
                  </AppText>
                  <AppText
                    variant="body"
                    color="textMuted"
                    style={{ marginBottom: spacing.md }}
                  >
                    Manage sample dataset or run CRUD test verification.
                  </AppText>
                  <View style={styles.actionsCol}>
                    <AppButton
                      label="Re-seed Sample Data"
                      variant="secondary"
                      iconName="database-refresh"
                      loading={isSeeding}
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
              </KeyboardAvoidingView>
            </ScreenContainer>
            );
}

            const styles = StyleSheet.create({
              keyboardAvoid: {
              flex: 1,
  },
            header: {
            width: '100%',
  },
            aboutHeader: {
              flexDirection: 'row',
            alignItems: 'center',
  },
            aboutIconBadge: {
              alignItems: 'center',
            justifyContent: 'center',
  },
            aboutTitleCol: {
              flex: 1,
            flexShrink: 1,
  },
            actionsCol: {
              flexDirection: 'column',
  },
});
