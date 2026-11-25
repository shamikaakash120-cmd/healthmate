/**
 * @layer Presentation (History Components)
 * @responsibility Small modal menu for selecting History sort order
 *                (newest, oldest, most steps, most water).
 */
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard, AppText, PressableScale } from '../../../core/components';
import { useTheme } from '../../../core/theme';
import { SORT_OPTIONS } from '../../records/viewmodel';

/**
 * Compact modal sort menu presenting all available History sort options.
 *
 * @param {object} props
 * @param {boolean} props.visible Controls menu visibility.
 * @param {string} props.sortOrder Currently selected sort key.
 * @param {(sortKey: string) => void} props.onSelect Called when a sort option is tapped.
 * @param {() => void} props.onClose Dismiss handler.
 * @returns {React.JSX.Element}
 */
export default function SortMenuModal({ visible, sortOrder, onSelect, onClose }) {
  const { colors, spacing, radius, touchTarget } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
        <View style={[styles.backdrop, { backgroundColor: colors.overlay, padding: spacing.lg }]} accessibilityViewIsModal>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="Close sort menu"
            accessibilityRole="button"
          />

          <AppCard style={[styles.menuCard, { padding: spacing.md }]}>
            <View style={[styles.menuHeader, { marginBottom: spacing.sm }]}>
                <AppText variant="heading" bold accessibilityRole="header">
                  Sort entries
                </AppText>
            <PressableScale
                  onPress={onClose}
                  scaleTo={0.93}
                  duration={150}
                  accessibilityRole="button"
                  accessibilityLabel="Close sort menu"
                  style={[
                    styles.closeIconBtn,
                    { minWidth: touchTarget.min, minHeight: touchTarget.min, borderRadius: radius.pill },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color={colors.textMuted}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
              </PressableScale>
            </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = sortOrder === option.key;
                  const iconColor =
                    option.key === 'most_steps'
                      ? colors.steps
                      : option.key === 'most_water'
                        ? colors.water
                        : isSelected
                          ? colors.primary
                          : colors.textMuted;

                      return (
                      <PressableScale
                        key={option.key}
                        scaleTo={0.98}
                        duration={150}
                        onPress={() => {
                          onSelect(option.key);
                          onClose();
                        }}
                        accessibilityRole="menuitem"
                        accessibilityState={{ selected: isSelected }}
                        accessibilityLabel={`Sort by ${option.label}`}
                        style={[
                          styles.optionRow,
                          {
                            minHeight: touchTarget.min,
                            backgroundColor: isSelected ? colors.surfaceAlt : 'transparent',
                            borderRadius: radius.button - 2,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.xs,
                            marginBottom: 2,
                          },
                        ]}
                      >
                        <View style={styles.optionLeft}>
                          <MaterialCommunityIcons
                            name={option.icon}
                            size={20}
                            color={iconColor}
                            style={{ marginRight: spacing.sm + 2 }}
                            accessibilityElementsHidden
                            importantForAccessibility="no"
                          />
                          <AppText
                            variant="body"
                            bold={isSelected}
                            style={[
                              styles.optionText,
                              { color: isSelected ? colors.primary : colors.text },
                            ]}
                          >
                            {option.label}
                          </AppText>
                        </View>

                {isSelected && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={colors.primary}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                )}
              </PressableScale>
              );
            })}
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
  menuCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 4,
  },
  closeIconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    flexShrink: 1,
  },
});
