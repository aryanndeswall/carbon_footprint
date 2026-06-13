import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface SkeletonProps {
  variant?: 'card' | 'list' | 'hero' | 'circle' | 'text';
  width?: DimensionValue;
  height?: DimensionValue;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  style,
}) => {
  const { colors, spacing, roundness } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1, // Infinite loops
      true // Reverse direction
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'card':
        return {
          width: width ?? '100%',
          height: height ?? 120,
          borderRadius: roundness.lg,
          backgroundColor: colors.border,
          padding: spacing.md,
        };
      case 'hero':
        return {
          width: width ?? '100%',
          height: height ?? 200,
          borderRadius: roundness.xl,
          backgroundColor: colors.border,
        };
      case 'circle':
        const circleSize = (height ?? 48) as any;
        return {
          width: circleSize,
          height: circleSize,
          borderRadius: typeof circleSize === 'number' ? circleSize / 2 : 24,
          backgroundColor: colors.border,
        };
      case 'list':
        return {
          width: width ?? '100%',
          height: height ?? 64,
          borderRadius: roundness.md,
          backgroundColor: colors.border,
        };
      case 'text':
      default:
        return {
          width: width ?? '80%',
          height: height ?? 16,
          borderRadius: 4, // Fixed border radius for small text skeletons
          backgroundColor: colors.border,
        };
    }
  };

  return (
    <Animated.View
      style={[
        getVariantStyles(),
        animatedStyle,
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Loading content shimmer"
    />
  );
};
