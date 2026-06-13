import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { StatisticCard } from './StatisticCard';
import { ProfileStatistics } from '../types/profile.types';

interface StatisticsSectionProps {
  statistics: ProfileStatistics;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ statistics }) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
        PROGRESS STATISTICS
      </Text>

      <View style={styles.grid}>
        <StatisticCard
          label="Longest Streak"
          value={`${statistics.longestStreak} Days`}
          subtext="Vaporized vampire draws"
        />

        <StatisticCard
          label="Mission Rate"
          value={`${statistics.missionCompletionRate}%`}
          subtext="Action completion ratio"
        />

        <StatisticCard
          label="Monthly Progress"
          value={`+${statistics.monthlyProgress}%`}
          subtext="Emissions saved trend"
        />

        <StatisticCard
          label="Score Trend"
          value={statistics.scoreTrend === 'up' ? 'Improving' : 'Stable'}
          subtext="Consistent progress"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
