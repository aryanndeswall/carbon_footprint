import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface PostSimulationCTABarProps {
  onSave: () => void;
  onLogActivity: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

export function PostSimulationCTABar({
  onSave,
  onLogActivity,
  isSaving,
  isSaved,
}: PostSimulationCTABarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.secondaryButton,
          {
            backgroundColor: isSaved ? colors.primary + '1A' : colors.background,
            borderColor: isSaved ? colors.primary : colors.border,
            opacity: isSaving ? 0.6 : 1,
          },
        ]}
        onPress={onSave}
        disabled={isSaving || isSaved}
        accessibilityLabel={isSaved ? 'Scenario saved' : 'Save Scenario'}
        accessibilityRole="button"
      >
        <Text style={[styles.secondaryButtonText, { color: isSaved ? colors.primary : colors.text_primary }]}>
          {isSaved ? '✓ Saved' : isSaving ? 'Saving…' : '💾 Save Scenario'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={onLogActivity}
        accessibilityLabel="Log This Activity"
        accessibilityRole="button"
      >
        <Text style={styles.primaryButtonText}>✅ Log This Activity</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontFamily: 'Outfit',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: 'Outfit',
    fontWeight: '600',
  },
});
