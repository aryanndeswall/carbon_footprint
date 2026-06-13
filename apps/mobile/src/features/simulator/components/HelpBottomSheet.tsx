import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface HelpBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const STEPS = [
  { step: '1', text: 'Choose a scenario category (Transport, Food, Energy).' },
  { step: '2', text: 'Adjust the sliders or select a quick preset.' },
  { step: '3', text: 'See your projected score and carbon impact update in real-time.' },
  { step: '4', text: 'Save your scenario or log the activity directly.' },
];

export function HelpBottomSheet({ visible, onClose }: HelpBottomSheetProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} accessibilityLabel="Dismiss" />

        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text_primary }]}>How It Works</Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.border }]}
              onPress={onClose}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Text style={[styles.closeIcon, { color: colors.text_primary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Steps */}
          <View style={styles.steps}>
            {STEPS.map((item) => (
              <View key={item.step} style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text_primary }]}>{item.text}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.gotItButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
            accessibilityLabel="Got it"
            accessibilityRole="button"
          >
            <Text style={styles.gotItText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Outfit',
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  steps: {
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 13,
    fontFamily: 'Outfit',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 22,
    flex: 1,
  },
  gotItButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  gotItText: {
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
