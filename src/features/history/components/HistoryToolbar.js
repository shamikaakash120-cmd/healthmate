/**
 * @layer Presentation (History Components)
 * @responsibility Uncluttered toolbar grouping single-date search, From/To date range button,
 *                sort menu button, CSV export button, and the dismissible active-filter chip.
 */
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { formatDisplayDate } from '../../../core/utils/dateUtils';
import { SORT_OPTIONS, normalizeSortOrder } from '../../records/viewmodel';
import DateSearchBar from './DateSearchBar';

/**
 * Compact toolbar grouping all History filtering, sorting, and CSV export controls.
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
  const { colors, spacing, radius, shadow } = useTheme();

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
      {/* ── Single-Date Search Row ── */}
      <DateSearchBar
        searchDate={searchDate}
        onSelectDate={onSelectDate}
        onClear={onClearFilter}
        showChip={false}
      />

      {/* ── Grouped Action Toolbar Row: Range · Sort · CSV ── */}
      <View style={[styles.toolbarRow, { marginTop: spacing.sm }]}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onOpenRange}
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
              backgroundColor: hasRangeFilter ? colors.surfaceAlt : colors.surface,
              borderColor: hasRangeFilter ? colors.primary : colors.border,
              borderRadius: radius.button,
              marginRight: spacing.xs + 2,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="calendar-range"
            size={16}
            color={hasRangeFilter ? colors.primary : colors.textMuted}
            style={{ marginRight: 5 }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <AppText
            variant="caption"
            bold={hasRangeFilter}
            numberOfLines={1}
            style={{
              color: hasRangeFilter ? colors.primary : colors.text,
              fontSize: 12,
            }}
          >
            Date range
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onOpenSort}
          accessibilityRole="button"
          accessibilityLabel={`Sort records, currently ${activeSortOption.label}. Tap to change.`}
          style={[
            styles.toolButton,
            shadow,
            {
              backgroundColor: isCustomSort ? colors.surfaceAlt : colors.surface,
              borderColor: isCustomSort ? colors.primary : colors.border,
              borderRadius: radius.button,
              marginRight: spacing.xs + 2,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={activeSortOption.icon}
            size={16}
            color={isCustomSort ? colors.primary : colors.textMuted}
            style={{ marginRight: 5 }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <AppText
            variant="caption"
            bold={isCustomSort}
            numberOfLines={1}
            style={{
              color: isCustomSort ? colors.primary : colors.text,
              fontSize: 12,
            }}
          >
            {activeSortOption.shortLabel}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onExportCsv}
          disabled={isExporting}
          accessibilityRole="button"
          accessibilityState={{ busy: isExporting, disabled: isExporting }}
          accessibilityLabel="Export currently shown records as CSV"
          style={[
            styles.toolButton,
            styles.exportButton,
            shadow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.button,
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
                style={{ marginRight: 5 }}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
              <AppText
                variant="caption"
                bold
                numberOfLines={1}
                style={{ color: colors.primary, fontSize: 12 }}
              >
                Export
              </AppText>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Active Filter Chip (Single Date OR Date Range) ── */}
      {activeChipLabel && (
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
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={`Clear active filter: ${activeChipLabel}`}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  exportButton: {
    flex: 0.85,
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
    maxWidth: '100%',
  },
  chipText: {
    flexShrink: 1,
  },
  clearButton: {
    marginLeft: 6,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
