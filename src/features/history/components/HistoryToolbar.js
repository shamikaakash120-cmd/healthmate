/**
 * @layer Presentation (History Components)
 * @responsibility Uncluttered toolbar grouping single-date search, From/To date range button,
 *                sort menu button, CSV export button, and the dismissible active-filter chip.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppText, PressableScale } from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { formatDisplayDate } from '../../../core/utils/dateUtils';
import { SORT_OPTIONS, normalizeSortOrder } from '../../records/viewmodel';
import DateSearchBar from './DateSearchBar';

/**
 * Compact toolbar grouping all History filtering, sorting, and CSV export controls.
 * Uses 48dp touch targets and flex-wrap responsiveness for large accessibility font scaling.
 *
 * @param {object} props
 * @param {string|null} props.searchDate Active single-date filter (YYYY-MM-DD), or null.
 * @param {string|null} props.rangeStart Active range start date (YYYY-MM-DD), or null.
 * @param {string|null} props.rangeEnd Active range end date (YYYY-MM-DD), or null.
 * @param {string} props.sortOrder Active sort option key.
 * @param {boolean} [props.isExporting=false] Shows spinner on Export while writing/sharing CSV.
 * @param {(isoDate: string) => void} props.onSelectDate Single-date selection handler.
 * @param {() => void} props.onOpenRange Opens the From/To date range modal.
 * @param {() => void} props.onOpenSort Opens the sort options menu.
 * @param {() => void} props.onExportCsv Exports visible records to CSV.
 * @param {() => void} props.onClearFilter Clears active date or date-range filter.
 * @returns {React.JSX.Element}
 */
export default function HistoryToolbar({
  searchDate,
  rangeStart,
  rangeEnd,
  sortOrder,
  isExporting = false,
  onSelectDate,
  onOpenRange,
  onOpenSort,
  onExportCsv,
  onClearFilter,
}) {
  const { colors, spacing, radius, shadow, touchTarget } = useTheme();

  const normalizedSort = normalizeSortOrder(sortOrder);
  const activeSortOption =
    SORT_OPTIONS.find((opt) => opt.key === normalizedSort) || SORT_OPTIONS[0];
  const hasRangeFilter = Boolean(rangeStart && rangeEnd);
  const isCustomSort = normalizedSort !== 'newest';

  const activeChipLabel = searchDate
    ? `Filtered: ${formatDisplayDate(searchDate)}`
    : hasRangeFilter
      ? rangeStart === rangeEnd
        ? `Range: ${formatDisplayDate(rangeStart)}`
        : `Range: ${formatDisplayDate(rangeStart)} – ${formatDisplayDate(rangeEnd)}`
      : null;

  return (
    <View style={styles.container}>
      <DateSearchBar
        searchDate={searchDate}
        onSelectDate={onSelectDate}
        onClear={onClearFilter}
        showChip={false}
      />

      <View style={[styles.toolbarRow, { gap: spacing.xs + 2, marginTop: spacing.sm }]}>
        <PressableScale
          scaleTo={0.97}
          duration={150}
          onPress={onOpenRange}
          containerStyle={styles.toolFlex}
          accessibilityRole="button"
          accessibilityLabel={
            hasRangeFilter
              ? `Date range filter active: ${rangeStart} to ${rangeEnd}. Tap to edit.`
              : 'Filter by date range'
          }
          style={[
            styles.toolButton,
            shadow,
            {
              minHeight: touchTarget.min,
              backgroundColor: hasRangeFilter ? colors.surfaceAlt : colors.surface,
              borderColor: hasRangeFilter ? colors.primary : colors.border,
              borderRadius: radius.button,
              paddingHorizontal: spacing.sm,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="calendar-range"
            size={16}
            color={hasRangeFilter ? colors.primary : colors.textMuted}
            style={{ marginRight: spacing.xs }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <AppText
            variant="caption"
            bold={hasRangeFilter}
            numberOfLines={1}
            style={[
              styles.toolText,
              { color: hasRangeFilter ? colors.primary : colors.text },
            ]}
          >
            Date range
          </AppText>
        </PressableScale>

        <PressableScale
          scaleTo={0.97}
          duration={150}
          onPress={onOpenSort}
          containerStyle={styles.toolFlex}
          accessibilityRole="button"
          accessibilityLabel={`Sort records, currently ${activeSortOption.label}. Tap to change.`}
          style={[
            styles.toolButton,
            shadow,
            {
              minHeight: touchTarget.min,
              backgroundColor: isCustomSort ? colors.surfaceAlt : colors.surface,
              borderColor: isCustomSort ? colors.primary : colors.border,
              borderRadius: radius.button,
              paddingHorizontal: spacing.sm,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={activeSortOption.icon}
            size={16}
            color={isCustomSort ? colors.primary : colors.textMuted}
            style={{ marginRight: spacing.xs }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <AppText
            variant="caption"
            bold={isCustomSort}
            numberOfLines={1}
            style={[
              styles.toolText,
              { color: isCustomSort ? colors.primary : colors.text },
            ]}
          >
            {activeSortOption.shortLabel}
          </AppText>
        </PressableScale>

        <PressableScale
          scaleTo={0.97}
          duration={150}
          onPress={onExportCsv}
          disabled={isExporting}
          containerStyle={styles.exportFlex}
          accessibilityRole="button"
          accessibilityState={{ busy: isExporting, disabled: isExporting }}
          accessibilityLabel="Export currently shown records as CSV"
          style={[
            styles.toolButton,
            shadow,
            {
              minHeight: touchTarget.min,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.button,
              paddingHorizontal: spacing.sm,
              opacity: isExporting ? 0.6 : 1,
            },
          ]}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="export-variant"
                size={16}
                color={colors.primary}
                style={{ marginRight: spacing.xs }}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <AppText
                variant="caption"
                bold
                numberOfLines={1}
                style={[styles.toolText, { color: colors.primary }]}
              >
                Export
              </AppText>
            </>
          )}
        </PressableScale>
      </View >

      {
        activeChipLabel && (
          <View style={[styles.chipRow, { marginTop: spacing.sm }]}>
            <View
              style={[
                styles.activeChip,
                {
                  minHeight: touchTarget.min,
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.primary,
                  borderRadius: radius.pill,
                  paddingLeft: spacing.md,
                  paddingRight: spacing.xs,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={hasRangeFilter ? 'calendar-range' : 'filter-variant'}
                size={14}
                color={colors.primary}
                style={{ marginRight: spacing.xs }}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <AppText
                variant="caption"
                bold
                style={[styles.chipText, { color: colors.primary }]}
                numberOfLines={1}
              >
                {activeChipLabel}
              </AppText>
              <TouchableOpacity
                onPress={onClearFilter}
                accessibilityRole="button"
                accessibilityLabel={`Clear active filter: ${activeChipLabel}`}
                style={[
                  styles.clearButton,
                  { minWidth: touchTarget.min, minHeight: touchTarget.min },
                ]}
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
        )
      }
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  toolbarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  toolFlex: {
    flex: 1,
    minWidth: 96,
  },
  exportFlex: {
    flex: 0.85,
    minWidth: 84,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  toolText: {
    flexShrink: 1,
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
    maxWidth: '100%',
  },
  chipText: {
    flexShrink: 1,
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
