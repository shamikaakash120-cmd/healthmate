/**
 * @layer Presentation (History Screen)
 * @responsibility Pure UI view for browsing historical records, date searching, and filtering.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  AppText,
  AppCard,
  EmptyState,
  FloatingActionButton,
} from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { useRecordsStore, selectFilteredRecords } from '../../records/viewmodel';

/**
 * Historical records browsing screen.
 * @returns {React.JSX.Element} Rendered history view.
 */
export default function HistoryScreen() {
  const router = useRouter();
  const { spacing } = useTheme();

  const records = useRecordsStore(selectFilteredRecords);
  const loadRecords = useRecordsStore((state) => state.loadRecords);

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <ScreenContainer scroll padded>
      {/* ── Screen Header ── */}
      <View style={[styles.header, { marginBottom: spacing.lg }]}>
        <AppText variant="caption" color="textMuted">
          Logs & Trends
        </AppText>
        <AppText variant="title" bold style={{ marginTop: 2 }}>
          History 📅
        </AppText>
      </View>

      {/* ── Status / Record List Placeholder ── */}
      {records.length === 0 ? (
        <AppCard noPad>
          <EmptyState
            iconName="calendar-search"
            title="No records found"
            hint="You haven't logged any records yet, or no records matched your filter."
            actionLabel="Add first record"
            onAction={() => router.push('/record-form')}
          />
        </AppCard>
      ) : (
        <AppCard style={{ marginBottom: spacing.lg }}>
          <AppText variant="heading" bold style={{ marginBottom: spacing.xs }}>
            Logged Entries ({records.length})
          </AppText>
          <AppText variant="body" color="textMuted">
            Full date filtering, range selectors, and editable record cards will appear here.
          </AppText>
        </AppCard>
      )}

      {/* ── Floating Action Button (Add Entry) ── */}
      <FloatingActionButton
        iconName="plus"
        onPress={() => router.push('/record-form')}
        accessibilityLabel="Add new health record"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
  },
});
