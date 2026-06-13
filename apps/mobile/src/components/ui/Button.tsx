import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const { colors, spacing, roundness, typography } = useTheme();

  const getButtonStyles = (pressed: boolean): ViewStyle => {
    const base: ViewStyle = {
      height: 48,
      borderRadius: roundness.lg,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
    };

    let backgroundStyle: ViewStyle = {};

    switch (variant) {
      case 'secondary':
        backgroundStyle = {
          backgroundColor: pressed ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
        break;
      case 'ghost':
        backgroundStyle = {
          backgroundColor: pressed ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
        };
        break;
      case 'danger':
        backgroundStyle = {
          backgroundColor: colors.error,
          opacity: pressed ? 0.9 : 1.0,
        };
        break;
      case 'primary':
      default:
        backgroundStyle = {
          backgroundColor: colors.primary,
          opacity: pressed ? 0.9 : 1.0,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 2,
        };
        break;
    }

    return {
      ...base,
      ...backgroundStyle,
    };
  };

  const getTextStyles = (): TextStyle => {
    const base: TextStyle = {
      ...typography.bodyMedium,
      fontSize: 16,
      fontWeight: '600',
    };

    switch (variant) {
      case 'secondary':
        return {
          ...base,
          color: colors.text_primary,
        };
      case 'ghost':
        return {
          ...base,
          color: colors.primary,
        };
      case 'danger':
        return {
          ...base,
          color: '#FFFFFF',
        };
      case 'primary':
      default:
        return {
          ...base,
          color: '#FFFFFF',
        };
    }
  };

  const isInteractionDisabled = disabled || loading;

  const handlePress = () => {
    if (!isInteractionDisabled && onPress) {
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isInteractionDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isInteractionDisabled, busy: loading }}
      style={({ pressed }) => [
        getButtonStyles(pressed),
        style,
        isInteractionDisabled && { opacity: 0.5, elevation: 0, shadowOpacity: 0 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={[getTextStyles(), textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};
