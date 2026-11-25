/**
 * @layer Presentation (History Components)
 * @responsibility Clean search bar-style date filter row with cross-platform date picker
 *                and dismissible active-filter chip.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useRef, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText } from '../../../core/components';
import { useTheme } from '../../../core/theme';
import {
  formatDisplayDate,
  parseISODate,
  today,
  toISODate,
} from '../../../core/utils/dateUtils';

/**
 * Search bar-style row for filtering history records by calendar date, paired
 * with an active-filter pill chip when a date is selected.
 *
 * @param {object} props
 * @param {string|null} props.searchDate Active ISO date filter (YYYY-MM-DD), or null.
 * @param {(isoDate: string) => void} props.onSelectDate Callback when a date is chosen.
 * @param {() => void} props.onClear Callback when the active filter chip is cleared.
 * @param {boolean} [props.showChip=true] Whether to render the active filter chip below the bar.
 * @param {object} [props.style] Optional outer container style overrides.
 * @returns {React.JSX.Element}
 */
export default function DateSearchBar({
  searchDate,
  onSelectDate,
  onClear,
  showChip = true,
  style,
}) {
  const { colors, spacing, radius, shadow } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [pendingDate, setPendingDate] = useState(searchDate || today());
  const webInputRef = useRef(null);

  const handleOpenPicker = () => {
    if (Platform.OS === 'web') {
      const el = webInputRef.current;
      if (el) {
        try {
          if (typeof el.showPicker === 'function') {
            el.showPicker();
            return;
          }
        } catch {
          // Fall back to focus/click in browsers restricting showPicker
        }
        el.focus?.();
        el.click?.();
      }
      return;
    }

    setPendingDate(searchDate || today());
    setShowPicker(true);
  };

  const formattedSelected = searchDate ? formatDisplayDate(searchDate) : null;

  return (
    <View style={[styles.container, style]}>
      {/* ── Search Bar-Style Row ── */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handleOpenPicker}
        accessibilityRole="button"
        accessibilityLabel={
          formattedSelected
            ? `Filter by date, currently filtered to ${formattedSelected}. Tap to change date.`
            : 'Filter by date. Tap to open date picker.'
        }
        style={[
          styles.searchBar,
          shadow,
          {
            backgroundColor: colors.surface,
            borderColor: searchDate ? colors.primary : colors.border,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="calendar-month-outline"
          size={20}
          color={searchDate ? colors.primary : colors.textMuted}
          style={{ marginRight: spacing.sm }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />

        <AppText
          variant="body"
          color={searchDate ? 'text' : 'textMuted'}
          style={styles.placeholderText}
          numberOfLines={1}
        >
          Filter by date
        </AppText>

        <MaterialCommunityIcons
          name="chevron-down"
          size={18}
          color={colors.textMuted}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />

        {/* Hidden Web date input triggered via showPicker() on row tap */}
        {Platform.OS === 'web' && (
          <input
            ref={webInputRef}
            type="date"
            max={today()}
            value={searchDate || ''}
            onChange={(e) => {
              if (e.target.value) {
                onSelectDate(e.target.value);
              }
            }}
            style={styles.webHiddenInput}
            tabIndex={-1}
            aria-label="Choose filter date"
          />
        )}
      </TouchableOpacity>

      {/* ── Active Filter Chip ── */}
      {showChip && formattedSelected && (
        <View style={[styles.chipRow, { marginTop: spacing.sm }]}>
          <View
            style={[
              styles.activeChip,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.primary,
                borderRadius: radius.pill,
                paddingLeft: spacing.md,
                paddingRight: spacing.xs,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={14}
              color={colors.primary}
              style={{ marginRight: spacing.xs }}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <AppText
              variant="caption"
              bold
              style={{ color: colors.primary }}
              numberOfLines={1}
            >
              {`Filtered: ${formattedSelected}`}
            </AppText>
            <TouchableOpacity
              onPress={onClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={`Clear date filter for ${formattedSelected}`}
              style={styles.clearButton}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={colors.primary}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Android Native Date Picker ── */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={parseISODate(searchDate || today())}
          mode="date"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (event.type !== 'dismissed' && selectedDate) {
              onSelectDate(toISODate(selectedDate));
            }
          }}
        />
      )}

      {/* ── iOS Modal Spinner Date Picker ── */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.iosOverlay} accessibilityViewIsModal>
            <View
              style={[
                styles.iosSheet,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.card,
                },
              ]}
            >
              <View style={styles.iosHeader}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel date filter"
                  style={styles.iosHeaderAction}
                >
                  <AppText variant="body" color="textMuted">
                    Cancel
                  </AppText>
                </TouchableOpacity>
                <AppText variant="body" bold>
                  Filter by Date
                </AppText>
                <TouchableOpacity
                  onPress={() => {
                    setShowPicker(false);
                    onSelectDate(pendingDate);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Apply selected date filter"
                  style={styles.iosHeaderAction}
                >
                  <AppText variant="body" color="primary" bold>
                    Apply
                  </AppText>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={parseISODate(pendingDate)}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_event, selectedDate) => {
                  if (selectedDate) {
                    setPendingDate(toISODate(selectedDate));
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    position: 'relative',
  },
  placeholderText: {
    flex: 1,
  },
  webHiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    pointerEvents: 'none',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 34,
    paddingVertical: 4,
  },
  clearButton: {
    marginLeft: 6,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 32, 0.45)',
    justifyContent: 'flex-end',
  },
  iosSheet: {
    padding: 16,
    paddingBottom: 32,
  },
  iosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iosHeaderAction: {
    minWidth: 56,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
