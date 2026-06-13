import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'streak' | 'muted';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  textStyle,
}) => {
  const { colors, spacing, roundness, typography } = useTheme();

  const getBadgeStyles = (): ViewStyle => {
    const base: ViewStyle = {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: roundness.sm,
    };

    switch (variant) {
      case 'success':
        return {
          ...base,
          backgroundColor: colors.success_container,
        };
      case 'warning':
        return {
          ...base,
          backgroundColor: colors.warning_container,
        };
      case 'error':
        return {
          ...base,
          backgroundColor: colors.error_container,
        };
      case 'info':
        return {
          ...base,
          backgroundColor: colors.info_container,
        };
      case 'streak':
        return {
          ...base,
          backgroundColor: '#FFF7ED', // light orange
          borderWidth: 1,
          borderColor: colors.streak,
        };
      case 'muted':
      case 'neutral':
      default:
        return {
          ...base,
          backgroundColor: colors.border,
        };
    }
  };

  const getBadgeTextStyles = (): TextStyle => {
    const base: TextStyle = {
      ...typography.caption,
      fontWeight: '600',
      fontSize: 12,
    };

    switch (variant) {
      case 'success':
        return {
          ...base,
          color: colors.success_text,
        };
      case 'warning':
        return {
          ...base,
          color: colors.warning_text,
        };
      case 'error':
        return {
          ...base,
          color: colors.error_text,
        };
      case 'info':
        return {
          ...base,
          color: colors.info_text,
        };
      case 'streak':
        return {
          ...base,
          color: colors.streak,
        };
      case 'muted':
      case 'neutral':
      default:
        return {
          ...base,
          color: colors.text_secondary,
        };
    }
  };

  return (
    <View style={[getBadgeStyles(), style]} accessibilityRole="text" accessibilityLabel={`${variant} status badge: ${label}`}>
      <Text style={[getBadgeTextStyles(), textStyle]}>{label}</Text>
    </View>
  );
};
