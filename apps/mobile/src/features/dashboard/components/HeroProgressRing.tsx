import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ProgressRing } from '../../../components/progress/ProgressRing';

interface HeroProgressRingProps {
  score: number;
  scoreTrend: string;
  todayEmissions: number;
  dailyLimit: number;
  isZeroState?: boolean;
}

export const HeroProgressRing: React.FC<HeroProgressRingProps> = ({
  score,
  scoreTrend,
  todayEmissions,
  dailyLimit,
  isZeroState = false,
}) => {
  const { colors, spacing, typography } = useTheme();

  // Compute progress ratio (cannot exceed 1.0)
  const progressRatio = isZeroState ? 0 : Math.min(1.0, todayEmissions / dailyLimit);

  return (
    <View style={styles.container}>
      {/* Animated Circular Progress Indicator */}
      <ProgressRing
        progress={progressRatio}
        score={isZeroState ? undefined : score}
        label="Sustainability Score"
        isZeroState={isZeroState}
        size={190}
        strokeWidth={14}
      />

      {/* Trend indicators and emissions subtext (hidden in Zero State) */}
      {!isZeroState ? (
        <View style={[styles.infoContainer, { marginTop: spacing.md }]}>
          <Text style={[typography.bodyMedium, { color: colors.success_text, fontWeight: '700' }]}>
            {scoreTrend}
          </Text>
          <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4 }]}>
            {"Today's Footprint: "}
            <Text style={{ color: colors.text_primary, fontWeight: '700' }}>
              {todayEmissions.toFixed(2)} kg CO₂
            </Text>{' '}
            / {dailyLimit.toFixed(1)} kg limit
          </Text>
        </View>
      ) : (
        <View style={[styles.infoContainer, { marginTop: spacing.md }]}>
          <Text style={[typography.caption, { color: colors.text_secondary, textAlign: 'center' }]}>
            Complete your first daily action to start building your score.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  infoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
