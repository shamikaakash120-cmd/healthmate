/**
 * @layer Presentation (History Components)
 * @responsibility Bottom-sheet modal for picking a validated From / To date range
 *                across Android, iOS, and Web without cluttering the main list.
 */
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppText } from '../../../core/components';
import { useTheme } from '../../../core/theme';
import {
  formatDisplayDate,
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
  const { colors, spacing, radius } = useTheme();

  const [fromDate, setFromDate] = useState(rangeStart || shiftISODate(today(), -6));
  const [toDate, setToDate] = useState(rangeEnd || today());
  const [activeField, setActiveField] = useState(null); // 'from' | 'to' | null
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const hasActiveRange = Boolean(rangeStart && rangeEnd);

  // Reset modal drafts whenever opened
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
      <View style={styles.overlay} accessibilityViewIsModal>
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
            },
          ]}
        >
          {/* ── Header ── */}
          <View style={[styles.headerRow, { marginBottom: spacing.md }]}>
            <View>
              <AppText variant="heading" bold>
                Filter by date range
              </AppText>
              <AppText variant="caption" color="textMuted" style={{ marginTop: 2 }}>
                Choose start and end dates (From ≤ To)
              </AppText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close date range modal"
              style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
            >
              <MaterialCommunityIcons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* ── From & To Date Rows ── */}
          {RANGE_FIELDS.map((field) => {
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

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      setActiveField(isFocused ? null : field.key);
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${field.label} date, currently ${formatted}. Tap to change.`}
                  style={[
                    styles.dateRow,
                    {
                      backgroundColor: colors.surfaceAlt,
                      borderColor: error
                        ? colors.error
                        : isFocused
                          ? colors.primary
                          : colors.border,
                      borderRadius: radius.sm,
                      paddingHorizontal: spacing.md,
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
                    <AppText variant="body" bold>
                      {formatted}
                    </AppText>
                  </View>

                  <AppText variant="caption" color="primary" bold>
                    Change
                  </AppText>

                  {Platform.OS === 'web' && (
                    <input
                      type="date"
                      max={today()}
                      value={isoValue}
                      onChange={(e) => {
                        if (e.target.value) {
                          updateField(field.key, e.target.value);
                        }
                      }}
                      style={styles.webOverlayInput}
                      aria-label={`Select ${field.label} date`}
                    />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}

          {/* ── iOS Inline Spinner Picker ── */}
          {Platform.OS === 'ios' && activeField && (
            <View
              style={[
                styles.iosPickerBox,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radius.sm,
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

          {/* ── Android Native Picker Dialog ── */}
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

          {/* ── Validation Message ── */}
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

          {/* ── Action Buttons ── */}
          <View style={styles.actionsRow}>
            <AppButton
              label="Cancel"
              variant="secondary"
              onPress={onClose}
              accessibilityLabel="Cancel date range filter"
              style={{ flex: 1, marginRight: spacing.sm }}
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 32, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    borderWidth: 1.5,
    position: 'relative',
  },
  dateRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  webOverlayInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  iosPickerBox: {
    padding: 10,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
});
