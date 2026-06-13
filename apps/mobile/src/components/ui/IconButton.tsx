import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { LucideIcon } from 'lucide-react-native';

interface IconButtonProps {
  icon: LucideIcon;
  variant?: 'filled' | 'outline' | 'ghost';
  onPress: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
  accessibilityLabel: string;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: IconComponent,
  variant = 'ghost',
  onPress,
  color,
  size = 22,
  style,
  accessibilityLabel,
  disabled = false,
}) => {
  const { colors, spacing } = useTheme();

  const getStyles = (): ViewStyle => {
    const base: ViewStyle = {
      width: 44,
      height: 44,
      borderRadius: 9999, // Circular shape
      justifyContent: 'center',
      alignItems: 'center',
    };

    switch (variant) {
      case 'filled':
        return {
          ...base,
          backgroundColor: colors.primary,
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'ghost':
      default:
        return {
          ...base,
          backgroundColor: 'transparent',
        };
    }
  };

  const getIconColor = () => {
    if (color) return color;
    if (variant === 'filled') return '#FFFFFF';
    return colors.text_primary;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        getStyles(),
        style,
        pressed && { opacity: 0.85, transform: [{ scale: 0.94 }] },
        disabled && { opacity: 0.4 },
      ]}
    >
      <IconComponent size={size} color={getIconColor()} />
    </Pressable>
  );
};
