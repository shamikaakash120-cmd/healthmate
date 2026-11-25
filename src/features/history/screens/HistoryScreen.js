/**
 * @layer Presentation (History Screen)
 * @responsibility Pure UI screen displaying a newest-first FlatList of logged health records
 *                with Edit/Delete card actions, delete confirmation modal, pull-to-refresh,
 *                focus refresh, empty/loading/error states, and add-entry FAB.
 *
 * RULES APPLIED:
 *   - UI only; all persistence, filtering, and deletion logic runs through `useRecordsStore`.
 *   - Item card and confirmation modal live in `features/history/components`.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  AppCard,
  AppText,
  EmptyState,
  ErrorState,
  FloatingActionButton,
  LoadingState,
  ScreenContainer,
  showErrorToast,
  showSuccessToast,
} from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { formatDisplayDate } from '../../../core/utils/dateUtils';
import { selectFilteredRecords, useRecordsStore } from '../../records/viewmodel';
import {
  ConfirmDeleteModal,
  DateSearchBar,
  HistoryRecordCard,
} from '../components';

/**
 * Historical health records screen.
 *
 * @returns {React.JSX.Element} Rendered History screen.
 */
export default function HistoryScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  // Store state & actions (primitive/stable selectors to avoid Zustand v5 snapshot loops)
  const recordsRaw = useRecordsStore((state) => state.records);
  const searchDate = useRecordsStore((state) => state.searchDate);
  const isLoading = useRecordsStore((state) => state.isLoading);
  const error = useRecordsStore((state) => state.error);
  const loadRecords = useRecordsStore((state) => state.loadRecords);
  const removeRecord = useRecordsStore((state) => state.removeRecord);
  const setSearchDate = useRecordsStore((state) => state.setSearchDate);
  const clearSearch = useRecordsStore((state) => state.clearSearch);

  // Enforce newest-first ordering and active searchDate filtering via store selector
  const records = useMemo(
    () =>
      selectFilteredRecords({
        records: recordsRaw,
        searchDate,
        sortOrder: 'desc',
      }),
    [recordsRaw, searchDate]
  );

  // Local UI-only state
  const [hasLoaded, setHasLoaded] = useState(recordsRaw.length > 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refresh records whenever the History tab gains focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function syncOnFocus() {
        await loadRecords();
        if (active) {
          setHasLoaded(true);
        }
      }
      syncOnFocus();
      return () => {
        active = false;
      };
    }, [loadRecords])
  );

  const handleOpenAdd = useCallback(() => {
    router.push('/record-form');
  }, [router]);

  const handleEdit = useCallback(
    (record) => {
      router.push({
        pathname: '/record-form',
        params: { id: String(record.id) },
      });
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadRecords();
    setHasLoaded(true);
    setIsRefreshing(false);
  }, [loadRecords]);

  const handleRetry = useCallback(async () => {
    setHasLoaded(false);
    await loadRecords();
    setHasLoaded(true);
  }, [loadRecords]);

  const handleSelectDate = useCallback(
    async (isoDate) => {
      await setSearchDate(isoDate);
    },
    [setSearchDate]
  );

  const handleClearFilter = useCallback(async () => {
    await clearSearch();
  }, [clearSearch]);

  const handleRequestDelete = useCallback((record) => {
    setRecordToDelete(record);
  }, []);

  const handleCancelDelete = useCallback(() => {
    if (!isDeleting) {
      setRecordToDelete(null);
    }
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!recordToDelete || isDeleting) return;
    setIsDeleting(true);
    const { success } = await removeRecord(recordToDelete.id);
    setIsDeleting(false);
    setRecordToDelete(null);

    if (success) {
      showSuccessToast('Entry deleted.');
    } else {
      const storeErr = useRecordsStore.getState().error;
      showErrorToast(storeErr || 'Could not delete entry. Please try again.');
    }
  }, [recordToDelete, isDeleting, removeRecord]);

  const renderRecordItem = useCallback(
    ({ item }) => (
      <HistoryRecordCard
        record={item}
        onEdit={handleEdit}
        onDelete={handleRequestDelete}
      />
    ),
    [handleEdit, handleRequestDelete]
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  // ── Loading State (Initial load / Retry) ──────────────────────────────────
  if (!hasLoaded && isLoading) {
    return (
      <ScreenContainer padded={false}>
        <LoadingState label="Loading your health history…" />
      </ScreenContainer>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (error && !isLoading && !isRefreshing) {
    return (
      <ScreenContainer padded={false}>
        <ErrorState message={error} onRetry={handleRetry} />
      </ScreenContainer>
    );
  }

  const countLabel =
    records.length === 1 ? '1 entry' : `${records.length} entries`;

  const listHeader = (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={[styles.headerRow, { marginBottom: spacing.md }]}>
        <View style={styles.headerTextCol}>
          <AppText variant="caption" color="textMuted">
            Daily Activity Log
          </AppText>
          <AppText variant="title" bold style={{ marginTop: 2 }}>
            History
          </AppText>
        </View>

        {records.length > 0 && (
          <View
            style={[
              styles.countPill,
              {
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.pill,
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: spacing.xs,
              },
            ]}
            accessible
            accessibilityLabel={`${countLabel} recorded`}
          >
            <AppText variant="caption" color="textMuted">
              {countLabel}
            </AppText>
          </View>
        )}
      </View>

      {/* ── Clean Date Search Bar & Active Filter Chip ── */}
      <DateSearchBar
        searchDate={searchDate}
        onSelectDate={handleSelectDate}
        onClear={handleClearFilter}
      />
    </View>
  );

  const listEmpty = (
    <View style={styles.emptyWrap}>
      <AppCard noPad>
        {searchDate ? (
          <EmptyState
            iconName="calendar-remove-outline"
            title="No entries for this date"
            hint={`No health records were logged on ${formatDisplayDate(searchDate)}.`}
            actionLabel="Clear filter"
            onAction={handleClearFilter}
          />
        ) : (
          <EmptyState
            iconName="calendar-blank-outline"
            title="No entries yet. Tap + to log your first day."
            hint="Your daily steps, calories burned, and hydration entries will appear here."
            actionLabel="Add entry"
            onAction={handleOpenAdd}
          />
        )}
      </AppCard>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenContainer padded={false}>
        <FlatList
          data={records}
          keyExtractor={keyExtractor}
          renderItem={renderRecordItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: spacing.xxxl * 2,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      </ScreenContainer>

      {/* ── Fixed Bottom-Right Floating Action Button ── */}
      <FloatingActionButton
        iconName="plus"
        onPress={handleOpenAdd}
        accessibilityLabel="Add new health entry"
      />

      {/* ── Delete Confirmation Dialog ── */}
      <ConfirmDeleteModal
        visible={!!recordToDelete}
        entryDateLabel={
          recordToDelete ? formatDisplayDate(recordToDelete.date) : undefined
        }
        isDeleting={isDeleting}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerRow: {
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  countPill: {
    alignSelf: 'center',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
