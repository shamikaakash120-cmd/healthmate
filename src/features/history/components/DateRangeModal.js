/**
 * @layer Presentation (History Components)
 * @responsibility Bottom-sheet modal for picking a validated From / To date range
 *                across Android, iOS, and Web without cluttering the main list.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppButton, AppText, PressableScale } from '../../../core/components';
import { useTheme } from '../../../core/theme';
import {
  formatDisplayDate,
  isValidISODate,
  parseISODate,
  shiftISODate,
  toISODate,
  today,
} from '../../../core/utils/dateUtils';
import { validateDateRange } from '../../records/viewmodel';

const RANGE_FIELDS = [
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
];

/**
 * Bottom sheet modal allowing the user to filter history records between two dates (`From <= To`).
 *
 * @param {object} props
 * @param {boolean} props.visible Controls modal visibility.
 * @param {string|null} props.rangeStart Current active start date (YYYY-MM-DD), or null.
 * @param {string|null} props.rangeEnd Current active end date (YYYY-MM-DD), or null.
 * @param {(start: string, end: string) => Promise<{ success: boolean, error: string|null }>} props.onApply
 *   Called when a valid date range is submitted.
 * @param {() => void} props.onClear Called when clearing an active range filter.
 * @param {() => void} props.onClose Dismiss handler.
 * @returns {React.JSX.Element}
 */
export default function DateRangeModal({
  visible,
  rangeStart,
  rangeEnd,
  onApply,
  onClear,
  onClose,
}) {
  const { colors, spacing, radius, touchTarget, isDark } = useTheme();
  const webFromInputRef = useRef(null);
  const webToInputRef = useRef(null);

  const [fromDate, setFromDate] = useState(rangeStart || shiftISODate(today(), -6));
  const [toDate, setToDate] = useState(rangeEnd || today());
  const [activeField, setActiveField] = useState(null);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const hasActiveRange = Boolean(rangeStart && rangeEnd);

  useEffect(() => {
    if (visible) {
      setFromDate(rangeStart || shiftISODate(today(), -6));
      setToDate(rangeEnd || today());
      setActiveField(null);
      setError(null);
      setIsApplying(false);
    }
  }, [visible, rangeStart, rangeEnd]);

  function updateField(fieldKey, nextIso) {
    const nextFrom = fieldKey === 'from' ? nextIso : fromDate;
    const nextTo = fieldKey === 'to' ? nextIso : toDate;

    if (fieldKey === 'from') setFromDate(nextIso);
    else setToDate(nextIso);

    const validation = validateDateRange(nextFrom, nextTo);
    setError(validation.valid ? null : validation.error);
  }

  async function handleApply() {
    if (isApplying) return;

    const validation = validateDateRange(fromDate, toDate);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setIsApplying(true);
    const result = await onApply(fromDate, toDate);
    setIsApplying(false);

    if (result?.success) {
      onClose();
    } else if (result?.error) {
      setError(result.error);
    }
  }

  function openWebDatePicker(fieldKey) {
    const el = fieldKey === 'from' ? webFromInputRef.current : webToInputRef.current;
    if (!el) return;
    try {
      if (typeof el.showPicker === 'function') {
        el.showPicker();
        return;
      }
    } catch {
      // Fall back to focusing/clicking input when showPicker is restricted
    }
    el.focus?.();
    el.click?.();
  }

  function handleClearRange() {
    onClear();
    onClose();
  }

  const activeValue = activeField === 'from' ? fromDate : toDate;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]} accessibilityViewIsModal>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close date range filter"
          accessibilityRole="button"
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.card,
              borderTopRightRadius: radius.card,
              padding: spacing.lg,
              paddingBottom: spacing.xl,
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={[styles.headerRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
              <View style={styles.headerTextCol}>
                <AppText variant="heading" bold accessibilityRole="header">
                  Filter by date range
                </AppText>
                <AppText variant="caption" color="textMuted" style={{ marginTop: 2 }}>
                  Choose start and end dates (From ≤ To)
                </AppText>
              </View>
              <PressableScale
                onPress={onClose}
                scaleTo={0.93}
                duration={150}
                accessibilityRole="button"
                accessibilityLabel="Close date range modal"
                style={[
                  styles.closeBtn,
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
                  size={20}
                  color={colors.text}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </PressableScale>
            </View>

            {
              RANGE_FIELDS.map((field) => {
                const isoValue = field.key === 'from' ? fromDate : toDate;
                const formatted = formatDisplayDate(isoValue);
                const isFocused = activeField === field.key;

                return (
                  <View key={field.key} style={{ marginBottom: spacing.md }}>
                    <AppText
                      variant="caption"
                      color="textMuted"
                      style={{ marginBottom: spacing.xs }}
                    >
                      {field.label}
                    </AppText>

                    {Platform.OS === 'web' ? (
                      <View
                        style={[
                          styles.dateRow,
                          {
                            minHeight: touchTarget.min,
                            backgroundColor: colors.surfaceAlt,
                            borderColor: error ? colors.error : colors.border,
                            borderRadius: radius.sm,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.xs,
                            gap: spacing.sm,
                          },
                        ]}
                      >
                        <Pressable
                          onPress={() => openWebDatePicker(field.key)}
                          accessibilityRole="button"
                          accessibilityLabel={`${field.label} date, currently ${formatted}. Tap to change.`}
                          style={styles.dateRowLeft}
                        >
                          <MaterialCommunityIcons
                            name="calendar-month"
                            size={20}
                            color={colors.primary}
                            style={{ marginRight: spacing.sm }}
                            accessibilityElementsHidden
                            importantForAccessibility="no"
                          />
                          <AppText variant="body" bold style={styles.dateValueText}>
                            {formatted}
                          </AppText>
                        </Pressable>

                        <input
                          ref={field.key === 'from' ? webFromInputRef : webToInputRef}
                          type="date"
                          max={today()}
                          value={isoValue}
                          onClick={(e) => {
                            e.stopPropagation();
                            try {
                              if (typeof e.currentTarget.showPicker === 'function') {
                                e.currentTarget.showPicker();
                              }
                            } catch {
                              // Allow direct inline typing/calendar interaction
                            }
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            if (isValidISODate(val)) {
                              updateField(field.key, val);
                            } else {
                              setError('Please enter a valid calendar date.');
                            }
                          }}
                          aria-label={`Select ${field.label} date`}
                          style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.sm,
                            backgroundColor: colors.surface,
                            color: colors.primary,
                            colorScheme: isDark ? 'dark' : 'light',
                            fontFamily: 'inherit',
                            fontSize: 13,
                            fontWeight: '600',
                            padding: '6px 10px',
                            minHeight: 36,
                            cursor: 'pointer',
                          }}
                        />
                      </View>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => {
                          setActiveField(isFocused ? null : field.key);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${field.label} date, currently ${formatted}. Tap to change.`}
                        style={[
                          styles.dateRow,
                          {
                            minHeight: touchTarget.min,
                            backgroundColor: colors.surfaceAlt,
                            borderColor: error
                              ? colors.error
                              : isFocused
                                ? colors.primary
                                : colors.border,
                            borderRadius: radius.sm,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.xs,
                          },
                        ]}
                      >
                        <View style={styles.dateRowLeft}>
                          <MaterialCommunityIcons
                            name="calendar-month"
                            size={20}
                            color={colors.primary}
                            style={{ marginRight: spacing.sm }}
                            accessibilityElementsHidden
                            importantForAccessibility="no"
                          />
                          <AppText variant="body" bold style={styles.dateValueText}>
                            {formatted}
                          </AppText>
                        </View>

                        <AppText variant="caption" color="primary" bold>
                          Change
                        </AppText>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

            {Platform.OS === 'ios' && activeField && (
              <View
                style={[
                  styles.iosPickerBox,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: radius.sm,
                    padding: spacing.sm,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                <View style={styles.iosPickerHeader}>
                  <AppText variant="caption" color="textMuted" bold>
                    {activeField === 'from' ? 'Select From Date' : 'Select To Date'}
                  </AppText>
                  <TouchableOpacity
                    onPress={() => setActiveField(null)}
                    accessibilityRole="button"
                    accessibilityLabel="Done choosing date"
                    style={[
                      styles.iosDoneBtn,
                      { minWidth: touchTarget.min, minHeight: touchTarget.min },
                    ]}
                  >
                    <AppText variant="caption" color="primary" bold>
                      Done
                    </AppText>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={parseISODate(activeValue)}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={(_event, selectedDate) => {
                    if (selectedDate) {
                      updateField(activeField, toISODate(selectedDate));
                    }
                  }}
                />
              </View>
            )}

            {Platform.OS === 'android' && activeField && (
              <DateTimePicker
                value={parseISODate(activeValue)}
                mode="date"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  const targetField = activeField;
                  setActiveField(null);
                  if (event.type !== 'dismissed' && selectedDate) {
                    updateField(targetField, toISODate(selectedDate));
                  }
                }}
              />
            )}

            {error && (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: colors.errorBg,
                    borderRadius: radius.sm,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    marginBottom: spacing.md,
                  },
                ]}
                accessibilityLiveRegion="assertive"
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.error}
                  style={{ marginRight: spacing.xs }}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
                <AppText variant="caption" color="error" style={{ flex: 1 }}>
                  {error}
                </AppText>
              </View>
            )}

            <View style={[styles.actionsRow, { gap: spacing.sm }]}>
              <AppButton
                label="Cancel"
                variant="secondary"
                onPress={onClose}
                accessibilityLabel="Cancel date range filter"
                style={{ flex: 1 }}
              />
              <AppButton
                label="Apply Range"
                variant="primary"
                loading={isApplying}
                onPress={handleApply}
                accessibilityLabel="Apply selected date range"
                style={{ flex: 1 }}
              />
            </View>

            {hasActiveRange && (
              <AppButton
                label="Clear Range Filter"
                variant="text"
                onPress={handleClearRange}
                accessibilityLabel="Clear current date range filter"
                style={{ marginTop: spacing.xs }}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '88%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextCol: {
    flex: 1,
    flexShrink: 1,
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
  },
  dateRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 150,
  },
  dateValueText: {
    flexShrink: 1,
  },
  iosPickerBox: {
    width: '100%',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  iosDoneBtn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
});
