import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface PromptChipProps {
  label: string;
  onPress: (label: string) => void;
  disabled?: boolean;
}

export const PromptChip: React.FC<PromptChipProps> = ({
  label,
  onPress,
  disabled = false,
}) => {
  const { colors, spacing, typography, roundness } = useTheme();

  return (
    <Pressable
      onPress={() => onPress(label)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Ask prompt: ${label}`}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: roundness.md,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        },
        pressed && { opacity: 0.8, backgroundColor: colors.border },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={[typography.caption, { color: colors.primary_dim, fontWeight: '600' }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 6,
  },
});
