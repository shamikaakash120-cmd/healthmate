/**
 * @layer Presentation (Records Screen)
 * @responsibility Modal form view for creating or editing health records with validation.
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ScreenContainer,
  AppText,
  AppCard,
  AppTextInput,
  AppButton,
  showSuccessToast,
} from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { today } from '../../../core/utils/dateUtils';
import { useRecordsStore } from '../viewmodel';

/**
 * Health record entry form presented as a modal.
 * @returns {React.JSX.Element} The rendered form interface.
 */
export default function RecordFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recordId = params?.id ? Number(params.id) : null;
  const isEditing = Boolean(recordId);

  const { colors, spacing } = useTheme();

  const addRecord = useRecordsStore((state) => state.addRecord);
  const editRecord = useRecordsStore((state) => state.editRecord);
  const getRecordForEdit = useRecordsStore((state) => state.getRecordForEdit);
  const isSaving = useRecordsStore((state) => state.lastSaveStatus === 'saving');

  // Form field state
  const [date, setDate] = useState(today());
  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');
  const [errors, setErrors] = useState({});

  // If editing, load initial record values
  useEffect(() => {
    async function loadInitial() {
      if (isEditing) {
        const existing = await getRecordForEdit(recordId);
        if (existing) {
          setDate(existing.date);
          setSteps(String(existing.steps));
          setCalories(String(existing.calories));
          setWater(String(existing.water));
        }
      }
    }
    loadInitial();
  }, [recordId]);

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
      showSuccessToast(isEditing ? 'Entry updated successfully! 🎉' : 'New entry logged! 🎉');
      router.back();
    } else if (result.errors) {
      setErrors(result.errors);
    }
  }

  return (
    <ScreenContainer scroll padded>
      {/* ── Modal Header with Close Action ── */}
      <View style={[styles.modalHeader, { marginBottom: spacing.lg }]}>
        <View>
          <AppText variant="caption" color="textMuted">
            Health Log
          </AppText>
          <AppText variant="title" bold style={{ marginTop: 2 }}>
            {isEditing ? 'Edit Entry' : 'Add Entry'}
          </AppText>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Close form"
          accessibilityRole="button"
          style={[styles.closeButton, { backgroundColor: colors.surfaceAlt }]}
        >
          <MaterialCommunityIcons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* ── Form Card ── */}
      <AppCard style={{ marginBottom: spacing.xl }}>
        {/* Date input */}
        <AppTextInput
          label="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={(val) => {
            setDate(val);
            if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
          }}
          placeholder="YYYY-MM-DD"
          iconName="calendar"
          error={errors.date}
          helperText="Format: YYYY-MM-DD (today or earlier)"
          accessibilityLabel="Record date"
          style={{ marginBottom: spacing.md }}
        />

        {/* Steps input */}
        <AppTextInput
          label="Steps"
          value={steps}
          onChangeText={(val) => {
            setSteps(val);
            if (errors.steps) setErrors((prev) => ({ ...prev, steps: null }));
          }}
          placeholder="e.g. 7500"
          iconName="walk"
          unit="steps"
          numeric
          error={errors.steps}
          accessibilityLabel="Step count"
          style={{ marginBottom: spacing.md }}
        />

        {/* Calories input */}
        <AppTextInput
          label="Active Calories"
          value={calories}
          onChangeText={(val) => {
            setCalories(val);
            if (errors.calories) setErrors((prev) => ({ ...prev, calories: null }));
          }}
          placeholder="e.g. 450"
          iconName="fire"
          unit="kcal"
          numeric
          error={errors.calories}
          accessibilityLabel="Active calories burned"
          style={{ marginBottom: spacing.md }}
        />

        {/* Water input */}
        <AppTextInput
          label="Water Intake"
          value={water}
          onChangeText={(val) => {
            setWater(val);
            if (errors.water) setErrors((prev) => ({ ...prev, water: null }));
          }}
          placeholder="e.g. 1500"
          iconName="water"
          unit="ml"
          numeric
          error={errors.water}
          accessibilityLabel="Water consumed in millilitres"
          style={{ marginBottom: spacing.lg }}
        />

        {errors.form && (
          <AppText variant="caption" color="error" style={{ marginBottom: spacing.md }}>
            {errors.form}
          </AppText>
        )}

        {/* ── Action Buttons ── */}
        <AppButton
          label={isEditing ? 'Save Changes' : 'Add Entry'}
          variant="primary"
          iconName="check"
          loading={isSaving}
          onPress={handleSubmit}
          accessibilityLabel={isEditing ? 'Save changes to entry' : 'Submit new entry'}
          style={{ marginBottom: spacing.sm }}
        />
        <AppButton
          label="Cancel"
          variant="text"
          onPress={() => router.back()}
          accessibilityLabel="Cancel and close form"
        />
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
