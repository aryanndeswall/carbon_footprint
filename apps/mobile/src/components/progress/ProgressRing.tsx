import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, createAnimatedComponent } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

const AnimatedCircle = createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  score?: number;
  label?: string;
  isZeroState?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 180,
  strokeWidth = 14,
  score,
  label,
  isZeroState = false,
}) => {
  const { colors, typography } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(isZeroState ? 0 : progress, { duration: 800 });
  }, [progress, isZeroState]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - animatedProgress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      accessibilityLabel={label || "Carbon score progress ring"}
    >
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={isZeroState ? "6, 6" : undefined} // Dashed in zero state
        />
        {/* Foreground (Progress) Circle */}
        {!isZeroState && (
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        )}
      </Svg>
      <View style={styles.labelContainer}>
        {isZeroState ? (
          <Text style={[typography.bodyMedium, { color: colors.text_secondary, textAlign: 'center' }]}>
            {"Let's get started!"}
          </Text>
        ) : (
          <>
            {score !== undefined && (
              <Text style={[typography.display, { color: colors.text_primary, lineHeight: 52 }]}>
                {score}
              </Text>
            )}
            {label && (
              <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4, fontWeight: '600' }]}>
                {label}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  labelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
