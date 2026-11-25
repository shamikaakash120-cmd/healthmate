/**
 * @layer Presentation (History Components)
 * @responsibility Cross-platform confirmation dialog for deleting a health record entry.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
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
  const { colors, spacing } = useTheme();

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
        style={styles.backdrop}
        accessibilityViewIsModal
      >
        {/* Backdrop tap to cancel */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (!isDeleting) onCancel();
          }}
          accessibilityLabel="Dismiss delete confirmation"
          accessibilityRole="button"
        />

        <AppCard style={[styles.dialogCard, { padding: spacing.lg }]}>
          <View
            style={[
              styles.iconWell,
              { backgroundColor: colors.errorBg, marginBottom: spacing.md },
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

          <View style={styles.buttonsRow}>
            <AppButton
              label="Cancel"
              variant="secondary"
              disabled={isDeleting}
              onPress={onCancel}
              accessibilityLabel="Cancel deletion"
              style={{ flex: 1, marginRight: spacing.sm }}
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
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 32, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  iconWell: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
