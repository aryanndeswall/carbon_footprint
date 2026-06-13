import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface QuickActionCardProps {
  label: string;
  onPress: () => void;
  isSimulate?: boolean;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  label,
  onPress,
  isSimulate = false,
}) => {
  const { colors, spacing, roundness, typography } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isSimulate ? "Simulate carbon footprint scenario" : `Log activity: ${label}`}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: colors.surface,
          borderRadius: 20,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderColor: isSimulate ? colors.simulation : colors.border,
          borderWidth: isSimulate ? 1.5 : 1,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          typography.bodyMedium,
          {
            color: isSimulate ? colors.simulation : colors.text_primary,
            fontWeight: isSimulate ? '700' : '600',
          },
        ]}
      >
        {isSimulate ? `🔮 ${label}` : label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    minHeight: 40,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
});
