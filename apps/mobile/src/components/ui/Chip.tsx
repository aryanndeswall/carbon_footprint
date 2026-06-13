import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
  textStyle,
}) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`Filter option: ${label}`}
      style={({ pressed }) => [
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          borderRadius: 9999, // Pill shape
          borderWidth: 1,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        },
        selected
          ? {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }
          : {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
        pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
        style,
      ]}
    >
      <Text
        style={[
          typography.bodyMedium,
          {
            fontWeight: '600',
            color: selected ? '#FFFFFF' : colors.text_primary,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};
