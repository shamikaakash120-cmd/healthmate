/**
 * @layer Presentation (History Components)
 * @responsibility Cross-platform confirmation dialog for deleting a health record entry.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppButton, AppCard, AppText } from '../../../core/components';
import { useTheme } from '../../../core/theme';

/**
 * Displays a confirmation dialog before permanently deleting an entry.
 * Implemented with React Native Modal so it behaves consistently across iOS, Android, and Web.
 *
 * @param {object} props
 * @param {boolean} props.visible Controls dialog visibility.
 * @param {string} [props.entryDateLabel] Human-readable date label of the entry pending deletion.
 * @param {boolean} [props.isDeleting=false] Shows loading state on the Delete button while removing.
 * @param {Function} props.onCancel Dismiss handler without deleting.
 * @param {Function} props.onConfirm Confirmation handler triggering deletion.
 * @returns {React.JSX.Element}
 */
export default function ConfirmDeleteModal({
  visible,
  entryDateLabel,
  isDeleting = false,
  onCancel,
  onConfirm,
}) {
  const { colors, radius, spacing } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!isDeleting) onCancel();
      }}
    >
      <View
        style={[
          styles.backdrop,
          { backgroundColor: colors.overlay, padding: spacing.lg },
        ]}
        accessibilityViewIsModal
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (!isDeleting) onCancel();
          }}
          accessibilityLabel="Dismiss delete confirmation"
          accessibilityRole="button"
        />

        <AppCard style={[styles.dialogCard, { padding: spacing.lg }]}>
          <ScrollView
            style={styles.dialogScroll}
            contentContainerStyle={styles.dialogScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.iconWell,
                {
                  backgroundColor: colors.errorBg,
                  borderRadius: radius.pill,
                  marginBottom: spacing.md,
                },
              ]}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={28}
                color={colors.error}
              />
            </View>

            <AppText
              variant="heading"
              bold
              align="center"
              accessibilityRole="header"
              style={{ marginBottom: spacing.xs }}
            >
              Delete Entry
            </AppText>

            <AppText
              variant="body"
              color="textMuted"
              align="center"
              style={{ marginBottom: entryDateLabel ? spacing.xs : spacing.lg }}
            >
              Delete this entry? This cannot be undone.
            </AppText>

            {entryDateLabel && (
              <AppText
                variant="caption"
                color="textMuted"
                align="center"
                style={{ marginBottom: spacing.lg }}
              >
                {entryDateLabel}
              </AppText>
            )}

            <View style={[styles.buttonsRow, { gap: spacing.sm }]}>
              <AppButton
                label="Cancel"
                variant="secondary"
                disabled={isDeleting}
                onPress={onCancel}
                accessibilityLabel="Cancel deletion"
                style={{ flex: 1 }}
              />
              <AppButton
                label="Delete"
                variant="destructive"
                loading={isDeleting}
                onPress={onConfirm}
                accessibilityLabel="Confirm delete entry"
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '88%',
    alignItems: 'center',
  },
  dialogScroll: {
    width: '100%',
  },
  dialogScrollContent: {
    alignItems: 'center',
  },
  iconWell: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
});
