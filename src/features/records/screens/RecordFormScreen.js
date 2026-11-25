/**
 * @layer Presentation (Records Screen)
 * @responsibility Modal form view for creating or editing health records with effortless input,
 *                quick-add chips, DateTimePicker integration, next-field focus, and inline validation.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AppButton,
  AppCard,
  AppText,
  AppTextInput,
  PressableScale,
  QuickChip,
  ScreenContainer,
  showSuccessToast,
} from '../../../core/components';
import { METRICS, useTheme } from '../../../core/theme';
import {
  formatDisplayDate,
  formatRelativeDay,
  parseISODate,
  today,
  toISODate,
} from '../../../core/utils/dateUtils';
import { safeGoBack } from '../../../core/utils/navigation';
import { useRecordsStore } from '../viewmodel';

/**
 * Health record entry form presented as a modal for both creating and editing entries.
 *
 * @returns {React.JSX.Element} The rendered form interface.
 */
export default function RecordFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recordId = params?.id ? Number(params.id) : null;
  const isEditing = Boolean(recordId);

  const { colors, spacing, radius, touchTarget } = useTheme();

  // ViewModel actions and state
  const addRecord = useRecordsStore((state) => state.addRecord);
  const editRecord = useRecordsStore((state) => state.editRecord);
  const getRecordForEdit = useRecordsStore((state) => state.getRecordForEdit);
  const isSaving = useRecordsStore((state) => state.lastSaveStatus === 'saving');

  // Input focus refs for effortless next-field navigation
  const caloriesRef = useRef(null);
  const waterRef = useRef(null);

  // Form field state
  const [date, setDate] = useState(today());
  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Prefill fields when editing an existing record
  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      if (recordId) {
        const existing = await getRecordForEdit(recordId);
        if (existing && isMounted) {
          setDate(existing.date);
          setSteps(String(existing.steps));
          setCalories(String(existing.calories));
          setWater(String(existing.water));
        }
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [recordId, getRecordForEdit]);

  /**
   * Increments an input field value by a given delta.
   *
   * @param {Function} setter React state setter function.
   * @param {string} fieldKey Name of the field for error clearing.
   * @param {string} currentValue Current field string value.
   * @param {number} delta Amount to increment.
   */
  const handleQuickAdd = (setter, fieldKey, currentValue, delta) => {
    const parsed = parseInt(currentValue, 10);
    const base = isNaN(parsed) ? 0 : parsed;
    const nextVal = String(Math.max(0, base + delta));
    setter(nextVal);
    if (errors[fieldKey]) {
      setErrors((prev) => ({ ...prev, [fieldKey]: null }));
    }
  };

  /**
   * Form submission handler. Validates and saves via the ViewModel store.
   */
  async function handleSubmit() {
    setErrors({});
    const input = {
      id: recordId,
      date,
      steps,
      calories,
      water,
    };

    const result = isEditing
      ? await editRecord(input)
      : await addRecord(input);

    if (result.success) {
      showSuccessToast('Entry saved. Great work!');
      safeGoBack(router);
    } else if (result.errors) {
      setErrors(result.errors);
    }
  }

  // Friendly date display string (e.g. "Today · Tue, 24 Nov 2026")
  const relativeDay = formatRelativeDay(date);
  const formattedDate = formatDisplayDate(date);
  const friendlyDateText =
    relativeDay === 'Today' || relativeDay === 'Yesterday'
      ? `${relativeDay} · ${formattedDate}`
      : formattedDate;

  return (
    <ScreenContainer scroll padded>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        {/* ── Modal Header ── */}
            <View style={[styles.modalHeader, { paddingTop: spacing.sm, gap: spacing.sm, marginBottom: spacing.lg }]}>
              <View style={styles.modalHeaderText}>
                <AppText variant="caption" color="textMuted">
                  {isEditing ? 'Health Record' : 'New Health Log'}
                </AppText>
                  <AppText variant="title" bold accessibilityRole="header" style={{ marginTop: 2 }}>
                    {isEditing ? 'Edit Entry' : 'Add Entry'}
                  </AppText>
              </View>
          <PressableScale
                onPress={() => safeGoBack(router)}
                scaleTo={0.93}
                duration={150}
                accessibilityLabel="Close form"
                accessibilityRole="button"
                style={[
                  styles.closeButton,
                  {
                    minWidth: touchTarget.min,
                    minHeight: touchTarget.min,
                    borderRadius: radius.pill,
                    backgroundColor: colors.surfaceAlt,
                  },
                ]}
              >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={colors.text}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            </PressableScale>
          </View>

          {/* ── Form Card ── */}
          <AppCard style={{ marginBottom: spacing.xl }}>
            {/* ── Date Field: Friendly Tappable Row ── */}
            <View style={[styles.fieldBlock, { marginBottom: spacing.lg }]}>
              <AppText
                variant="caption"
                color={errors.date ? 'error' : 'textMuted'}
                style={{ marginBottom: spacing.xs }}
              >
                Date
              </AppText>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowDatePicker(true)}
                accessibilityLabel={`Record date, currently ${friendlyDateText}. Tap to change.`}
                accessibilityRole="button"
                accessibilityHint="Opens date picker to select a date up to today"
                style={[
                  styles.dateRow,
                  {
                    backgroundColor: colors.surface,
                    borderColor: errors.date ? colors.error : colors.border,
                    borderRadius: radius.sm,
                    paddingHorizontal: spacing.md,
                  },
                ]}
              >
                <View style={styles.dateRowLeft}>
                  <View
                    style={[
                      styles.dateIconBadge,
                      {
                        width: spacing.xl,
                        height: spacing.xl,
                        marginRight: spacing.sm + 2,
                        backgroundColor: colors.surfaceAlt,
                        borderRadius: radius.sm,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="calendar-month"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <AppText variant="body" bold style={styles.dateLabelText}>
                    {friendlyDateText}
                  </AppText>
                </View>

                <View style={styles.dateRowRight}>
                  <AppText variant="caption" color="primary" bold>
                    Change
                  </AppText>
                  <MaterialCommunityIcons
                    name="calendar-edit"
                    size={18}
                    color={colors.primary}
                    style={{ marginLeft: 4 }}
                  />
                </View>

                {/* Web Native Date Picker overlay for effortless web usage */}
                {Platform.OS === 'web' && (
                  <input
                    type="date"
                    max={today()}
                    value={date}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDate(e.target.value);
                        if (errors.date) {
                          setErrors((prev) => ({ ...prev, date: null }));
                        }
                      }
                    }}
                    style={styles.webDateInput}
                    aria-label="Select record date"
                  />
                )}
              </TouchableOpacity>

              {errors.date && (
                <AppText
                  variant="caption"
                  color="error"
                  style={{ marginTop: spacing.xs }}
                  accessibilityLiveRegion="assertive"
                >
                  {errors.date}
                </AppText>
              )}
            </View>

            {/* ── Native DatePicker Dialog (Android) ── */}
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                value={date ? parseISODate(date) : new Date()}
                mode="date"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate && event.type !== 'dismissed') {
                    setDate(toISODate(selectedDate));
                    if (errors.date) {
                      setErrors((prev) => ({ ...prev, date: null }));
                    }
                  }
                }}
              />
            )}

            {/* ── Native DatePicker Modal (iOS) ── */}
            {Platform.OS === 'ios' && (
              <Modal
                visible={showDatePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
              >
                  <View style={[styles.iosModalOverlay, { backgroundColor: colors.overlay }]}>
                    <View
                      style={[
                        styles.iosPickerContainer,
                        {
                          backgroundColor: colors.surface,
                          borderTopLeftRadius: radius.card,
                          borderTopRightRadius: radius.card,
                          padding: spacing.md,
                          paddingBottom: spacing.xl,
                        },
                      ]}
                    >
                        <View style={[styles.iosPickerHeader, { marginBottom: spacing.sm }]}>
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            accessibilityRole="button"
                            accessibilityLabel="Cancel date change"
                            style={[styles.iosHeaderBtn, { minWidth: touchTarget.min, minHeight: touchTarget.min }]}
                          >
                            <AppText variant="body" color="textMuted">
                              Cancel
                            </AppText>
                          </TouchableOpacity>
                          <AppText variant="body" bold>
                            Select Date
                          </AppText>
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            accessibilityRole="button"
                            accessibilityLabel="Done choosing date"
                            style={[styles.iosHeaderBtn, { minWidth: touchTarget.min, minHeight: touchTarget.min }]}
                          >
                            <AppText variant="body" color="primary" bold>
                              Done
                            </AppText>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={date ? parseISODate(date) : new Date()}
                          mode="date"
                          display="spinner"
                          maximumDate={new Date()}
                          onChange={(event, selectedDate) => {
                            if (selectedDate) {
                              setDate(toISODate(selectedDate));
                              if (errors.date) {
                                setErrors((prev) => ({ ...prev, date: null }));
                              }
                            }
                          }}
                        />
                      </View>
                    </View>
                  </Modal>
          )}

                  {/* ── Steps Input & Quick-Add Chips ── */}
                  <View style={[styles.fieldBlock, { marginBottom: spacing.lg }]}>
                    <AppTextInput
                      label="Steps"
                      value={steps}
                      onChangeText={(val) => {
                        setSteps(val);
                        if (errors.steps) setErrors((prev) => ({ ...prev, steps: null }));
                      }}
                      placeholder="e.g. 7500"
                      iconName={METRICS.steps.icon}
                      iconColor={colors.steps}
                      unit={METRICS.steps.unit}
                      numeric
                      returnKeyType="next"
                      onSubmitEditing={() => caloriesRef.current?.focus()}
                      blurOnSubmit={false}
                      error={errors.steps}
                      accessibilityLabel="Step count"
                    />
                    <View style={[styles.chipsRow, { marginTop: spacing.xs }]}>
                      <QuickChip
                        label="+1000"
                        metricKey="steps"
                        onPress={() => handleQuickAdd(setSteps, 'steps', steps, 1000)}
                        accessibilityLabel="Add 1,000 steps"
                        style={{ marginRight: spacing.xs }}
                      />
                      <QuickChip
                        label="+2500"
                        metricKey="steps"
                        onPress={() => handleQuickAdd(setSteps, 'steps', steps, 2500)}
                        accessibilityLabel="Add 2,500 steps"
                      />
                    </View>
                  </View>

                  {/* ── Calories Burned Input & Quick-Add Chips ── */}
                  <View style={[styles.fieldBlock, { marginBottom: spacing.lg }]}>
                    <AppTextInput
                      label="Calories Burned"
                      inputRef={caloriesRef}
                      value={calories}
                      onChangeText={(val) => {
                        setCalories(val);
                        if (errors.calories) setErrors((prev) => ({ ...prev, calories: null }));
                      }}
                      placeholder="e.g. 450"
                      iconName={METRICS.calories.icon}
                      iconColor={colors.calories}
                      unit={METRICS.calories.unit}
                      numeric
                      returnKeyType="next"
                      onSubmitEditing={() => waterRef.current?.focus()}
                      blurOnSubmit={false}
                      error={errors.calories}
                      accessibilityLabel="Active calories burned"
                    />
                    <View style={[styles.chipsRow, { marginTop: spacing.xs }]}>
                      <QuickChip
                        label="+50"
                        metricKey="calories"
                        onPress={() => handleQuickAdd(setCalories, 'calories', calories, 50)}
                        accessibilityLabel="Add 50 calories"
                        style={{ marginRight: spacing.xs }}
                      />
                      <QuickChip
                        label="+100"
                        metricKey="calories"
                        onPress={() => handleQuickAdd(setCalories, 'calories', calories, 100)}
                        accessibilityLabel="Add 100 calories"
                      />
                    </View>
                  </View>

                  {/* ── Water Intake Input & Quick-Add Chips ── */}
                  <View style={[styles.fieldBlock, { marginBottom: spacing.xl }]}>
                    <AppTextInput
                      label="Water (ml)"
                      inputRef={waterRef}
                      value={water}
                      onChangeText={(val) => {
                        setWater(val);
                        if (errors.water) setErrors((prev) => ({ ...prev, water: null }));
                      }}
                      placeholder="e.g. 1500"
                      iconName={METRICS.water.icon}
                      iconColor={colors.water}
                      unit={METRICS.water.unit}
                      numeric
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                      error={errors.water}
                      accessibilityLabel="Water intake in millilitres"
                    />
                    <View style={[styles.chipsRow, { marginTop: spacing.xs }]}>
                      <QuickChip
                        label="+250"
                        metricKey="water"
                        onPress={() => handleQuickAdd(setWater, 'water', water, 250)}
                        accessibilityLabel="Add 250 ml water"
                        style={{ marginRight: spacing.xs }}
                      />
                      <QuickChip
                        label="+500"
                        metricKey="water"
                        onPress={() => handleQuickAdd(setWater, 'water', water, 500)}
                        accessibilityLabel="Add 500 ml water"
                      />
                    </View>
                  </View>

                  {/* ── General Form Error (if any) ── */}
                  {errors.form && (
                    <AppText
                      variant="caption"
                      color="error"
                      style={{ marginBottom: spacing.md }}
                      accessibilityLiveRegion="assertive"
                    >
                      {errors.form}
                    </AppText>
                  )}

                  {/* ── Action Buttons ── */}
                  <AppButton
                    label={isEditing ? 'Update Entry' : 'Save Entry'}
                    variant="primary"
                    iconName={isEditing ? 'check-circle' : 'check'}
                    loading={isSaving}
                    onPress={handleSubmit}
                    accessibilityLabel={isEditing ? 'Update Entry' : 'Save Entry'}
                    style={{ marginBottom: spacing.sm }}
                  />
                  <AppButton
                    label="Cancel"
                    variant="secondary"
                    onPress={() => safeGoBack(router)}
                    accessibilityLabel="Cancel"
                  />
                </AppCard>
              </KeyboardAvoidingView>
    </ScreenContainer>
          );
}

          const styles = StyleSheet.create({
            keyboardAvoid: {
            flex: 1,
  },
          modalHeader: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
  },
          modalHeaderText: {
            flex: 1,
          minWidth: 160,
  },
          closeButton: {
          alignItems: 'center',
          justifyContent: 'center',
  },
          fieldBlock: {
            width: '100%',
  },
          dateRow: {
            flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 48,
          borderWidth: 1.5,
          position: 'relative',
  },
          dateRowLeft: {
            flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
  },
          dateIconBadge: {
          alignItems: 'center',
          justifyContent: 'center',
  },
          dateLabelText: {
            flex: 1,
  },
          dateRowRight: {
            flexDirection: 'row',
          alignItems: 'center',
  },
          webDateInput: {
            position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
  },
          chipsRow: {
            flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 8,
  },
          iosModalOverlay: {
            flex: 1,
          justifyContent: 'flex-end',
  },
          iosPickerContainer: {
          width: '100%',
  },
          iosPickerHeader: {
            flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
  },
          iosHeaderBtn: {
            justifyContent: 'center',
          alignItems: 'center',
  },
});
